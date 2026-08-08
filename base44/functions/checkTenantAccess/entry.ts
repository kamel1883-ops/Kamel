import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// التحقق أن البريد مفعّل للاشتراك (مرتبط بعميل حالة تجربة أو فعّال) قبل السماح بالتسجيل في بوابة الشركات
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return Response.json({ ok: false, error: "email required" }, { status: 400 });

    const tenants = await base44.asServiceRole.entities.Tenant.filter({});
    const t = (tenants || []).find(
      (x) => String(x.contact_email || "").toLowerCase() === email && ["trial", "active"].includes(x.status)
    );
    if (!t) return Response.json({ ok: false, error: "not_activated" });

    return Response.json({ ok: true, tenant_name: t.name, status: t.status });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}