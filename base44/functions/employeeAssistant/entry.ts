import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyToken } from "../../shared/portalToken.ts";

// مساعد بوابة الموظف الذاتية — يستقبل رسالة + رمز الجلسة الموقّع، يتحقق منه،
// يجمع سياق الموظف (بياناته وطلباته وحضوره ورواتبه) ويسأل بوابة الذكاء سؤالاً واحداً
// لإجابة الموظف. لا ينفذ إجراءات إنشاء/تعديل (هذه عبر أزرار البوابة) — يكتفي بالإجابة والإرشاد.

const dir = (v: any) => (v == null ? "" : String(v));
const fmt = (arr: any[], fn: (x: any) => string) =>
  (arr || []).map(fn).join(" | ") || "—";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.token || "");
    const employeeId = String(body.employee_id || "");
    const message = String(body.message || "").trim();
    const history: any[] = Array.isArray(body.history) ? body.history.slice(-10) : [];
    if (!token || !employeeId || !message)
      return Response.json({ ok: false, error: "missing" }, { status: 400 });

    const session = await verifyToken(token);
    if (!session.ok || session.employeeId !== employeeId)
      return Response.json({ ok: false, error: "invalid_session" }, { status: 401 });

    const isOwner = employeeId === "owner";
    const emp: any = isOwner
      ? { full_name: Deno.env.get("OWNER_FULL_NAME") || "المالك", position: "المالك", department: "الإدارة", employee_number: "" }
      : await base44.asServiceRole.entities.Employee.get(employeeId);

    const [leaves, loans, trips, attendance, payroll, settlements] = await Promise.all([
      base44.asServiceRole.entities.LeaveRequest.filter({ employee_id: employeeId }, "-created_date", 10),
      base44.asServiceRole.entities.LoanRequest.filter({ employee_id: employeeId }, "-created_date", 10),
      base44.asServiceRole.entities.BusinessTrip.filter({ employee_id: employeeId }, "-created_date", 10),
      base44.asServiceRole.entities.Attendance.filter({ employee_id: employeeId }, "-date", 7),
      base44.asServiceRole.entities.Payroll.filter({ employee_id: employeeId }, "-created_date", 5).catch(() => []),
      base44.asServiceRole.entities.Settlement.filter({ employee_id: employeeId }, "-created_date", 5).catch(() => []),
    ]);

    const ctx = [
      "الاسم: " + dir(emp.full_name),
      "المسمى/الإدارة/الرقم: " + dir(emp.position) + " / " + dir(emp.department) + " / " + dir(emp.employee_number),
      "تاريخ التعيين: " + dir(emp.hire_date) + " | نوع العقد: " + dir(emp.contract_type),
      "الجوال: " + dir(emp.phone) + " | البريد: " + dir(emp.email) + " | العنوان: " + dir(emp.address),
      "جهة الطوارئ: " + dir(emp.emergency_contact),
      "رصيد الإجازات المستحق: " + dir(emp.leave_balance) + " يوم | الاستحقاق السنوي: " + dir(emp.annual_leave_entitlement) + " يوم",
      "استحقاق التذكرة: " + dir(emp.ticket_entitlement),
      "إجازاتي الأخيرة: " + fmt(leaves, (x) => `${x.leave_type} ${x.start_date}→${x.end_date} (${dir(x.days_count)}ي) [${x.status}]`),
      "طلبات السلف الأخيرة: " + fmt(loans, (x) => `${dir(x.amount)}ر ${x.status} أقساط:${dir(x.installment_count)}`),
      "الانتدابات الأخيرة: " + fmt(trips, (x) => `${dir(x.destination)} ${x.start_date}→${x.end_date} [${x.status}]`),
      "آخر حضور: " + fmt(attendance, (x) => `${x.date} دخول:${dir(x.check_in)} خروج:${dir(x.check_out)}`),
      "آخر رواتب: " + fmt(payroll, (x) => `${dir(x.month)}/${dir(x.year)} صافي:${dir(x.net_salary)}`),
    ].join("\n");

    const sys =
      "أنت «مساعد جدارة» للموظف داخل البوابة الذاتية. تجيب بالعربية الفصحى البسيطة، مختصراً وودوداً، اعتماداً على بيانات الموظف المقدّمة فقط. لا تخترع أرقاماً غير موجودة في السياق. إن طلب الموظف إنشاء إجازة/سلفة/انتداب أو تعديل بياناته، أرشدهم لاستخدام الأزرار داخل البوابة لهذا الغرض (لا تنفذ عنهم). إن سأل عن رصيده أو حالة طلباته، أجب من البيانات. لا تطلب معلومات حساسة. كن مهنياً.\n\nبيانات الموظف:\n" + ctx;

    const msgs = [
      { role: "system", content: sys },
      ...history.map((h) => ({ role: h.role === "user" ? "user" : "assistant", content: String(h.content) })),
      { role: "user", content: message },
    ];

    const { baseURL, token: gtoken } = base44.asServiceRole.aiGateway.connection();
    const r = await fetch(baseURL + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + gtoken },
      body: JSON.stringify({ model: "automatic", messages: msgs, temperature: 0.3, max_tokens: 700 }),
    });
    if (!r.ok) return Response.json({ ok: false, error: "llm_failed" }, { status: 502 });
    const j = await r.json();
    const reply = (j?.choices?.[0]?.message?.content || "").trim() || "عذراً، لم أتمكن من صياغة الرد الآن. حاول مرة أخرى.";

    return Response.json({ ok: true, reply });
  } catch (e) {
    return Response.json({ ok: false, error: String((e as any)?.message || e) }, { status: 500 });
  }
}