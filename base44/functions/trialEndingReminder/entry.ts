import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyCronSecret } from "../../shared/renewal.ts";

const DAY = 1000 * 60 * 60 * 24;
const SUPPORT_EMAIL = "info@jadara-hr.com";

// يرسل تذكيراً عربياً للعملاء في آخر 7 أيام من فترة التجربة أو بعد انتهائها (ولم يحوّلوا لاشتراك بعد).
// يُمنع التكرار عبر حقل trial_reminder_sent على كيان Tenant (يُضبط بعد الإرسال).
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const isCron = verifyCronSecret(body?.cron_secret);
    if (!isCron) {
      let user;
      try { user = await base44.auth.me(); } catch (e) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const horizon = 7 * DAY;
    const tenants = await base44.asServiceRole.entities.Tenant.list("-created_date", 5000);
    const sent = [];

    for (const tt of tenants) {
      if (tt.status !== "trial") continue;
      if (!tt.trial_end) continue;
      if (tt.trial_reminder_sent) continue; // أُرسل مسبقاً — منع التكرار
      const end = new Date(tt.trial_end);
      if (isNaN(end.getTime())) continue;
      const diff = end.getTime() - today.getTime();
      // أرسل في آخر 7 أيام من التجربة أو بعد انتهائها (وبقي العميل على وضع trial)
      if (diff > horizon) continue;

      const to = String(tt.contact_email || "").trim();
      if (to) {
        try {
          const daysLeft = Math.max(0, Math.round(diff / DAY));
          const ended = diff < 0;
          const subject = ended
            ? "انتهت فترة تجربتكم في منصة جدارة"
            : "تذكير: قرب انتهاء فترة التجربة في منصة جدارة";
          const bodyText =
            "السلام عليكم ورحمة الله وبركاته،\n\n" +
            (ended
              ? "نحيطكم علماً بأن فترة التجربة المجانية لحساب منشأتكم في منصة «جدارة» قد انتهت. لمنع توقف الخدمة يرجى إتمام الاشتراك السنوي في أقرب وقت.\n\n"
              : "تبقّى " + daysLeft + " يوماً (أو أقل) على انتهاء فترة التجربة المجانية لحساب منشأتكم في منصة «جدارة». يرجى إتمام الاشتراك السنوي لضمان استمرارية الخدمة.\n\n") +
            "بيانات الحساب:\n" +
            "المنشأة: " + tt.name + "\n" +
            "تاريخ انتهاء التجربة: " + (tt.trial_end || "") + "\n" +
            "عدد الموظفين المتوقع: " + (tt.employee_count || 0) + "\n" +
            "الشريحة: " + (tt.pricing_tier || "-") + "\n\n" +
            "للاشتراك أو الاستفسار — البريد: " + SUPPORT_EMAIL + "\n\n" +
            "مع خالص التقدير،\nفريق دعم جدارة";
          await base44.asServiceRole.integrations.Core.SendEmail({
            to,
            subject,
            body: bodyText,
            from_name: "جدارة",
          });
          sent.push({ id: tt.id, name: tt.name, ended, daysLeft });
        } catch (_) {}
      }
      // علّم أن البلاغ أُرسل لمنع التكرار في التشغيلات القادمة
      try {
        await base44.asServiceRole.entities.Tenant.update(tt.id, { trial_reminder_sent: true });
      } catch (_) {}
    }

    return Response.json({ checked: tenants.length, sent: sent.length, details: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}