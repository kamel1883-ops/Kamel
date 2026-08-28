import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { signToken } from "../../shared/portalToken.ts";
import { verifyPassword } from "../../shared/ownerAuth.ts";
import { verifyTurnstile } from "../../shared/turnstile.ts";

// دخول بوابة المالك: يطابق رقم الإقامة + الميلاد (أسرار) + كلمة المرور (كيان OwnerCredential).
// لا يعتمد على جدول الموظفين، ولا يظهر المالك كموظف للعملاء.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const iqama = String(body.iqama || "").trim();
    const birth = String(body.birth_date || "").trim();
    const password = String(body.password || "");
    if (!iqama || !birth || !password)
      return Response.json({ ok: false, error: "missing" }, { status: 400 });

    const captcha = String(body.captcha_token || "");
    if (!(await verifyTurnstile(captcha)))
      return Response.json({ ok: false, error: "captcha" }, { status: 400 });

    const ownerIqama = (Deno.env.get("OWNER_IQAMA") || "").trim();
    const ownerBirth = (Deno.env.get("OWNER_BIRTH_DATE") || "").trim();
    if (!ownerIqama || !ownerBirth || iqama !== ownerIqama || birth !== ownerBirth)
      return Response.json({ ok: false, error: "invalid" }, { status: 401 });

    const creds = await base44.asServiceRole.entities.OwnerCredential.list("-created_date", 1);
    const cred = creds?.[0] || null;
    if (!cred || !cred.password_hash || !cred.password_salt)
      return Response.json({ ok: false, error: "setup_required" }, { status: 403 });

    const ok = await verifyPassword(password, cred.password_salt, cred.password_hash);
    if (!ok) return Response.json({ ok: false, error: "wrong_password" }, { status: 401 });

    const token = await signToken("owner");
    let org = null;
    try {
      const orgs = await base44.asServiceRole.entities.Organization.list("-created_date", 1);
      org = orgs?.[0] || null;
    } catch {}
    return Response.json({
      ok: true, token, expires_at: Date.now() + 30 * 24 * 3600 * 1000,
      employee: {
        id: "owner",
        full_name: Deno.env.get("OWNER_FULL_NAME") || "مالك النظام",
        employee_number: "", position: "المالك", department: "الإدارة",
        role_level: "owner", is_approver_manager: false, is_approver_finance: false,
      },
      org: org ? { name: org.name, logo_url: org.logo_url } : null,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}