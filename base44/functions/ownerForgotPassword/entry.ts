import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyTurnstile } from "../../shared/turnstile.ts";
import { generateResetCode } from "../../shared/ownerAuth.ts";

// طلب استعادة كلمة مرور المالك: يطابق الإقامة + الميلاد + البريد،
// ينشئ رمز 6 أرقام صالح 15 دقيقة ويرسله إلى بريد المالك عبر SendEmail.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const iqama = String(body.iqama || "").trim();
    const birth = String(body.birth_date || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const captchaToken = String(body.captcha_token || "");
    if (!iqama || !birth || !email)
      return Response.json({ ok: false, error: "missing" }, { status: 400 });
    if (!(await verifyTurnstile(captchaToken)))
      return Response.json({ ok: false, error: "captcha_failed" }, { status: 403 });

    const ownerIqama = (Deno.env.get("OWNER_IQAMA") || "").trim();
    const ownerBirth = (Deno.env.get("OWNER_BIRTH_DATE") || "").trim();
    const ownerEmail = (Deno.env.get("OWNER_EMAIL") || "").trim().toLowerCase();

    // ردّ نجاح عام لعدم كشف ما إذا كان البريد صحيحاً — إلا للمالك الحقيقي.
    if (!ownerIqama || !ownerBirth || iqama !== ownerIqama || birth !== ownerBirth || (ownerEmail && email !== ownerEmail))
      return Response.json({ ok: true, sent: true });

    const code = generateResetCode();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const creds = await base44.asServiceRole.entities.OwnerCredential.list("-created_date", 1);
    const cred = creds?.[0] || null;
    if (cred)
      await base44.asServiceRole.entities.OwnerCredential.update(cred.id, { email, reset_code: code, reset_code_expires_at: expiresAt });
    else
      await base44.asServiceRole.entities.OwnerCredential.create({ email, reset_code: code, reset_code_expires_at: expiresAt });

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ownerEmail || email,
        subject: "رمز استعادة كلمة مرور بوابة المالك — جدارة",
        body: `رمز التحقق الخاص بك هو: ${code}\nالرمز صالح لمدة 15 دقيقة.\nإن لم تطلب تغيير كلمة المرور فتجاهل هذه الرسالة.`,
      });
    } catch {}

    return Response.json({ ok: true, sent: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}