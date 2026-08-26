import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyTurnstile, createRateLimiter } from "../../shared/turnstile.ts";
import { EMAIL_FOOTER } from "../../shared/emailFooter.ts";
import { escapeHtml } from "../../shared/escapeHtml.ts";

// تسجيل شريك جديد في برنامج شركاء جدارة (عمولة 7% من أول اشتراك فقط).
// يُولّد رمزاً مرجعياً فريداً للشريك، ويُنشئ سجلاً بحالة "pending" لاعتماد المالك من بوابته.
const RL = createRateLimiter(10 * 60 * 1000, 5);

const genCode = () => {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return "JD-" + s;
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (RL.rateLimited(RL.clientIp(req)))
      return Response.json({ ok: false, error: "طلبات كثيرة، يرجى المحاولة لاحقاً" }, { status: 429 });

    const full_name = String(body.full_name || "").trim().slice(0, 200);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 200);
    const phone = String(body.phone || "").trim().slice(0, 40);
    const channel = String(body.channel || "").trim().slice(0, 200);
    const about = String(body.about || "").trim().slice(0, 2000);
    if (!full_name) return Response.json({ ok: false, error: "الاسم مطلوب" }, { status: 400 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return Response.json({ ok: false, error: "بريد إلكتروني صحيح مطلوب" }, { status: 400 });
    if (phone.replace(/\D/g, "").length < 9)
      return Response.json({ ok: false, error: "رقم جوال صحيح مطلوب" }, { status: 400 });

    const captchaToken = String(body.captcha_token || "");
    if (!captchaToken) return Response.json({ ok: false, error: "التحقق البشري مطلوب" }, { status: 400 });
    if (!(await verifyTurnstile(captchaToken)))
      return Response.json({ ok: false, error: "فشل التحقق البشري" }, { status: 403 });

    // شريك واحد لكل بريد — لا تُنشأ سجلات مكرّرة ولا رموز إحالة متعددة لنفس الشخص
    const existing = await base44.asServiceRole.entities.Affiliate.filter({ email }, undefined, 5);
    if (existing && existing.length)
      return Response.json({ ok: true, duplicate: true, ref_code: existing[0].ref_code });

    // رمز مرجعي فريد
    let ref_code = "";
    for (let i = 0; i < 6; i++) {
      const candidate = genCode();
      const taken = await base44.asServiceRole.entities.Affiliate.filter({ ref_code: candidate }, undefined, 1);
      if (!taken || !taken.length) { ref_code = candidate; break; }
    }
    if (!ref_code) return Response.json({ ok: false, error: "تعذّر توليد رمز مرجعي" }, { status: 500 });

    const created = await base44.asServiceRole.entities.Affiliate.create({
      full_name, email, phone, channel, about,
      ref_code,
      commission_percent: 7,
      status: "pending",
      joined_date: new Date().toISOString().slice(0, 10),
    });

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "info@jadara-hr.com",
        subject: "طلب انضمام جديد — برنامج شركاء جدارة",
        body:
          "طلب انضمام جديد لبرنامج شركاء جدارة (عمولة 7% من أول اشتراك فقط):\n\n" +
          "الاسم: " + escapeHtml(full_name) + "\n" +
          "البريد: " + escapeHtml(email) + "\n" +
          "الجوال: " + escapeHtml(phone) + "\n" +
          "قناة الترويج: " + escapeHtml(channel || "-") + "\n" +
          "نبذة: " + escapeHtml(about || "-") + "\n\n" +
          "الرمز المرجعي المُولَّد: " + ref_code + "\n" +
          "اعتمد الشريك من بوابة المالك › برنامج الشركاء لتفعيل رابط الإحالة الخاص به." +
          EMAIL_FOOTER,
      });
    } catch (_e) {}

    return Response.json({ ok: true, id: created.id, ref_code });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}