// إثبات HDF مُوقّع يربط طلب حفظ العقد بسجل المنشأة الذي نشأ في نفس جلسة
// إنشاء التجربة/عرض السعر — يمنع استدعاء saveQuoteContract على سجل عميل آخر (IDOR).

const enc = new TextEncoder();

async function hmac(value) {
  const secret = Deno.env.get("CRON_SECRET") || "";
  if (!secret) throw new Error("CRON_SECRET is not configured");
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function signProof(tenantId) {
  return hmac(`contract::${tenantId}`);
}

export async function verifyProof(tenantId, proof) {
  try {
    if (!proof) return false;
    return (await hmac(`contract::${tenantId}`)) === String(proof);
  } catch {
    return false;
  }
}