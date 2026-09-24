import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyTurnstile, createRateLimiter } from "../../shared/turnstile.ts";
import { escapeHtml } from "../../shared/escapeHtml.ts";
import { wrapEmailContent } from "../../shared/emailFooter.ts";

// رفع تذكرة دعم فني عامة (بدون تسجيل دخول). يُولّد رقم تسلسلي JDR-001،
// يخزّن التذكرة (service role)، ويُوجّه إشعاراً بالبريد إلى info@jadara-hr.com.
const limiter = createRateLimiter(10 * 60 * 1000, 5); // 5 تذاكر / 10 دقائق لكل IP

const SUPPORT_EMAIL = "info@jadara-hr.com";

export default async function (req) {
  try {
    const ip = limiter.clientIp(req);
    if (limiter.rateLimited(ip)) {
      return Response.json({ ok: false, error: "محاولات كثيرة، حاول لاحقاً" }, { status: 429 });
    }

    const body = await req.json();
    const category = String(body?.category || "").trim();
    const category_label = String(body?.category_label || "").trim();
    const subcategory = String(body?.subcategory || "").trim();
    const subcategory_label = String(body?.subcategory_label || "").trim();
    const subject = String(body?.subject || "").trim().slice(0, 200);
    const description = String(body?.description || "").trim();
    const client_name = String(body?.client_name || "").trim().slice(0, 200);
    const client_email = String(body?.client_email || "").trim().toLowerCase();
    const client_phone = String(body?.client_phone || "").trim().slice(0, 40);
    const captcha = String(body?.captcha_token || "");
    let attachment_urls: string[] = [];
    try {
      const raw = body?.attachment_urls;
      if (Array.isArray(raw)) attachment_urls = raw.map(String).filter(Boolean).slice(0, 6);
      else if (typeof raw === "string" && raw.trim()) {
        const p = JSON.parse(raw);
        if (Array.isArray(p)) attachment_urls = p.map(String).filter(Boolean).slice(0, 6);
      }
    } catch { attachment_urls = []; }

    if (!category || !description || !client_name || !client_email) {
      return Response.json({ ok: false, error: "الحقول الأساسية مطلوبة" }, { status: 400 });
    }
    if (description.length > 5000) {
      return Response.json({ ok: false, error: "الوصف طويل جداً" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client_email)) {
      return Response.json({ ok: false, error: "البريد غير صالح" }, { status: 400 });
    }
    const ok = await verifyTurnstile(captcha);
    if (!ok) return Response.json({ ok: false, error: "فشل التحقق البشري" }, { status: 400 });

    const base44 = createClientFromRequest(req);

    // توليد رقم تسلسلي JDR-001 — نبحث أعلى رقم موجود ونضيف 1.
    const existing = await base44.asServiceRole.entities.SupportTicket.list("-created_date", 1000);
    let maxNum = 0;
    for (const t of existing || []) {
      const m = String(t.ticket_number || "").match(/JDR-0*(\d+)/i);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    }
    const next = maxNum + 1;
    const ticket_number = `JDR-${String(next).padStart(3, "0")}`;

    const ticket = await base44.asServiceRole.entities.SupportTicket.create({
      ticket_number,
      category,
      category_label,
      subcategory,
      subcategory_label,
      subject: subject || category_label,
      description,
      attachment_urls: JSON.stringify(attachment_urls),
      client_name,
      client_email,
      client_phone,
      status: "open",
      priority: "low",
      reply_history: JSON.stringify([]),
    });

    // إشعار الدعم الفني بالبريد
    const eName = escapeHtml(client_name);
    const eEmail = escapeHtml(client_email);
    const ePhone = escapeHtml(client_phone);
    const eCat = escapeHtml(category_label || category);
    const eSub = escapeHtml(subcategory_label || subcategory || "—");
    const eSubject = escapeHtml(subject || category_label);
    const eDesc = escapeHtml(description);
    const links = attachment_urls.length
      ? attachment_urls.map((u) => `\n- ${u}`).join("")
      : "\n- لا توجد مرفقات";
    const mailBody = `تذكرة دعم فني جديدة برقم ${ticket_number}

الاسم: ${client_name}
البريد: ${client_email}
الجوال: ${client_phone || "—"}

الفئة: ${category_label || category}
نوع المشكلة: ${subcategory_label || subcategory || "—"}
العنوان: ${subject || category_label}

الوصف:
${description}

المرفقات:${links}

— يمكنك الرد على العميل وإدارة التذكرة من بوابة المالك ← قسم «الدعم الفني».`;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: SUPPORT_EMAIL,
        subject: `تذكرة دعم فني ${ticket_number} — ${subject || category_label}`,
        ...wrapEmailContent(mailBody),
        from_name: "الدعم الفني — جداره",
      });
    } catch (_mailErr) {
      // البريد قد يفشل إن لم يُفعّل نطاق مخصّص — التذكرة محفوظة في النظام وقابلة للإدارة من البوابة.
    }

    return Response.json({ ok: true, ticket_number, id: ticket.id });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || "فشل الرفع" }, { status: 500 });
  }
}