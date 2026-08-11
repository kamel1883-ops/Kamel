import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { signToken } from "../../shared/portalToken.ts";
import { verifyTurnstile } from "../../shared/turnstile.ts";

// بوابة الموظف الذاتية — دخول برقم الهوية/الإقامة + تاريخ الميلاد فقط،
// دون كلمة مرور أو بريد. متاح للموظفين المسجّلين والمنتمين لمنشأة فقط.
// عند المطابقة يُوقّع رمز جلسة (HMAC) صالح 30 يوماً يُستخدم للوصول للبيانات والطلبات.
// (إعادة النشر — وحدة Turnstile تدعم رمز الاختبار الوهمي الرسمي.)

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const nid = String(body.national_id || "").trim();
    const birthDate = String(body.birth_date || "").trim();
    if (!nid || !birthDate)
      return Response.json({ ok: false, error: "missing" }, { status: 400 });

    // التحقق البشري (Turnstile) — تحمي بوابة الدخول العامة من المحاولات الآلية
    const captchaToken = String(body.captcha_token || "");
    if (!captchaToken) return Response.json({ ok: false, error: "captcha_required" }, { status: 400 });
    if (!(await verifyTurnstile(captchaToken))) return Response.json({ ok: false, error: "captcha_failed" }, { status: 403 });

    // المالك الآن يدخل حصراً عبر verifyOwnerLogin (إقامة + ميلاد + كلمة مرور).
    // لا يُمنح وصول المالك من هنا بالإقامة والميلاد فقط — حماية لكلمة المرور.
    const emps = await base44.asServiceRole.entities.Employee.filter({ national_id: nid });
    const emp = (emps || []).find((e) => (e.birth_date || "").slice(0, 10) === birthDate);
    if (!emp) return Response.json({ ok: false, error: "not_linked" });
    if (emp.status && emp.status !== "active" && emp.status !== "on_leave")
      return Response.json({ ok: false, error: "inactive" });

    const token = await signToken(emp.id);

    let org = null;
    try {
      const orgs = await base44.asServiceRole.entities.Organization.list("-created_date", 1);
      org = orgs?.[0] || null;
    } catch {}

    return Response.json({
      ok: true,
      token,
      expires_at: Date.now() + 30 * 24 * 3600 * 1000,
      employee: {
        id: emp.id,
        full_name: emp.full_name,
        employee_number: emp.employee_number,
        position: emp.position,
        department: emp.department,
        role_level: emp.role_level || "employee",
        is_approver_manager: !!emp.is_approver_manager,
        is_approver_finance: !!emp.is_approver_finance,
      },
      org: org ? { name: org.name, logo_url: org.logo_url } : null,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}