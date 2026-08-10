import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { EMAIL_FOOTER } from "../../shared/emailFooter.ts";

// إرسال بريد دعوة مُموَّه لجدارة لمعتمد تمت دعوته (مدير مباشر / مالية) —
// المنصة ترسل رسالة الدعوة الافتراضية الثابتة (بدون شعارنا/بيانات التواصل)، لذا نُرفق هذه الرسالة المُعربة المُموَّهة.
const APPROVERS_LOGIN_URL = "https://jadara-hr.com/login?returnTo=/approvals-portal";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const role = String(body?.role || "manager");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    const roleLabel =
      role === "finance"
        ? "مدير مالي (الصرف النهائي لطلبات الإجازات والسلف ورحلات العمل ونهاية الخدمة)"
        : "مدير مباشر (اعتماد طلبات الإجازات والسلف ورحلات العمل ونهاية الخدمة)";

    const subject = "👑 دعوتكِ كمعتمد في منصة جدارة لإدارة الموارد البشرية";
    const bodyText =
      "بسم الله الرحمن الرحيم\n\n" +
      "مرحباً بك،\n\n" +
      "يسعدنا في «جدارة» أن نعلنك بأنه تمت دعوتك للعمل كمعتمد في منصة جدارة لإدارة الموارد البشرية، بدور:\n" +
      roleLabel + "\n\n" +
      "تم إنشاء حسابك مسبقاً، ولإتمام تفعيل الدخول وضبط كلمة المرور، يُرجى اتباع الخطوات الآتية:\n\n" +
      "1) افتح بوابة المعتمدين عبر الرابط المباشر:\n" + APPROVERS_LOGIN_URL + "\n\n" +
      "2) اضغط «نسيت كلمة المرور؟» وأدخل بريدك الإلكتروني هذا: " + email + "\n" +
      "3) ستصلك رسالة برابط استعادة كلمة المرور — افتحه وعيّن كلمة مرورك الجديدة.\n" +
      "4) بعد ضبط كلمة المرور، سجّل دخولك إلى بوابة الاعتمادات بالبريد كلمة المرور الجديدة.\n\n" +
      "تنبيه: لا تُنشئ حساباً جديداً عبر «إنشاء حساب» لأن حسابك موجود فعلاً (ستظهر رسالة خطأ 403)، بل استخدم «نسيت كلمة المرور» لضبط كلمة المرور.\n\n" +
      "نتطلع لخدمتك ضمن بوابة الاعتمادات في جدارة.\n\n" +
      "تحياتنا — فريق دعم جدارة" + EMAIL_FOOTER;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject,
      body: bodyText,
      from_name: "جدارة",
    });

    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}