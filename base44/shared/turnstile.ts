import { secrets } from "base44:runtime";

// تحقق خادمي من رمز Cloudflare Turnstile — يُستخدم لحماية الدوال العامة المفتوحة من الإساءة الآلية
export async function verifyTurnstile(token: string): Promise<boolean> {
  const t = String(token || "");
  if (!t) return false;
  const secret = String(secrets.get("TURNSTILE_SECRET_KEY") || "");
  if (!secret) return false;
  try {
    const vr = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: t }),
    });
    const vdata = await vr.json();
    return Boolean(vdata && vdata.success);
  } catch (_e) {
    return false;
  }
}