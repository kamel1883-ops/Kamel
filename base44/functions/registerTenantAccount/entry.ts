// بوابة الشركات — تفعيل صلاحية الإدارة للمستخدم المسجّل حديثاً.
// تُستدعى بعد OTP (المستخدم مسجّل دخول) للتأكد أن بريده يطابق سجل منشأة (تجربة/فعّال)
// ثم ترفع دوره إلى admin ليتمكن من الدخول لبوابة الشركات وإدارة بياناته.

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

    // المستخدم الحالي (المسجّل دخول حديثاً عبر OTP)
    let me;
    try { me = await base44.auth.me(); }
    catch { return Response.json({ ok: false, error: 'auth_required' }, { status: 401 }); }
    if (!me || !me.id || !me.email)
      return Response.json({ ok: false, error: 'auth_required' }, { status: 401 });

    const email = String(me.email).trim().toLowerCase();
    if (!unified || !/^7\d{7,11}$/.test(unified))
      return Response.json({ ok: false, error: 'invalid_unified' }, { status: 400 });

    // التطابق مع سجل المنشأة: نفس الرقم الموحد + نفس البريد (البريد المقدّم في طلب التجربة/عرض السعر)
    const tenants = await base44.asServiceRole.entities.Tenant.filter(
      { unified_number: unified }, undefined, 50
    );
    const t = (tenants || []).find(
      (tt) => String(tt.contact_email || '').trim().toLowerCase() === email
    );
    if (!t) return Response.json({ ok: false, error: 'no_match' }, { status: 403 });
    if (!['trial', 'active'].includes(t.status))
      return Response.json({ ok: false, error: 'suspended' }, { status: 403 });

    // ترقية المستخدم إلى admin إذا لم يكن كذلك — طعميله الدخول لبوابة الشركات (/app)
    if (me.role !== 'admin') {
      await base44.asServiceRole.entities.User.update(me.id, { role: 'admin' });
    }

    return Response.json({ ok: true, tenant_name: t.name, status: t.status });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}