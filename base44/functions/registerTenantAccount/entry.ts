// بوابة الشركات — تسجيل طلب تفعيل صلاحية الإدارة للمستخدم المسجّل حديثاً.
// لا تُمنح صلاحية admin تلقائياً (تحرّزاً من الترقية الذاتية لصلاحية عامة عبر
// asServiceRole)؛ بل يُسجّل الطلب على المنشأة بانتظار اعتماد المالك من بوابة
// المالك (action: owner_approve_admin في portalData).

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { createRateLimiter } from "../../shared/turnstile.ts";

const rl = createRateLimiter();

export default async function (req) {
  try {
    const ip = rl.clientIp(req);
    if (rl.rateLimited(ip)) {
      return Response.json({ ok: false, retry: true }, { status: 429 });
    }

    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const unified = String(body.unified_number || '').trim();

    let me;
    try { me = await base44.auth.me(); }
    catch { return Response.json({ ok: false, error: 'auth_required' }, { status: 401 }); }
    if (!me || !me.id || !me.email)
      return Response.json({ ok: false, error: 'auth_required' }, { status: 401 });

    const email = String(me.email).trim().toLowerCase();
    if (!unified || !/^7\d{7,11}$/.test(unified))
      return Response.json({ ok: false, error: 'invalid_unified' }, { status: 400 });

    const tenants = await base44.asServiceRole.entities.Tenant.filter(
      { unified_number: unified }, undefined, 50
    );
    const t = (tenants || []).find(
      (tt) => String(tt.contact_email || '').trim().toLowerCase() === email
    );
    if (!t) return Response.json({ ok: false, error: 'no_match' }, { status: 403 });
    if (!['trial', 'active'].includes(t.status))
      return Response.json({ ok: false, error: 'suspended' }, { status: 403 });

    // تسجيل طلب الترقية بانتظار اعتماد المالك — لا asServiceRole.User.update هنا
    if (String(t.admin_status || '') !== 'approved') {
      await base44.asServiceRole.entities.Tenant.update(t.id, {
        admin_status: 'pending',
        admin_user_id: me.id,
        admin_email: email,
      });
    }

    return Response.json({ ok: true, pending_approval: true, tenant_name: t.name, status: t.status });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}