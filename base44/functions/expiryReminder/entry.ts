import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { secrets } from "base44:runtime";
import { verifyCronSecret } from "../../shared/renewal.ts";

const DAY = 1000 * 60 * 60 * 24;
const HORIZON = 30 * DAY;

// تصنيف تاريخ انتهاء: قريب خلال 30 يوماً مستقبلة فقط — المنتهي فعلاً يُستبعد (الغرامة تطبق بعد الانتهاء)
function classify(dateStr, today) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const diff = d.getTime() - today.getTime();
  const days = Math.round(diff / DAY);
  if (diff < 0) return null;
  if (diff <= HORIZON) return { days, status: "soon", expiry: dateStr };
  return null;
}

const CAT = {
  license: "تراخيص المنشأة",
  gov_subscription: "اشتراكات حكومية",
  iqama: "إقامة موظف",
  contract: "عقد وظيفي",
  health_insurance: "تأمين طبي",
  probation: "انتهاء فترة تجربة",
  vehicle_license: "رخصة سير مركبة",
  vehicle_insurance: "تأمين مركبة",
  vehicle_inspection: "فحص دوري مركبة",
};

// فحص أسبوعي شامل لكل الانتهاءات المهمة في النظام:
// تراخيص، اشتراكات حكومية، إقامات، عقود وظيفية، تأمين طبي، رخص/تأمين/فحص مركبات، وفترة تجربة (90 يوماً).
// يُنشئ إشعاراً داخلياً واحداً + بريداً للمالك بكل ما ينتهي خلال 30 يوماً أو منتهٍ بالفعل.
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
      if (user.role !== "admin")
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sr = base44.asServiceRole.entities;
    const items = [];

    // التراخيص
    const licenses = await sr.License.list("-created_date", 2000);
    for (const l of licenses) {
      if (l.not_applicable) continue;
      const c = classify(l.expiry_date, today);
      if (!c) continue;
      items.push({ category: "license", label: l.custom_label || l.license_type || "ترخيص", identifier: l.license_number || "", expiry: c.expiry, days: c.days, status: c.status });
    }

    // اشتراكات حكومية
    const subs = await sr.PlatformSubscription.list("-created_date", 2000);
    for (const s of subs) {
      if (s.not_applicable) continue;
      const c = classify(s.expiry_date, today);
      if (!c) continue;
      items.push({ category: "gov_subscription", label: s.custom_label || s.platform_key || "اشتراك حكومي", identifier: s.account_id || "", expiry: c.expiry, days: c.days, status: c.status });
    }

    // الموظفون: إقامة، عقد، تأمين طبي، فترة تجربة
    const emps = await sr.Employee.list("-created_date", 5000);
    for (const e of emps) {
      if (e.status === "terminated" || e.status === "resigned") continue;
      const iq = classify(e.iqama_expiry, today);
      if (iq) items.push({ category: "iqama", label: e.full_name || "موظف", identifier: e.national_id || e.employee_number || "", expiry: iq.expiry, days: iq.days, status: iq.status });
      const ct = classify(e.contract_end_date, today);
      if (ct) items.push({ category: "contract", label: e.full_name || "موظف", identifier: e.employee_number || e.national_id || "", expiry: ct.expiry, days: ct.days, status: ct.status });
      const hi = classify(e.health_insurance_expiry, today);
      if (hi) items.push({ category: "health_insurance", label: e.full_name || "موظف", identifier: e.national_id || "", expiry: hi.expiry, days: hi.days, status: hi.status });
      if (e.hire_date && e.status === "active") {
        const ph = new Date(e.hire_date + "T00:00:00");
        if (!isNaN(ph.getTime())) {
          const probEnd = new Date(ph.getTime() + 90 * DAY);
          const diff = probEnd.getTime() - today.getTime();
          const days = Math.round(diff / DAY);
          if (diff >= 0 && diff <= HORIZON) {
            items.push({ category: "probation", label: e.full_name || "موظف", identifier: e.employee_number || e.national_id || "", expiry: probEnd.toISOString().slice(0, 10), days, status: "soon" });
          }
        }
      }
    }

    // المركبات: رخصة سير، تأمين، فحص دوري
    const vehicles = await sr.Vehicle.list("-created_date", 2000);
    for (const v of vehicles) {
      const ident = v.plate_number || v.plate_number_en || "";
      const le = classify(v.license_expiry, today);
      if (le) items.push({ category: "vehicle_license", label: "رخصة سير — " + ident, identifier: ident, expiry: le.expiry, days: le.days, status: le.status });
      const ie = classify(v.insurance_expiry, today);
      if (ie) items.push({ category: "vehicle_insurance", label: "تأمين مركبة — " + ident, identifier: v.insurance_number || ident, expiry: ie.expiry, days: ie.days, status: ie.status });
      const pe = classify(v.inspection_expiry, today);
      if (pe) items.push({ category: "vehicle_inspection", label: "فحص دوري — " + ident, identifier: ident, expiry: pe.expiry, days: pe.days, status: pe.status });
    }

    if (items.length === 0) {
      return Response.json({ sent: false, count: 0 });
    }

    const soon = items;

    let text = "";
    if (soon.length > 0) {
      text += "⏳ موشكة على الانتهاء خلال 30 يوماً (" + soon.length + "):\n";
      for (const x of soon) {
        text += "• " + CAT[x.category] + " — " + x.label + " (" + x.identifier + ") — تنتهي " + x.expiry + " (متبقٍ " + x.days + " يوم)\n";
      }
    }

    const title = "تنبيه انتهاءات موشكة — " + soon.length + " بند";

    try {
      await base44.asServiceRole.entities.Notification.create({
        title,
        body: text,
        type: "expiry_reminder",
        link: "/analytics",
        is_read: false,
      });
    } catch (_) {}

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
      sent: true,
      count: items.length,
      soon: soon.length,
      emailed,
      items,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}