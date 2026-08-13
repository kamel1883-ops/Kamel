import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { signToken } from "../../shared/portalToken.ts";
import { verifyTurnstile, createRateLimiter } from "../../shared/turnstile.ts";
import { generateResetCode } from "../../shared/ownerAuth.ts";

// بوابة الموظف الذاتية — دخول برقم الهوية/الإقامة + تاريخ الميلاد.
// المعتمدون (مدير/مالية/موارد) يحتاجون عامل ثانٍ: OTP يُرسل إلى بريدهم المسجّل
// (إن أمكن إيصاله)، وتُختصر مدة جلستهم، ويُرسَل إشعار بالدخول لكشف الانتحال.
// عند المطابقة يُوقّع رمز جلسة (HMAC) يُستخدم للوصول لـ portalData.

const rl = createRateLimiter(10 * 60 * 1000, 10);
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const APPROVER_TTL_MS = 8 * 3600 * 1000;
const EMPLOYEE_TTL_MS = 30 * 24 * 3600 * 1000;

export default async function (req) {
  try {
    const ip = rl.clientIp(req);
    if (rl.rateLimited(ip))
      return Response.json({ ok: false, error: "rate_limited", retry: true }, { status: 429 });

    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const nid = String(body.national_id || "").trim();
    const birthDate = String(body.birth_date || "").trim();
    const otp = String(body.otp || "").trim();
    if (!nid || !birthDate)
      return Response.json({ ok: false, error: "missing" }, { status: 400 });

    // كابتشا مطلوبة فقط عند بدء الدخول (لا عند التحقق من OTP — فالرمز نفسه إثبات تفاعل)
    const captchaToken = String(body.captcha_token || "");
    if (!otp && !captchaToken)
      return Response.json({ ok: false, error: "captcha_required" }, { status: 400 });
    if (!otp && !(await verifyTurnstile(captchaToken)))
      return Response.json({ ok: false, error: "captcha_failed" }, { status: 403 });

    const emps = await base44.asServiceRole.entities.Employee.filter({ national_id: nid });
    const emp = (emps || []).find((e) => (e.birth_date || "").slice(0, 10) === birthDate);
    if (!emp) return Response.json({ ok: false, error: "not_linked" });
    if (emp.status && emp.status !== "active" && emp.status !== "on_leave")
      return Response.json({ ok: false, error: "inactive" });

    const isApprover = !!(emp.is_approver_manager || emp.is_approver_finance || emp.is_approver_hr);
    const email = String(emp.email || "").trim();

    // منع دخول سجل مُعَدّ كـ "owner" عبر بوابة الموظف — المالك يدخل بوابة المالك فقط
    if ((emp.role_level || "") === "owner")
      return Response.json({ ok: false, error: "owner_use_owner_portal" }, { status: 403 });

    // عامل ثانٍ (OTP بالبريد المسجّل) إلزامي لكل مستخدمي البوابة — لا يُخفّض لعامل واحد أبداً
    {
      if (!email)
        return Response.json({ ok: false, error: "otp_unavailable" }, { status: 400 });
      if (!otp) {
        const code = generateResetCode();
        await base44.asServiceRole.entities.Employee.update(emp.id, {
          login_otp: code, login_otp_expires_at: Date.now() + OTP_TTL_MS, login_otp_attempts: 0,
        });
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: "رمز الدخول إلى بوابة الموظف — جدارة",
            body: `رمز التحقق الخاص بك للدخول إلى بوابة الموظف هو: ${code}\nالرمز صالح لمدة 10 دقائق.\nإن لم تطلب الدخول فتجاهل هذه الرسالة.`,
          });
        } catch {
          // تعذّر إيصال OTP (بريد غير مسجّل كمستخدم مثلاً) — لا نُصدر جلسة دون العامل الثاني
          await base44.asServiceRole.entities.Employee.update(emp.id, { login_otp: "", login_otp_expires_at: 0 });
          return Response.json({ ok: false, error: "otp_unavailable" }, { status: 400 });
        }
        return Response.json({ ok: false, error: "otp_required" }, { status: 200 });
      } else {
        const att = Number(emp.login_otp_attempts) || 0;
        if (att >= OTP_MAX_ATTEMPTS) {
          return Response.json({ ok: false, error: "otp_locked" }, { status: 429 });
        }
        if (!emp.login_otp || emp.login_otp !== otp) {
          await base44.asServiceRole.entities.Employee.update(emp.id, { login_otp_attempts: att + 1 });
          return Response.json({ ok: false, error: "otp_invalid" }, { status: 400 });
        }
        if (!emp.login_otp_expires_at || Date.now() > Number(emp.login_otp_expires_at)) {
          return Response.json({ ok: false, error: "otp_expired" }, { status: 400 });
        }
        await base44.asServiceRole.entities.Employee.update(emp.id, {
          login_otp: "", login_otp_expires_at: 0, login_otp_attempts: 0,
        });
      }
    }

    const ttl = isApprover ? APPROVER_TTL_MS : EMPLOYEE_TTL_MS;
    const token = await signToken(emp.id, ttl);

    // إشعار دخول للمعتمد صاحب البريد (كشف الانتحال) — أفضل جهد
    if (isApprover && email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: "تنبيه دخول إلى بوابة الموظف — جدارة",
          body: `تم تسجيل الدخول إلى بوابة الموظف بحسابك (${emp.full_name || ""}). إن لم تكن أنت فأبلغ مسؤول الموارد البشرية فوراً.`,
        });
      } catch {}
    }

    let org = null;
    try {
      const orgs = await base44.asServiceRole.entities.Organization.list("-created_date", 1);
      org = orgs?.[0] || null;
    } catch {}

    return Response.json({
      ok: true,
      token,
      expires_at: Date.now() + ttl,
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