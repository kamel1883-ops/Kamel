import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// يُستدعى تلقائياً عبر workflow عند إنشاء/تعديل سجل حضور بحالة "متأخر" أو "غياب".
// ينشئ إشعاراً موجّهاً للموظف (بكل لغات البوابة) ويرسل بريداً للعنوان المسجل لديه.
// تعمل عبر service-role لتفادي قيود RLS (بدون مستخدم Base44 حقيقي).

const LANGS = ["ar", "en", "hi", "ne", "bn", "fil", "ur"];

const MESSAGES = {
  late: {
    ar: { title: "تأخّر في الحضور", body: (d: string, t: string) => `تم تسجيل تأخّر في الحضور بتاريخ ${d}${t ? ` الساعة ${t}` : ""}.` },
    en: { title: "Late arrival", body: (d: string, t: string) => `A late check-in was recorded on ${d}${t ? ` at ${t}` : ""}.` },
    hi: { title: "देरी से आगमन", body: (d: string, t: string) => `${d} को देर से चेक-इन दर्ज किया गया${t ? ` ${t} पर` : ""}.` },
    ne: { title: "ढिलो आगमन", body: (d: string, t: string) => `${d} मा ढिलो चेक-इन रेकर्ड भयो${t ? ` ${t} मा` : ""}.` },
    bn: { title: "বিলম্বে উপস্থিতি", body: (d: string, t: string) => `${d} তারিখে বিলম্বে চেক-ইন রেকর্ড করা হয়েছে${t ? ` ${t} এ` : ""}.` },
    fil: { title: "Huling pagdating", body: (d: string, t: string) => `Naitala ang late check-in noong ${d}${t ? ` sa ${t}` : ""}.` },
    ur: { title: "دیر سے آمد", body: (d: string, t: string) => `${d} کو دیر سے چیک اِن درج ہوا${t ? ` ${t} پر` : ""}.` },
  },
  absent: {
    ar: { title: "غياب عن العمل", body: (d: string) => `تم تسجيل غياب عن العمل بتاريخ ${d}.` },
    en: { title: "Absence", body: (d: string) => `An absence was recorded on ${d}.` },
    hi: { title: "अनुपस्थिति", body: (d: string) => `${d} को अनुपस्थिति दर्ज की गई।` },
    ne: { title: "अनुपस्थिति", body: (d: string) => `${d} मा अनुपस्थिति रेकर्ड भयो।` },
    bn: { title: "অনুপস্থিতি", body: (d: string) => `${d} তারিখে অনুপস্থিতি রেকর্ড করা হয়েছে।` },
    fil: { title: "Kawalan", body: (d: string) => `Naitala ang absence noong ${d}.` },
    ur: { title: "غیر حاضری", body: (d: string) => `${d} کو غیر حاضری درج ہوئی۔` },
  },
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const attendanceId = String(body.attendance_id || "");
    if (!attendanceId) return Response.json({ ok: false, error: "missing" }, { status: 400 });

    const att: any = await base44.asServiceRole.entities.Attendance.get(attendanceId);
    if (!att) return Response.json({ ok: false, error: "not_found" }, { status: 404 });

    const status = String(att.status || "");
    if (status !== "late" && status !== "absent") return Response.json({ ok: true, skipped: true });

    let emp: any = null;
    if (att.employee_id) {
      try { emp = await base44.asServiceRole.entities.Employee.get(att.employee_id); } catch {}
    }

    const dateStr = String(att.date || "");
    const checkIn = String(att.check_in || "");
    const dict: any = MESSAGES[status];
    const i18n: Record<string, { title: string; body: string }> = {};
    for (const lg of LANGS) {
      const m = dict[lg];
      i18n[lg] = { title: m.title, body: status === "late" ? m.body(dateStr, checkIn) : m.body(dateStr) };
    }

    // إنشاء الإشعار موجّهاً للموظف — بكل اللغات (تُعرض للموظف بلغته المختارة بالبوابة)
    await base44.asServiceRole.entities.Notification.create({
      title: i18n.ar.title,
      body: i18n.ar.body,
      type: "attendance",
      employee_id: att.employee_id || "",
      user_id: emp?.user_id || "",
      i18n: JSON.stringify(i18n),
      is_read: false,
    });

    // إرسال بريد إلكتروني للعنوان المسجد لدى الموظف (عربي + إنجليزي) — دون إحباط الإشعار
    if (emp?.email) {
      const subject = `${i18n.ar.title} — ${i18n.en.title}`;
      const emailBody =
        `${i18n.ar.body}\n\n${i18n.en.body}\n\n— منصة جدارة | Jadara HR`;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: emp.email, subject, body: emailBody });
      } catch {}
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}