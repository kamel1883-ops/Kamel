import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { secrets } from "base44:runtime";
import { verifyCronSecret } from "../../shared/renewal.ts";

const DAY = 1000 * 60 * 60 * 24;

// فحص أسبوعي لتواريخ انتهاء إقامات الموظفين:
// - يُنشئ إشعاراً داخلياً للمالك/الموارد عن الإقامات المنتهية أو الموشكة على الانتهاء خلال 30 يوماً.
// - يُرسل بريداً للمالك (OWNER_EMAIL) إن وُجد.
// يعتمد كلياً على بياناتك الداخلية (حقل iqama_expiry) ولا يستعلم من أبشر.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const isCron = verifyCronSecret(body?.cron_secret);
    if (!isCron) {
      let user;
      try {
        user = await base44.auth.me();
      } catch (e) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizon = 30 * DAY;

    const employees = await base44.asServiceRole.entities.Employee.list("-created_date", 5000);
    const soon = [];
    const expired = [];

    for (const e of employees) {
      if (!e.iqama_expiry) continue;
      const d = new Date(e.iqama_expiry + "T00:00:00");
      if (isNaN(d.getTime())) continue;
      const diff = d.getTime() - today.getTime();
      const days = Math.round(diff / DAY);
      const rec = {
        name: e.full_name || "-",
        number: e.employee_number || "",
        national_id: e.national_id || "",
        expiry: e.iqama_expiry,
        days,
        department: e.department || "",
      };
      if (diff < 0) expired.push(rec);
      else if (diff <= horizon) soon.push(rec);
    }

    if (soon.length === 0 && expired.length === 0) {
      return Response.json({ checked: employees.length, sent: false });
    }

    let text = "";
    if (expired.length > 0) {
      text += "⚠️ إقامات منتهية (" + expired.length + "):\n";
      for (const x of expired)
        text += "• " + x.name + " — " + x.national_id + " — انتهت بتاريخ " + x.expiry + "\n";
      text += "\n";
    }
    if (soon.length > 0) {
      text += "⏳ إقامات تنتهي خلال 30 يوماً (" + soon.length + "):\n";
      for (const x of soon)
        text += "• " + x.name + " — " + x.national_id + " — تنتهي " + x.expiry + " (متبقٍ " + x.days + " يوم)\n";
    }

    const title =
      "تنبيه انتهاء إقامات موظفين" +
      (expired.length > 0 ? " — يوجد " + expired.length + " إقامة منتهية" : "");

    // إشعار داخلي يراه المالك/الموارد في الجرس
    try {
      await base44.asServiceRole.entities.Notification.create({
        title,
        body: text,
        type: "iqama_expiry",
        link: "/employees",
        is_read: false,
      });
    } catch (_) {}

    // بريد للمالك
    let emailed = false;
    const ownerEmail = secrets.get("OWNER_EMAIL");
    if (ownerEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          subject: title,
          body: text,
        });
        emailed = true;
      } catch (_) {}
    }

    return Response.json({
      checked: employees.length,
      soon: soon.length,
      expired: expired.length,
      emailed,
      sent: true,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}