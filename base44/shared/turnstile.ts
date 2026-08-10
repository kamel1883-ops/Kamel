import { secrets } from "base44:runtime";

// تحقق خادمي من رمز Cloudflare Turnstile — يُستخدم لحماية الدوال العامة المفتوحة من الإساءة الآلية
export async function verifyTurnstile(token: string): Promise<boolean> {
  const t = String(token || "");
  if (!t) return false;
  // رمز الاختبار الوهمي الرسمي من Cloudflare (عند استخدام مفتاح الموقع 1x00000000000000000000AA) — يمرّر دائماً.
  if (t === "XXXX.DUMMY.TOKEN.XXXX") return true;
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

// تقييد المعدّل داخل النسخة النشطة (in-memory) — بسيط وبأفضل جهد.
export interface RateLimiter {
  clientIp(req: any): string;
  rateLimited(ip: string): boolean;
}

export function createRateLimiter(windowMs = 10 * 60 * 1000, maxPerIp = 5): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    clientIp(req): string {
      const h = (req.headers || {});
      const direct = h.get && (h.get('cf-connecting-ip') || h.get('x-forwarded-for') || h.get('x-real-ip'));
      if (direct) return String(direct).split(',')[0].trim();
      if (h['cf-connecting-ip']) return String(h['cf-connecting-ip']).split(',')[0].trim();
      if (h['x-forwarded-for']) return String(h['x-forwarded-for']).split(',')[0].trim();
      return 'unknown';
    },
    rateLimited(ip: string): boolean {
      const now = Date.now();
      const arr = (hits.get(ip) || []).filter((x) => now - x < windowMs);
      if (arr.length >= maxPerIp) { hits.set(ip, arr); return true; }
      arr.push(now); hits.set(ip, arr); return false;
    },
  };
}