import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyToken } from "../../shared/portalToken.ts";
import { escapeHtml } from "../../shared/escapeHtml.ts";
import { wrapEmailContent } from "../../shared/emailFooter.ts";

// إدارة تذاكر الدعم الفني — خاص بمالك النظام فقط (employee_id = "owner").
// الإجراءات: list, reply (رد يُرسل بريداً للعميل), request_info (طلب مستندات إضافية),
// close (إغلاق التذكرة), set_priority, add_note (ملاحظة داخلية).
const todayISO = () => new Date().toISOString().slice(0, 10);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.token || "");
    const employeeId = String(body.employee_id || "");
    const action = String(body.action || "");
    if (!token || !employeeId || !action)
      return Response.json({ ok: false, error: "missing" }, { status: 400 });

    const session = await verifyToken(token);
    if (!session.ok || session.employeeId !== employeeId)
      return Response.json({ ok: false, error: "invalid_session" }, { status: 401 });
    const isOwner = employeeId === "owner";
    if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });

    if (action === "list") {
      const status = String(body.status || "").trim();
      const q = String(body.q || "").trim().toLowerCase();
      let tickets = await base44.asServiceRole.entities.SupportTicket.list("-created_date", 500);
      let arr = tickets || [];
      if (status) arr = arr.filter((t: any) => t.status === status);
      if (q) arr = arr.filter((t: any) => {
        return [t.ticket_number, t.client_name, t.client_email, t.subject, t.category_label]
          .filter(Boolean).some((f) => String(f).toLowerCase().includes(q));
      });
      return Response.json({ ok: true, tickets: arr });
    }

    // ——— رد على العميل (يُرسل بريداً للعميل) ———
    if (action === "reply") {
      const id = String(body.ticket_id || "");
      const message = String(body.message || "").trim();
      if (!id || !message) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const t: any = await base44.asServiceRole.entities.SupportTicket.get(id);
      if (!t) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
      let history: any[] = [];
      try { history = JSON.parse(t.reply_history || "[]"); if (!Array.isArray(history)) history = []; } catch { history = []; }
      history.push({ at: new Date().toISOString(), type: "reply", message });
      const newStatus = t.status === "closed" ? "closed" : "resolved";
      await base44.asServiceRole.entities.SupportTicket.update(id, {
        owner_reply: message,
        reply_history: JSON.stringify(history),
        status: newStatus,
        resolved_date: t.resolved_date || todayISO(),
      });
      const mailBody = `السيد/ة ${t.client_name} المحترم،

تم الرد على تذكرتك رقم ${t.ticket_number} من قبل فريق الدعم الفني في منصة جداره.

الرد:
${message}

يمكنك متابعة تذكرتك عبر بوابة الدعم الفني في موقعنا.

— فريق الدعم الفني — جداره لإدارة الموارد البشرية`;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: t.client_email,
          subject: `رد على تذكرتك ${t.ticket_number} — جداره`,
          ...wrapEmailContent(mailBody),
          from_name: "الدعم الفني — جداره",
        });
      } catch (_e) { /* قد يفشل إرسال بريد لعميل غير مسجّل دون نطاق مخصّص */ }
      return Response.json({ ok: true });
    }

    // ——— طلب مستندات/معلومات إضافية (يُرسل بريداً للعميل) ———
    if (action === "request_info") {
      const id = String(body.ticket_id || "");
      const message = String(body.message || "").trim();
      if (!id || !message) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const t: any = await base44.asServiceRole.entities.SupportTicket.get(id);
      if (!t) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
      let history: any[] = [];
      try { history = JSON.parse(t.reply_history || "[]"); if (!Array.isArray(history)) history = []; } catch { history = []; }
      history.push({ at: new Date().toISOString(), type: "info_request", message });
      await base44.asServiceRole.entities.SupportTicket.update(id, {
        owner_reply: message,
        reply_history: JSON.stringify(history),
        status: "pending_info",
      });
      const mailBody = `السيد/ة ${t.client_name} المحترم،

بخصوص تذكرتك رقم ${t.ticket_number}، نحتاج منك معلومات/مستندات إضافية لمتابعة المعالجة:

${message}

يرجى الرد على هذا البريد أو رفع التفاصيل عبر بوابة الدعم الفني في موقعنا.

— فريق الدعم الفني — جداره لإدارة الموارد البشرية`;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: t.client_email,
          subject: `طلب معلومات إضافية — تذكرتك ${t.ticket_number} — جداره`,
          ...wrapEmailContent(mailBody),
          from_name: "الدعم الفني — جداره",
        });
      } catch (_e) { /* تجاهل فشل الإرسال */ }
      return Response.json({ ok: true });
    }

    // ——— إغلاق التذكرة ———
    if (action === "close") {
      const id = String(body.ticket_id || "");
      if (!id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const t: any = await base44.asServiceRole.entities.SupportTicket.get(id);
      if (!t) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
      let history: any[] = [];
      try { history = JSON.parse(t.reply_history || "[]"); if (!Array.isArray(history)) history = []; } catch { history = []; }
      history.push({ at: new Date().toISOString(), type: "closed" });
      await base44.asServiceRole.entities.SupportTicket.update(id, {
        status: "closed",
        closed_date: todayISO(),
        reply_history: JSON.stringify(history),
      });
      const mailBody = `السيد/ة ${t.client_name} المحترم،

تم إغلاق تذكرتك رقم ${t.ticket_number} بعد معالجتها. إن استمرت الإشكالية أو لديك استفسار آخر، يمكنك فتح تذكرة جديدة عبر بوابة الدعم الفني.

شكراً لثقتك بجداره.

— فريق الدعم الفني — جداره لإدارة الموارد البشرية`;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: t.client_email,
          subject: `تم إغلاق تذكرتك ${t.ticket_number} — جداره`,
          ...wrapEmailContent(mailBody),
          from_name: "الدعم الفني — جداره",
        });
      } catch (_e) { /* تجاهل */ }
      return Response.json({ ok: true });
    }

    // ——— إعادة فتح تذكرة مغلقة ———
    if (action === "reopen") {
      const id = String(body.ticket_id || "");
      if (!id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      await base44.asServiceRole.entities.SupportTicket.update(id, { status: "open", closed_date: null });
      return Response.json({ ok: true });
    }

    // ——— ضبط الأولوية ———
    if (action === "set_priority") {
      const id = String(body.ticket_id || "");
      const priority = String(body.priority || "");
      if (!id || !["low", "medium", "high", "urgent"].includes(priority))
        return Response.json({ ok: false, error: "missing" }, { status: 400 });
      await base44.asServiceRole.entities.SupportTicket.update(id, { priority });
      return Response.json({ ok: true });
    }

    // ——— ملاحظة داخلية (لا تُرسل للعميل) ———
    if (action === "add_note") {
      const id = String(body.ticket_id || "");
      const note = String(body.note || "").trim();
      if (!id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      await base44.asServiceRole.entities.SupportTicket.update(id, { internal_note: note });
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || "fail" }, { status: 500 });
  }
}