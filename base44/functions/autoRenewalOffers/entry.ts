import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { issueRenewalOffer, verifyCronSecret } from "../../shared/renewal.ts";

const DAY = 1000 * 60 * 60 * 24;

// يُنشئ إشعاراً داخلياً للمالك عن العملاء المشتركين سنوياً الذين تنتهي اشتراكاتهم خلال 30 يوماً (أو انتهت),
// ويُولّد عرض تجديد (Subscription pending) دون أي إيميل. منع التكرار بحقل owner_notified_30_sub.
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
    const horizon = 30 * DAY;

    const tenants = await base44.asServiceRole.entities.Tenant.list("-created_date", 5000);
    const issued = [];
    for (const tt of tenants) {
      if (tt.status !== "active") continue;
      if (!tt.subscription_end) continue;
      const end = new Date(tt.subscription_end);
      if (isNaN(end.getTime())) continue;
      const diff = end.getTime() - today.getTime();
      if (diff > horizon) continue;
      try {
        const daysLeft = Math.max(0, Math.round(diff / DAY));
        const ended = diff < 0;
        if (!tt.owner_notified_30_sub) {
          await base44.asServiceRole.entities.Notification.create({
            title: ended ? "انتهى اشتراك سنوي لعميل" : "اقتراب انتهاء اشتراك سنوي",
            body: "المنشأة: " + tt.name +
              "\nنهاية الاشتراك: " + (tt.subscription_end || "") +
              "\nالمتبقي: " + (ended ? "انتهى" : daysLeft + " يوم") +
              "\nعدد الموظفين: " + (tt.employee_count || 0) + " — الشريحة: " + (tt.pricing_tier || "-") +
              "\nجهة الاتصال: " + (tt.contact_name || "") + " / " + (tt.contact_phone || tt.contact_email || ""),
            type: "sub_ending",
            link: "/owner",
            is_read: false,
          });
        }
        const r = await issueRenewalOffer(base44, tt, {});
        if (!tt.owner_notified_30_sub) await base44.asServiceRole.entities.Tenant.update(tt.id, { owner_notified_30_sub: true });
        issued.push({ id: tt.id, name: tt.name, result: r, daysLeft, ended });
      } catch (_) {}
    }
    return Response.json({ checked: tenants.length, issued: issued.length, details: issued });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}