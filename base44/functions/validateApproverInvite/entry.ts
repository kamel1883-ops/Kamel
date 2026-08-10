import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyTurnstile } from "../../shared/turnstile.ts";

// تحقق من صلاحية رابط دعوة المعتمد عند التسجيل الذاتي (عام، دون مصادقة) — محمي بـ Turnstile.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const captchaToken = String(body.captcha_token || "");
    if (!captchaToken) return Response.json({ ok: false, error: "captcha_required" }, { status: 400 });
    if (!(await verifyTurnstile(captchaToken)))
      return Response.json({ ok: false, error: "captcha_failed" }, { status: 403 });

    const email = String(body.email || "").trim().toLowerCase();
    const token = String(body.invite_token || "").trim();
    if (!email || !token)
      return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });

    const invites = await base44.asServiceRole.entities.ApproverInvite.filter({
      token,
      status: "pending",
    });
    const inv = (invites || []).find(
      (i) => String(i.invite_email || "").toLowerCase() === email
    );
    if (!inv) return Response.json({ ok: false, error: "invalid_invite" });

    return Response.json({ ok: true, role: inv.role });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}