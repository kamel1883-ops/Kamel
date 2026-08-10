import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// بعد إنشاء المعتمد حسابه بنفسه وتسجيل دخوله: نعين دوره (manager/finance) من الدعوة ون/markها كمستخدمة.
// المتصل هو المعتمد نفسه بعد verifyOtp — نتحقق أن بريده يطابق بريد الدعوة.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: "auth_required" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const token = String(body.invite_token || "").trim();
    if (!email || !token)
      return Response.json({ error: "missing_fields" }, { status: 400 });
    if (String(me.email || "").toLowerCase() !== email)
      return Response.json({ error: "email_mismatch" }, { status: 403 });

    const invites = await base44.asServiceRole.entities.ApproverInvite.filter({
      token,
      status: "pending",
    });
    const inv = (invites || []).find(
      (i) => String(i.invite_email || "").toLowerCase() === email
    );
    if (!inv) return Response.json({ error: "invalid_invite" }, { status: 400 });

    const users = await base44.asServiceRole.entities.User.filter({ email });
    const u = (users || []).find(
      (x) => String(x.email || "").toLowerCase() === email
    );
    if (!u) return Response.json({ error: "user_not_found" }, { status: 404 });

    if (u.role !== "admin") {
      await base44.asServiceRole.entities.User.update(u.id, { role: inv.role });
    }
    await base44.asServiceRole.entities.ApproverInvite.update(inv.id, {
      status: "used",
      used_date: new Date().toISOString().slice(0, 10),
    });

    return Response.json({ ok: true, role: inv.role });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}