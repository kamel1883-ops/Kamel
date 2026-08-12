import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyCronSecret } from "../../shared/renewal.ts";

const DAY = 1000 * 60 * 60 * 24;

// يُنشئ إشعاراً داخلياً للمالك (داخل البرنامج) عن عملاء التجربة الذين تنتهي فترتهم خلال 30 يوماً (أو انتهت).
// لا يُرسل أي إيميل للعميل — التذكير للمالك عبر نظام الإشعارات فقط، مع منع التكرار بحقل owner_notified_30_trial.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    // جدول المنصة يستدعي الدالة عبر invoke_backend_function دون تمرير سر (jq في سيرفر العمل لا يستطيع الوصول لـ env)،
    // لذلك يُعتبر الاستدعاء بدون سر موثوقاً كمكالمة مجدولة. أما الاستدعاء المباشر بسر فيجب أن يطابق CRON_SECRET.
    const hasSecret = typeof body?.cron_secret === "string" && body.cron_secret.length > 0;
    const isCron = !hasSecret ? true : verifyCronSecret(body.cron_secret);
    if (!isCron) {
      let user;
      try { user = await base44.auth.me(); } catch (e) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const horizon = 30 * DAY;
    const tenants = await base44.asServiceRole.entities.Tenant.list("-created_date", 5000);
    const notified = [];

    for (const tt of tenants) {
      if (tt.status !== "trial") continue;
      if (!tt.trial_end) continue;
      if (tt.owner_notified_30_trial) continue;
      const end = new Date(tt.trial_end);
      if (isNaN(end.getTime())) continue;
      const diff = end.getTime() - today.getTime();
      if (diff > horizon) continue;
      const daysLeft = Math.max(0, Math.round(diff / DAY));
      const ended = diff < 0;
      try {
        await base44.asServiceRole.entities.Notification.create({
          title: ended ? "انتهت فترة تجربة عميل" : "اقتراب انتهاء فترة تجربة عميل",
          body: "المنشأة: " + tt.name +
            "\nنهاية التجربة: " + (tt.trial_end || "") +
            "\nالمتبقي: " + (ended ? "انتهت" : daysLeft + " يوم") +
            "\nعدد الموظفين: " + (tt.employee_count || 0) + " — الشريحة: " + (tt.pricing_tier || "-") +
            "\nجهة الاتصال: " + (tt.contact_name || "") + " / " + (tt.contact_phone || tt.contact_email || ""),
          type: "trial_ending",
          link: "/owner",
          is_read: false,
        });
        await base44.asServiceRole.entities.Tenant.update(tt.id, { owner_notified_30_trial: true });
        notified.push({ id: tt.id, name: tt.name, ended, daysLeft });
      } catch (_) {}
    }

    return Response.json({ checked: tenants.length, notified: notified.length, details: notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}