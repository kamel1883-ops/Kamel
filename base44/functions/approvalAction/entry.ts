import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyToken } from "../../shared/portalToken.ts";

const today = () => new Date().toISOString().slice(0, 10);

// تنفيذ إجراء موافقة — يدعم وضعين:
// 1) بوابة موظف عبر رمز جلسة موقع (portal_token + portal_employee_id).
// 2) مستخدم Base44 مسجّل (المسار القديم).
// المعتمدون: المدير المباشر (is_approver_manager) لمرؤوسيه، والمعتمد المالي (is_approver_finance) للصرف النهائي.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const type = body.type;
    const action = body.action;
    const id = body.id;
    const note = String(body.note || "");
    // يقبل روابط http/https فقط لربط إثبات التحويل — يرفض javascript:/data: لمنع XSS المخزّن
    const proofUrl = /^https?:\/\//i.test(String(body.proof_url || "").trim()) ? String(body.proof_url).trim() : "";

    if (!id || !type || !action)
      return Response.json({ error: "بيانات ناقصة" }, { status: 400 });

    const portalToken = String(body.portal_token || "");
    const portalEmployeeId = String(body.portal_employee_id || "");

    let myEmp = null;
    let actorId = null;
    let actorName = null;

    if (portalToken && portalEmployeeId) {
      const session = await verifyToken(portalToken);
      if (!session.ok || session.employeeId !== portalEmployeeId)
        return Response.json({ error: "جلسة غير صالحة" }, { status: 401 });
      myEmp = await base44.asServiceRole.entities.Employee.get(portalEmployeeId);
      actorId = myEmp?.id || null;
      actorName = myEmp?.full_name || "—";
    } else {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
      const allEmployees = await base44.asServiceRole.entities.Employee.list("-created_date", 500);
      myEmp = (allEmployees || []).find((e) => e.user_id === user.id);
      if (!myEmp) return Response.json({ error: "لم يتم ربط حسابك بسجل موظف" }, { status: 403 });
      actorId = user.id;
      actorName = user.full_name;
    }

    const allEmployees = await base44.asServiceRole.entities.Employee.list("-created_date", 2000);
    // خريطة موظف → رقمه الموحد لفحص انتماء السجل لمنشأة المعتمد (منع العبور بين المنشآت)
    const idToUn = new Map();
    for (const e of allEmployees || []) {
      const un = String(e.unified_number || "").trim();
      if (un && e.id) idToUn.set(e.id, un);
    }
    const myUn = String(myEmp.unified_number || "").trim();
    const sameTenant = (employeeId) => !!myUn && idToUn.get(employeeId) === myUn;

    // ===== معتمد الموارد البشرية — سلف =====
    if (myEmp.is_approver_hr && type === "loans" && (action === "approve" || action === "reject")) {
      const r = await base44.asServiceRole.entities.LoanRequest.get(id);
      if (!sameTenant(r.employee_id))
        return Response.json({ error: "هذا الطلب خارج نطاق منشأتك" }, { status: 403 });
      if (r.status !== "pending")
        return Response.json({ error: "الطلب ليس في مرحلة اعتماد الموارد البشرية" }, { status: 400 });
      if (action === "approve") {
        const newAmount = Number(body.amount);
        const newInst = Number(body.installment_count);
        const patch = {
          hr_status: "approved", hr_id: actorId, hr_name: actorName, hr_date: today(), hr_note: note,
          status: "awaiting_finance",
        };
        if (Number.isFinite(newAmount) && newAmount > 0) {
          const inst = (Number.isFinite(newInst) && newInst >= 1) ? newInst : (Number(r.installment_count) || 1);
          patch.amount = newAmount;
          patch.installment_count = inst;
          patch.monthly_installment = Math.round((newAmount / inst) * 100) / 100;
        }
        await base44.asServiceRole.entities.LoanRequest.update(id, patch);
      } else {
        await base44.asServiceRole.entities.LoanRequest.update(id, {
          hr_status: "rejected", hr_id: actorId, hr_name: actorName, hr_date: today(), hr_note: note,
          status: "rejected",
        });
      }
      return Response.json({ ok: true });
    }

    // ===== معتمد الموارد البشرية — انتداب =====
    if (myEmp.is_approver_hr && type === "trips" && (action === "approve" || action === "reject")) {
      const r = await base44.asServiceRole.entities.BusinessTrip.get(id);
      if (!sameTenant(r.employee_id))
        return Response.json({ error: "هذا الطلب خارج نطاق منشأتك" }, { status: 403 });
      if (r.status !== "pending")
        return Response.json({ error: "الطلب ليس في مرحلة اعتماد الموارد البشرية" }, { status: 400 });
      if (action === "approve") {
        await base44.asServiceRole.entities.BusinessTrip.update(id, {
          approver_id: actorId, approver_name: actorName, approved_date: today(),
          hr_note: note, status: "awaiting_finance",
        });
      } else {
        await base44.asServiceRole.entities.BusinessTrip.update(id, {
          hr_note: note, status: "rejected",
        });
      }
      return Response.json({ ok: true });
    }

    // ===== المدير المباشر =====
    if (myEmp.is_approver_manager && type === "leaves" && (action === "approve" || action === "reject")) {
      const leave = await base44.asServiceRole.entities.LeaveRequest.get(id);
      const emp = (allEmployees || []).find((e) => e.id === leave.employee_id);
      if (!emp || emp.manager_id !== myEmp.id)
        return Response.json({ error: "هذا الطلب خارج نطاق مرؤوسيك" }, { status: 403 });
      if (leave.status !== "pending_manager" && leave.status !== "pending")
        return Response.json({ error: "الطلب ليس في مرحلة موافقة المدير المباشر" }, { status: 400 });

      if (action === "approve") {
        await base44.asServiceRole.entities.LeaveRequest.update(id, {
          manager_status: "approved", manager_id: actorId, manager_name: actorName,
          manager_date: today(), status: "manager_approved",
        });
      } else {
        await base44.asServiceRole.entities.LeaveRequest.update(id, {
          manager_status: "rejected", manager_id: actorId, manager_name: actorName,
          manager_date: today(), manager_note: note, status: "rejected",
        });
      }
      return Response.json({ ok: true });
    }

    // ===== المعتمد المالي =====
    if (myEmp.is_approver_finance && (action === "confirm" || action === "reject")) {
      if (type === "leaves") {
        const r = await base44.asServiceRole.entities.LeaveRequest.get(id);
        if (!sameTenant(r.employee_id))
          return Response.json({ error: "هذا الطلب خارج نطاق منشأتك" }, { status: 403 });
        if (!["awaiting_finance", "hr_approved"].includes(r.status))
          return Response.json({ error: "الطلب ليس في مرحلة الصرف" }, { status: 400 });
        if (action === "confirm") {
          await base44.asServiceRole.entities.LeaveRequest.update(id, {
            finance_status: "paid", finance_paid_date: today(), finance_proof_url: proofUrl,
            finance_proof_date: today(), finance_note: note, status: "completed",
          });
          // الإجازة السنوية: تمييز سفر فعلي (على إجازة) عن تصفية مع مواصلة العمل (على رأس العمل)
          if (r.leave_type === "annual") {
            const empL = await base44.asServiceRole.entities.Employee.get(r.employee_id).catch(() => null);
            if (empL) {
              const newStatus = r.annual_leave_mode === "encash_continue" ? "active" : "on_leave";
              await base44.asServiceRole.entities.Employee.update(empL.id, { status: newStatus });
            }
          }
          if (Number(r.ticket_amount) > 0) {
            const emp = await base44.asServiceRole.entities.Employee.get(r.employee_id).catch(() => null);
            if (emp) await base44.asServiceRole.entities.Employee.update(emp.id, { ticket_last_used_year: new Date().getFullYear() });
          }
        } else {
          await base44.asServiceRole.entities.LeaveRequest.update(id, {
            finance_status: "rejected", finance_note: note, status: "rejected",
          });
        }
        return Response.json({ ok: true });
      }

      if (type === "loans") {
        const r = await base44.asServiceRole.entities.LoanRequest.get(id);
        if (!sameTenant(r.employee_id))
          return Response.json({ error: "هذا الطلب خارج نطاق منشأتك" }, { status: 403 });
        if (!["awaiting_finance", "hr_approved"].includes(r.status))
          return Response.json({ error: "الطلب ليس في مرحلة الصرف" }, { status: 400 });
        if (action === "confirm") {
          await base44.asServiceRole.entities.LoanRequest.update(id, {
            finance_status: "paid", finance_paid_date: today(), finance_proof_url: proofUrl,
            finance_proof_date: today(), finance_note: note, paid_amount: 0, status: "paid",
          });
        } else {
          await base44.asServiceRole.entities.LoanRequest.update(id, {
            finance_status: "rejected", finance_note: note, status: "rejected",
          });
        }
        return Response.json({ ok: true });
      }

      if (type === "trips") {
        const r = await base44.asServiceRole.entities.BusinessTrip.get(id);
        if (!sameTenant(r.employee_id))
          return Response.json({ error: "هذا الطلب خارج نطاق منشأتك" }, { status: 403 });
        if (r.status !== "awaiting_finance")
          return Response.json({ error: "الطلب ليس في مرحلة الصرف" }, { status: 400 });
        if (action === "confirm") {
          await base44.asServiceRole.entities.BusinessTrip.update(id, {
            finance_status: "paid", finance_paid_date: today(), finance_proof_url: proofUrl,
            finance_proof_date: today(), finance_note: note, status: "completed",
          });
        } else {
          await base44.asServiceRole.entities.BusinessTrip.update(id, {
            finance_status: "rejected", finance_note: note, status: "rejected",
          });
        }
        return Response.json({ ok: true });
      }

      if (type === "settlements") {
        const r = await base44.asServiceRole.entities.Settlement.get(id);
        if (!sameTenant(r.employee_id))
          return Response.json({ error: "هذا الطلب خارج نطاق منشأتك" }, { status: 403 });
        if (r.status !== "awaiting_finance")
          return Response.json({ error: "الطلب ليس في مرحلة الصرف" }, { status: 400 });
        if (action === "confirm") {
          await base44.asServiceRole.entities.Settlement.update(id, {
            finance_status: "paid", finance_id: actorId, finance_name: actorName,
            finance_paid_date: today(), finance_proof_url: proofUrl, finance_proof_date: today(),
            finance_note: note, status: "completed",
          });
          if (r.employee_id) {
            const empStatus = r.reason === "resignation" ? "resigned" : "terminated";
            await base44.asServiceRole.entities.Employee.update(r.employee_id, {
              status: empStatus, termination_reason: r.reason, termination_date: r.last_working_date,
            });
          }
        } else {
          await base44.asServiceRole.entities.Settlement.update(id, {
            finance_status: "rejected", finance_note: note, status: "rejected",
          });
        }
        return Response.json({ ok: true });
      }
    }

    return Response.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}