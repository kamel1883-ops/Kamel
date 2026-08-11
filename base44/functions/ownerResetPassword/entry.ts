import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { hashPassword } from "../../shared/ownerAuth.ts";

// تعيين كلمة مرور جديدة للمالك: يتحقق من رمز الاستعادة (غير منتهي)،
// ثم يخزّن تجزئة كلمة المرور الجديدة ويمسح الرمز.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const code = String(body.reset_code || "").trim();
    const newPass = String(body.new_password || "");
    if (!code || !newPass || newPass.length < 6)
      return Response.json({ ok: false, error: "invalid" }, { status: 400 });

    const creds = await base44.asServiceRole.entities.OwnerCredential.list("-created_date", 1);
    const cred = creds?.[0] || null;
    if (!cred || !cred.reset_code || cred.reset_code !== code)
      return Response.json({ ok: false, error: "invalid_code" }, { status: 400 });
    if (!cred.reset_code_expires_at || Date.now() > cred.reset_code_expires_at)
      return Response.json({ ok: false, error: "expired_code" }, { status: 400 });

    const { hash, salt } = await hashPassword(newPass);
    await base44.asServiceRole.entities.OwnerCredential.update(cred.id, {
      password_hash: hash, password_salt: salt, reset_code: "", reset_code_expires_at: 0,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}