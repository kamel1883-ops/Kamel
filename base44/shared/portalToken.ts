// توقيع/تحقّق لرمز جلسة بوابات الموظف الذاتية — مستقل عن نظام مصادقة Base44
// الاستخدام: verifyEmployeePortal يُوقّع الرمز بعد نجاح مطابقة الهوية + الميلاد،
// و portalData / approvalQueue / approvalAction يتحققون منه لاحقاً.

const SECRET = Deno.env.get("CRON_SECRET") || "fallback-portal-secret";

const enc = new TextEncoder();

async function hmac(value) {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function signToken(employeeId, ttlMs = 30 * 24 * 3600 * 1000) {
  const expiresAt = Date.now() + ttlMs;
  const payload = `${employeeId}|${expiresAt}`;
  const sig = await hmac(payload);
  return `${btoa(payload).replace(/=+$/, "")}.${sig}`;
}

export async function verifyToken(token) {
  try {
    const [payloadB64, sig] = String(token || "").split(".");
    if (!payloadB64 || !sig) return { ok: false, employeeId: "", expiresAt: 0 };
    const payload = atob(payloadB64);
    const [employeeId, expiresAtStr] = payload.split("|");
    const expiresAt = parseInt(expiresAtStr, 10);
    if (!employeeId || !expiresAt || Date.now() > expiresAt) return { ok: false, employeeId: "", expiresAt: 0 };
    const expected = await hmac(payload);
    if (expected !== sig) return { ok: false, employeeId: "", expiresAt: 0 };
    return { ok: true, employeeId, expiresAt };
  } catch {
    return { ok: false, employeeId: "", expiresAt: 0 };
  }
}