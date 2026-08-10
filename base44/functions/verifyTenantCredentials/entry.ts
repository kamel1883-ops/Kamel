import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";

// بوابة الشركات: التحقق من تطابق البريد + الرقم الموحد مع سجل منشأة موجود.
// دالة عامة (قبل تسجيل الدخول) — محمية بـ Turnstile وتقييد المعدل لمنع استعراض البيانات.

async function verifyTurnstile(token: string): Promise<boolean> {
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

// أفضل جهد: تقييد المعدل داخل نفس النسخة النشطة (in-memory).
const WINDOW_MS = 10 * 60 * 1000; // 10 دقائق
const MAX_PER_IP = 5;
const hits = new Map<string, number[]>();

function clientIp(req): string {
  const h = (req.headers || {});
  const direct = h.get && (h.get('cf-connecting-ip') || h.get('x-forwarded-for') || h.get('x-real-ip'));
  if (direct) return String(direct).split(',')[0].trim();
  if (h['cf-connecting-ip']) return String(h['cf-connecting-ip']).split(',')[0].trim();
  if (h['x-forwarded-for']) return String(h['x-forwarded-for']).split(',')[0].trim();
  return 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_IP) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

export default async function (req) {
  try {
    const ip = clientIp(req);
    if (rateLimited(ip)) {
      return Response.json({ valid: false, retry: true }, { status: 429 });
    }

    const base44 = createClientFromRequest(req);
    let body = {};
    try { body = await req.json(); } catch {}

    // تحقق بشري إلزامي — يمنع الاستعراض الآلي لبريد المنشآت وأرقامها الموحدة.
    const turnstileOk = await verifyTurnstile(String(body.turnstileToken || ''));
    if (!turnstileOk) {
      return Response.json({ valid: false, captcha: false });
    }

    const email = String(body.email || '').trim().toLowerCase();
    const unified = String(body.unified_number || '').trim();

    if (!email || !unified || !/^7\d{7,11}$/.test(unified)) {
      return Response.json({ valid: false });
    }

    // الرقم الموحد هو المعرّف الأساسي للمنشأة — نفلتر به ثم نقارن البريد بشكل غير حساس للحالة.
    const tenants = await base44.asServiceRole.entities.Tenant.filter(
      { unified_number: unified },
      undefined,
      50
    );

    const valid = (tenants || []).some(
      (tt) => String(tt.contact_email || '').trim().toLowerCase() === email
    );

    return Response.json({ valid });
  } catch {
    return Response.json({ valid: false });
  }
}