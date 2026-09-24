import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { wrapEmailContent } from "../../shared/emailFooter.ts";

// رفع تذكرة دعم فني من عميل مسجّل داخل بوابة الشركات (يتطلب تسجيل دخول).
// لا يتطلب كابتشا لأن مقدّم الطلب موثّق عبر جلسة Base44. يُولّد رقم JDR-###،
// يخزّن التذكرة (service role)، ويُوجّه إشعاراً بالبريد إلى info@jadara-hr.com.

const SUPPORT_EMAIL = "info@jadara-hr.com";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, error: "يجب تسجيل الدخول" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const category = String(body?.category || "").trim();
    const category_label = String(body?.category_label || "").trim();
    const subcategory = String(body?.subcategory || "").trim();
    const subcategory_label = String(body?.subcategory_label || "").trim();
    const subject = String(body?.subject || "").trim().slice(0, 200);
    const description = String(body?.description || "").trim();
    let attachment_urls = [];
    try {
      const raw = body?.attachment_urls;
      if (Array.isArray(raw)) attachment_urls = raw.map(String).filter(Boolean).slice(0, 6);
      else if (typeof raw === "string" && raw.trim()) {
        const p = JSON.parse(raw);
        if (Array.isArray(p)) attachment_urls = p.map(String).filter(Boolean).slice(0, 6);
      }
    } catch { attachment_urls = []; }

    if (!category || !description) {
      return Response.json({ ok: false, error: "الحقول الأساسية مطلوبة" }, { status: 400 });
    }
    if (description.length > 5000) {
      return Response.json({ ok: false, error: "الوصف طويل جداً" }, { status: 400 });
    }

    // بيانات مقدّم الطلب من الجلسة + المنشأة المرتبطة (عميل جدارة فعلي)
    const email = String(user.email || "").toLowerCase();
    const client_name = String(user.full_name || "").trim();
    const client_email = email;
    let client_phone = String(body?.client_phone || "").trim().slice(0, 40);
    let tenant_name = "";

    try {
      const tenants = await base44.asServiceRole.entities.Tenant.list("-created_date", 500);
      const t = (tenants || []).find(
        (x) =>
          String(x.admin_email || "").toLowerCase() === email ||
          String(x.contact_email || "").toLowerCase() === email ||
          (x.admin_user_id && x.admin_user_id === user.id)
      );
      if (t) {
        tenant_name = String(t.name || "");
        if (!client_phone) client_phone = String(t.contact_phone || "").trim().slice(0, 40);
      }
    } catch {}

    // توليد رقم تسلسلي JDR-### — نبحث أعلى رقم موجود ونضيف 1.
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

    // إشعار فريق الدعم الفني
    const links = attachment_urls.length
      ? attachment_urls.map((u) => `\n- ${u}`).join("")
      : "\n- لا توجد مرفقات";
    const mailBody = `تذكرة دعم فني جديدة برقم ${ticket_number}${tenant_name ? `\nالمنشأة: ${tenant_name}` : ""}

مقدّم التذكرة (عميل جدارة):
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
    } catch {
      // البريد قد يفشل إن لم يُفعّل نطاق مخصّص — التذكرة محفوظة في النظام وقابلة للإدارة من البوابة.
    }

    return Response.json({
      ok: true,
      ticket_number,
      id: ticket.id,
      client_name,
      client_email,
      client_phone,
      tenant_name,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || "فشل الرفع" }, { status: 500 });
  }
}