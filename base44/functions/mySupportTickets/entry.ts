import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { wrapEmailContent } from "../../shared/emailFooter.ts";

// تذاكر الدعم الفني للعميل المسجّل داخل بوابة الشركات.
// الإجراءات: list (تذاكري السابقة + حالتها + خيط المحادثة)، reply (رد العميل داخل التذكرة).
// يتطلب تسجيل دخول؛ التذاكر مفلترة حسب بريد مقدّم الطلب (client_email === user.email).

const SUPPORT_EMAIL = "info@jadara-hr.com";

function parseHistory(json) {
  try {
    const h = JSON.parse(json || "[]");
    return Array.isArray(h) ? h : [];
  } catch { return []; }
}
function parseAttachments(json) {
  try {
    const a = JSON.parse(json || "[]");
    return Array.isArray(a) ? a : [];
  } catch { return []; }
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, error: "يجب تسجيل الدخول" }, { status: 401 });
    const email = String(user.email || "").toLowerCase();
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "list");

    if (action === "list") {
      const all = await base44.asServiceRole.entities.SupportTicket.list("-created_date", 500);
      const mine = (all || []).filter((t) => String(t.client_email || "").toLowerCase() === email);
      const tickets = mine.map((t) => ({
        id: t.id,
        ticket_number: t.ticket_number,
        category_label: t.category_label,
        subcategory_label: t.subcategory_label,
        subject: t.subject,
        description: t.description,
        status: t.status,
        priority: t.priority,
        owner_reply: t.owner_reply,
        reply_history: parseHistory(t.reply_history),
        attachment_urls: parseAttachments(t.attachment_urls),
        created_date: t.created_date,
        resolved_date: t.resolved_date,
        closed_date: t.closed_date,
      }));
      return Response.json({ ok: true, tickets });
    }

    if (action === "reply") {
      const id = String(body.ticket_id || "");
      const message = String(body.message || "").trim();
      if (!id || !message) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      if (message.length > 5000) return Response.json({ ok: false, error: "long" }, { status: 400 });

      let attachments = [];
      try {
        const raw = body.attachment_urls;
        if (Array.isArray(raw)) attachments = raw.map(String).filter(Boolean).slice(0, 6);
        else if (typeof raw === "string" && raw.trim()) {
          const p = JSON.parse(raw);
          if (Array.isArray(p)) attachments = p.map(String).filter(Boolean).slice(0, 6);
        }
      } catch { attachments = []; }

      const t = await base44.asServiceRole.entities.SupportTicket.get(id);
      if (!t) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
      if (String(t.client_email || "").toLowerCase() !== email)
        return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      if (t.status === "closed")
        return Response.json({ ok: false, error: "closed" }, { status: 400 });

      const history = parseHistory(t.reply_history);
      history.push({ at: new Date().toISOString(), type: "client_reply", message, attachments });
      // إعادة التذكرة لحالة «مفتوحة» ليطّلع عليها الدعم كمتابعة جديدة
      const newStatus = "open";
      await base44.asServiceRole.entities.SupportTicket.update(id, {
        reply_history: JSON.stringify(history),
        owner_reply: message,
        status: newStatus,
      });

      // إشعار فريق الدعم الفني برّد العميل
      const links = attachments.length ? attachments.map((u) => `\n- ${u}`).join("") : "\n- لا توجد مرفقات";
      const mailBody = `ردّ العميل على التذكرة ${t.ticket_number}

العميل: ${t.client_name} — ${t.client_email}

الرد:
${message}

المرفقات:${links}

— تابع المحادثة من بوابة المالك ← قسم «الدعم الفني».`;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: SUPPORT_EMAIL,
          subject: `رد العميل على التذكرة ${t.ticket_number}`,
          ...wrapEmailContent(mailBody),
          from_name: "الدعم الفني — جداره",
        });
      } catch { /* تجاهل فشل البريد */ }

      return Response.json({ ok: true, reply: history[history.length - 1], status: newStatus });
    }

    return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || "fail" }, { status: 500 });
  }
}