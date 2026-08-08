import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyTurnstile } from "../../shared/turnstile.ts";

// التحقق أن البريد مفعّل للاشتراك قبل السماح بالتسجيل في بوابة الشركات (عام، بدون مصادقة)
// محمي بـ Turnstile لمنع الإساءة الآلية
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const captchaToken = String(body.captcha_token || "");
    if (!captchaToken) return Response.json({ ok: false, error: "captcha_required" }, { status: 400 });
    if (!(await verifyTurnstile(captchaToken))) return Response.json({ ok: false, error: "captcha_failed" }, { status: 403 });

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