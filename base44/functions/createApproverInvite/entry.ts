import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { EMAIL_FOOTER } from "../../shared/emailFooter.ts";

// توليد دعوة معتمد ذاتية التسجيل: لا نُنشئ حساباً مسبقاً.
// نُولّد رمزاً يربط برابط تسجيل يفتحه المعتمد بنفسه وينشئ حسابه ويختار كلمة مروره.
// محاولة إرسال آلي للرابط بريدياً (تعمل فقط إن كان البريد مسجّلاً مسبقاً على المنصة)؛
// وإلا يُرجع الرابط للأدمن لينسخه ويرسله عبر واتساب.
const REGISTER_URL = (token) =>
  `https://jadara-hr.com/register?returnTo=/approvals-portal&invite=${encodeURIComponent(token)}`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const role = String(body?.role || "manager");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return Response.json({ error: "Invalid email" }, { status: 400 });
    if (role !== "manager" && role !== "finance")
      return Response.json({ error: "Invalid role" }, { status: 400 });

    // إلغاء أي دعوة سابقة معلّقة لنفس البريد (تبقى الأحدث فعّالة)
    try {
      const existing = await base44.asServiceRole.entities.ApproverInvite.filter({
        invite_email: email,
        status: "pending",
      });
      for (const ex of existing || []) {
        await base44.asServiceRole.entities.ApproverInvite.update(ex.id, { status: "revoked" });
      }
    } catch (e) { /* تجاهل */ }

    const token = crypto.randomUUID();
    await base44.entities.ApproverInvite.create({
      invite_email: email,
      role,
      status: "pending",
      token,
    });

    const link = REGISTER_URL(token);
    let emailed = false;
    try {
      const roleLabel =
        role === "finance"
          ? "مدير مالي (الصرف النهائي لطلبات الإجازات والسلف ورحلات العمل ونهاية الخدمة)"
          : "مدير مباشر (اعتماد طلبات الإجازات والسلف ورحلات العمل ونهاية الخدمة)";
      const subject = "👑 رابط إنشاء حسابك في بوابة المعتمدين بمنصة جدارة";
      const bodyText =
        "بسم الله الرحمن الرحيم\n\n" +
        "مرحباً بك،\n\n" +
        "تمت دعوتك للعمل كمعتمد في منصة «جدارة» لإدارة الموارد البشرية، بدور:\n" +
        roleLabel + "\n\n" +
        "أنشئ حسابك بنفسك واختر كلمة المرور التي تريد عبر الرابط الآتي:\n" +
        link + "\n\n" +
        "أدخل بريدك نفسه الذي وصلك عليه هذا الإيميل، ثم اضبط كلمة المرور وأكّدها وأكمل إنشاء الحساب. سيحوّل إنشاؤك تلقائياً إلى بوابة الاعتمادات.\n\n" +
        "تنبيه: الرابط مخصّص لبريدك ولا يعمل مع بريد آخر.\n\n" +
        "تحياتنا — فريق دعم جدارة" + EMAIL_FOOTER;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject,
        body: bodyText,
        from_name: "جدارة",
      });
      emailed = true;
    } catch (e) { emailed = false; }

    return Response.json({ ok: true, link, emailed });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}