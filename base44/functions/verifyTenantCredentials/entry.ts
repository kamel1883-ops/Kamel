import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// بوابة الشركات: التحقق من تطابق البريد + الرقم الموحد مع سجل منشأة موجود.
// دالة عامة (قبل تسجيل الدخول) — تُرجع منطقاً فقط (valid) دون أي بيانات حساسة.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try { body = await req.json(); } catch {}

    const email = String(body.email || '').trim().toLowerCase();
    const unified = String(body.unified_number || '').trim();

    if (!email || !unified || !/^7\d{7,11}$/.test(unified)) {
      return Response.json({ valid: false });
    }

    // الرقم الموحد هو المعرّف الأساسي للمنشأة — نفلتر به ثم نقارن البريد بشكل غير حساس للحالة.
    const tenants = await base44.asServiceRole.entities.Tenant.filter(
      { unified_number: unified },
      undefined,
      50
    );

    const valid = (tenants || []).some(
      (tt) => String(tt.contact_email || '').trim().toLowerCase() === email
    );

    return Response.json({ valid });
  } catch {
    return Response.json({ valid: false });
  }
}