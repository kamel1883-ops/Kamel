import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { createRateLimiter, verifyTurnstile } from "../../shared/turnstile.ts";
import { generateResetCode, RESET_CODE_TTL_MS } from "../../shared/ownerAuth.ts";

// طلب استعادة كلمة مرور المالك: يطابق الإقامة + الميلاد + البريد،
// ينشئ رمز 6 أرقام صالح 15 دقيقة ويرسله إلى بريد المالك عبر SendEmail.
// تقييد المعدّل بدلاً من الكابتشا — منع الإفراز المتكرر للبريد مع تشغيل نظيف على كل المتصفحات.
const rl = createRateLimiter(10 * 60 * 1000, 5);

export default async function (req) {
  try {
    const ip = rl.clientIp(req);
    if (rl.rateLimited(ip)) return Response.json({ ok: false, retry: true }, { status: 429 });
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const iqama = String(body.iqama || "").trim();
    const birth = String(body.birth_date || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!iqama || !birth || !email)
      return Response.json({ ok: false, error: "missing" }, { status: 400 });

    const captcha = String(body.captcha_token || "");
    if (!(await verifyTurnstile(captcha)))
      return Response.json({ ok: false, error: "captcha" }, { status: 400 });

    const ownerIqama = (Deno.env.get("OWNER_IQAMA") || "").trim();
    const ownerBirth = (Deno.env.get("OWNER_BIRTH_DATE") || "").trim();
    const ownerEmail = (Deno.env.get("OWNER_EMAIL") || "").trim().toLowerCase();

    // إغلاق صارم: يجب ضبط جميع أسرار المالك — ومنها OWNER_EMAIL — وإلا فلا يمكن إصدار رمز الاستعادة.
    if (!ownerIqama || !ownerBirth || !ownerEmail)
      return Response.json({ ok: false, error: "owner_not_configured" }, { status: 500 });

    // ردّ نجاح عام لعدم كشف ما إذا كانت البيانات صحيحة — إلا للمالك الحقيقي.
    if (iqama !== ownerIqama || birth !== ownerBirth || email !== ownerEmail)
      return Response.json({ ok: true, sent: true });

    const code = generateResetCode();
    const expiresAt = Date.now() + RESET_CODE_TTL_MS;
    const creds = await base44.asServiceRole.entities.OwnerCredential.list("-created_date", 1);
    const cred = creds?.[0] || null;
    // لا نطيل بريد المالك المخزّن من جسم الطلب — تحديث رمز الاستعادة فقط.
    if (cred)
      await base44.asServiceRole.entities.OwnerCredential.update(cred.id, { reset_code: code, reset_code_expires_at: expiresAt, reset_attempts: 0 });
    else
      await base44.asServiceRole.entities.OwnerCredential.create({ email: ownerEmail, reset_code: code, reset_code_expires_at: expiresAt, reset_attempts: 0 });

    let sent = false;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ownerEmail,
        subject: "رمز استعادة كلمة مرور بوابة المالك — جدارة",
        body: `رمز التحقق الخاص بك هو: ${code}\nالرمز صالح لمدة 15 دقيقة.\nإن لم تطلب تغيير كلمة المرور فتجاهل هذه الرسالة.`,
      });
      sent = true;
    } catch {}

    // SendEmail يصل فقط لمستخدمين مسجّلين في التطبيق — إذا فشل الإرسال نُبلّغ المالك بوضوح.
    if (!sent) return Response.json({ ok: false, error: "email_failed" }, { status: 502 });

    return Response.json({ ok: true, sent: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}