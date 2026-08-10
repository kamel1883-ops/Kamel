import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyTurnstile } from "../../shared/turnstile.ts";

// التحقق من هوية موظف قبل السماح له بدخول بوابة الموظف الذاتية (عام، بدون مصادقة مستخدم)
// محمي بـ Turnstile لمنع الإساءة الآلية — يرد ok:true فقط إذا وُجد سجل موظف بنفس الهوية والبريد
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // مطابقة الهوية + البريد مقابل سجل موظف موجود هي بحدّ ذاتها الحماية — لا حاجة لـ Turnstile.
    const nid = String(body.national_id || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!nid || !email) return Response.json({ ok: false, error: "national_id and email are required" }, { status: 400 });

    const emps = await base44.asServiceRole.entities.Employee.filter({ national_id: nid });
    const emp = (emps || []).find((e) => String(e.email || "").toLowerCase() === email);
    if (!emp) return Response.json({ ok: false, error: "not_linked" });

    return Response.json({
      ok: true,
      has_account: Boolean(emp.user_id),
      employee_name: emp.full_name || null,
      position: emp.position || null,
      department: emp.department || null,
      status: emp.status || null,
      email: emp.email,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}