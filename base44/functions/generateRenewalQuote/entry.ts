import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { issueRenewalOffer } from "../../shared/renewal.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    let user;
    try { user = await base44.auth.me(); } catch (e) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const tenantId = String(body.tenant_id || "").trim();
    if (!tenantId) return Response.json({ error: "tenant_id مطلوب" }, { status: 400 });

    const tenant = await base44.asServiceRole.entities.Tenant.get(tenantId);
    if (!tenant) return Response.json({ error: "العميل غير موجود" }, { status: 404 });

    const res = await issueRenewalOffer(base44, tenant, { resend: !!body.resend });
    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}