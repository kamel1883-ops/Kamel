import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyToken } from "../../shared/portalToken.ts";

// يعيد طابور الموافقات للموظف — يدعم وضعين:
// 1) بوابة موظف عبر رمز جلسة موقع (portal_token + portal_employee_id).
// 2) مستخدم Base44 مسجّل (المسار القديم).
// يُحدد الدور من علامات سجل الموظف (is_approver_manager / is_approver_finance).

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
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
      if (!myEmp) return Response.json({ role: "none", message: "لم يُربط حسابك بسجل موظف بعد." });
      actorId = myEmp.id;
      actorName = myEmp.full_name || "—";
    } else {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
      const allEmployees = await base44.asServiceRole.entities.Employee.list("-created_date", 500);
      myEmp = (allEmployees || []).find((e) => e.user_id === user.id) || null;
      if (!myEmp) return Response.json({ role: "none", message: "لم يُربط حسابك بسجل موظف بعد." });
      actorId = user.id;
      actorName = user.full_name;
    }

    if (myEmp.is_approver_manager) {
      const allEmployees = await base44.asServiceRole.entities.Employee.list("-created_date", 500);
      const subs = (allEmployees || []).filter((e) => e.manager_id === myEmp.id);
      const subIds = new Set(subs.map((s) => s.id));
      const allLeaves = await base44.asServiceRole.entities.LeaveRequest.list("-created_date", 500);
      const leaves = (allLeaves || []).filter(
        (l) => subIds.has(l.employee_id) && (l.status === "pending_manager" || l.status === "pending")
      );
      return Response.json({
        role: "manager",
        myEmp,
        actorId, actorName,
        subordinates: subs.map((s) => ({ id: s.id, full_name: s.full_name, department: s.department, position: s.position })),
        leaves,
        message: subs.length === 0 ? "لا يوجد مرؤوسون مربوطون بك حالياً." : null,
      });
    }

    // معتمد الموارد البشرية للمنشأة — يرى طلبات السلف والانتدابات قبل الصرف المالي.
    if (myEmp.is_approver_hr) {
      const [allLoans, allTrips] = await Promise.all([
        base44.asServiceRole.entities.LoanRequest.list("-created_date", 500),
        base44.asServiceRole.entities.BusinessTrip.list("-created_date", 500),
      ]);
      const loans = (allLoans || []).filter((l) => l.status === "pending");
      const trips = (allTrips || []).filter((t) => t.status === "pending");
      return Response.json({ role: "hr", myEmp, actorId, actorName, loans, trips });
    }

    if (myEmp.is_approver_finance) {
      const [allLeaves, allLoans, allTrips, allSettlements] = await Promise.all([
        base44.asServiceRole.entities.LeaveRequest.list("-created_date", 500),
        base44.asServiceRole.entities.LoanRequest.list("-created_date", 500),
        base44.asServiceRole.entities.BusinessTrip.list("-created_date", 500),
        base44.asServiceRole.entities.Settlement.list("-created_date", 500),
      ]);
      const finStatuses = ["awaiting_finance", "hr_approved"];
      const leaves = (allLeaves || []).filter((l) => finStatuses.includes(l.status));
      const loans = (allLoans || []).filter((l) => finStatuses.includes(l.status));
      const trips = (allTrips || []).filter((t) => t.status === "awaiting_finance");
      const settlements = (allSettlements || []).filter((s) => s.status === "awaiting_finance");
      return Response.json({ role: "finance", myEmp, actorId, actorName, leaves, loans, trips, settlements });
    }

    return Response.json({ role: "none" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}