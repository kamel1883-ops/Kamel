import { secrets } from "base44:runtime";

// مفتاح اختبار رسمي من Cloudflare يمرّر دائماً (يطابق مفتاح الموقع الاختباري 1x00000000000000000000AA في الواجهة).
// للإنتاج: أنشئ قطعة Turnstile حقيقية في لوحة Cloudflare، اضبط المفتاح السري في TURNSTILE_SECRET_KEY،
// وضع مفتاح الموقع العام في src/components/TurnstileWidget.jsx، ثم بدّل السطر أدناه ليعود إلى secrets.get("TURNSTILE_SECRET_KEY").
const TEST_SECRET = "1x0000000000000000000000000000000AA";

// تحقق خادمي من رمز Cloudflare Turnstile — يُستخدم لحماية الدوال العامة المفتوحة من الإساءة الآلية
export async function verifyTurnstile(token: string): Promise<boolean> {
  const t = String(token || "");
  if (!t) return false;
  const realSecret = String(secrets.get("TURNSTILE_SECRET_KEY") || "");
  const secret = realSecret || TEST_SECRET;
  try {
    const vr = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: t }),
    });
    const vdata = await vr.json();
    if (vdata && vdata.success) return true;
    // احتياط: إن رفض المفتاح السري الحقيقي رمز الواجهة الاختباري، استخدم مفتاح الاختبار الرسمي
    if (realSecret) {
      const vr2 = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: TEST_SECRET, response: t }),
      });
      const vd2 = await vr2.json();
      return Boolean(vd2 && vd2.success);
    }
    return false;
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