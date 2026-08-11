// أدوات تجزئة كلمة المرور ورَمز استعادة المالك — مستقل عن نظام مصادقة Base44.
const enc = new TextEncoder();
const bufToHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const hexToBytes = (hex) => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
};

export async function hashPassword(password, saltHex) {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  return { hash: bufToHex(bits), salt: bufToHex(salt) };
}

export async function verifyPassword(password, saltHex, hashHex) {
  if (!saltHex || !hashHex) return false;
  const { hash } = await hashPassword(password, saltHex);
  return hash === hashHex;
}

export const generateResetCode = () => String(Math.floor(100000 + Math.random() * 900000));