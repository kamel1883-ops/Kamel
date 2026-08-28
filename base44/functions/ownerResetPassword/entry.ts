import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { hashPassword } from "../../shared/ownerAuth.ts";
import { createRateLimiter, verifyTurnstile } from "../../shared/turnstile.ts";

// تعيين كلمة مرور جديدة للمالك: يتحقق من رمز الاستعادة (غير منتهٍ) مع تقييد المعدّل
// وقفل بعد عدد محاولات فاشل، ثم يخزّن تجزئة كلمة المرور الجديدة ويمسح الرمز والمحاولات.

const MAX_ATTEMPTS = 5;
const rl = createRateLimiter(10 * 60 * 1000, 8);

export default async function (req) {
  try {
    const ip = rl.clientIp(req);
    if (rl.rateLimited(ip)) return Response.json({ ok: false, retry: true }, { status: 429 });

    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const code = String(body.reset_code || "").trim();
    const newPass = String(body.new_password || "");
    if (!code || !newPass || newPass.length < 6)
      return Response.json({ ok: false, error: "invalid" }, { status: 400 });

    const captcha = String(body.captcha_token || "");
    if (!(await verifyTurnstile(captcha)))
      return Response.json({ ok: false, error: "captcha" }, { status: 400 });

    // إغلاق صارم: لا يمكن إعادة التعيين ما لم يُضبط بريد المالك المسؤول عن استلام الرمز.
    const ownerEmail = (Deno.env.get("OWNER_EMAIL") || "").trim().toLowerCase();
    if (!ownerEmail)
      return Response.json({ ok: false, error: "owner_not_configured" }, { status: 500 });

    const creds = await base44.asServiceRole.entities.OwnerCredential.list("-created_date", 1);
    const cred = creds?.[0] || null;
    if (!cred) return Response.json({ ok: false, error: "invalid_code" }, { status: 400 });

    // ربط الرمز ببريد المالك المضبوط فقط — لمنع استغلال أي رمز قُدِّم لجهة أخرى.
    if ((String(cred.email || "").trim().toLowerCase() || "") !== ownerEmail)
      return Response.json({ ok: false, error: "invalid_code" }, { status: 400 });

    // قفل بعد تجاوز المحاولات — يُلغى الرمز نهائياً لمنع التخمين
    const attempts = Number(cred.reset_attempts) || 0;
    if (attempts >= MAX_ATTEMPTS) {
      if (cred.reset_code) {
        await base44.asServiceRole.entities.OwnerCredential.update(cred.id, {
          reset_code: "", reset_code_expires_at: 0,
        });
      }
      return Response.json({ ok: false, error: "locked" }, { status: 429 });
    }

    if (!cred.reset_code || cred.reset_code !== code) {
      await base44.asServiceRole.entities.OwnerCredential.update(cred.id, {
        reset_attempts: attempts + 1,
      });
      return Response.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    if (!cred.reset_code_expires_at || Date.now() > cred.reset_code_expires_at) {
      await base44.asServiceRole.entities.OwnerCredential.update(cred.id, {
        reset_code: "", reset_code_expires_at: 0, reset_attempts: 0,
      });
      return Response.json({ ok: false, error: "expired_code" }, { status: 400 });
    }

    const { hash, salt } = await hashPassword(newPass);
    await base44.asServiceRole.entities.OwnerCredential.update(cred.id, {
      password_hash: hash, password_salt: salt,
      reset_code: "", reset_code_expires_at: 0, reset_attempts: 0,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}