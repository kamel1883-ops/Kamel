import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { issueRenewalOffer, cronSecret } from "../../shared/renewal.ts";

const DAY = 1000 * 60 * 60 * 24;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const isCron = String(body?.cron_secret || "") === cronSecret();
    if (!isCron) {
      let user;
      try { user = await base44.auth.me(); } catch (e) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const horizon = 14 * DAY;

    const tenants = await base44.asServiceRole.entities.Tenant.list("-created_date", 5000);
    const issued = [];
    for (const tt of tenants) {
      if (tt.status !== "active") continue;
      if (!tt.subscription_end) continue;
      const end = new Date(tt.subscription_end);
      if (isNaN(end.getTime())) continue;
      const diff = end.getTime() - today.getTime();
      // تولّد العرض للعملاء الذين ينتهي اشتراكهم خلال 14 يوماً أو انتهى فعلاً ولم يُوقف
      if (diff > horizon) continue;
      try {
        const r = await issueRenewalOffer(base44, tt, {});
        issued.push({ id: tt.id, name: tt.name, result: r });
      } catch (_) {}
    }
    return Response.json({ checked: tenants.length, issued: issued.length, details: issued });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}