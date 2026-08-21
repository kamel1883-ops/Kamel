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

    // خريطة موظف → رقمه الموحد لتحديد نطاق منشأة المعتمد (منع العبور بين المنشآت)
    const allEmployees = await base44.asServiceRole.entities.Employee.list("-created_date", 2000);
    const idToUn = new Map();
    for (const e of allEmployees || []) {
      const un = String(e.unified_number || "").trim();
      if (un && e.id) idToUn.set(e.id, un);
    }
    const myUn = String(myEmp.unified_number || "").trim();
    const sameTenant = (rec) => !!myUn && idToUn.get(rec.employee_id) === myUn;

    const idToNat = new Map();
    const idToName = new Map();
    for (const e of allEmployees || []) {
      if (e.id) { idToNat.set(e.id, e.national_id || ""); idToName.set(e.id, e.full_name || ""); }
    }
    const withNat = (arr) => (arr || []).map((r) => ({
      ...r,
      national_id: r.national_id || idToNat.get(r.employee_id) || "",
      employee_name: r.employee_name || idToName.get(r.employee_id) || "",
    }));

    if (myEmp.is_approver_manager) {
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
        subordinates: subs.map((s) => ({ id: s.id, full_name: s.full_name, department: s.department, position: s.position, national_id: s.national_id || "" })),
        leaves: withNat(leaves),
        message: subs.length === 0 ? "لا يوجد مرؤوسون مربوطون بك حالياً." : null,
      });
    }

    // معتمد الموارد البشرية للمنشأة — يرى طلبات السلف والانتدابات قبل الصرف المالي.
    if (myEmp.is_approver_hr) {
      const [allLoans, allTrips] = await Promise.all([
        base44.asServiceRole.entities.LoanRequest.list("-created_date", 500),
        base44.asServiceRole.entities.BusinessTrip.list("-created_date", 500),
      ]);
      const loans = (allLoans || []).filter((l) => l.status === "pending" && sameTenant(l));
      const trips = (allTrips || []).filter((t) => t.status === "pending" && sameTenant(t));
      return Response.json({ role: "hr", myEmp, actorId, actorName, loans: withNat(loans), trips: withNat(trips) });
    }

    if (myEmp.is_approver_finance) {
      const [allLeaves, allLoans, allTrips, allSettlements] = await Promise.all([
        base44.asServiceRole.entities.LeaveRequest.list("-created_date", 500),
        base44.asServiceRole.entities.LoanRequest.list("-created_date", 500),
        base44.asServiceRole.entities.BusinessTrip.list("-created_date", 500),
        base44.asServiceRole.entities.Settlement.list("-created_date", 500),
      ]);
      const finStatuses = ["awaiting_finance", "hr_approved"];
      const leaves = (allLeaves || []).filter((l) => finStatuses.includes(l.status) && sameTenant(l));
      const loans = (allLoans || []).filter((l) => finStatuses.includes(l.status) && sameTenant(l));
      const trips = (allTrips || []).filter((t) => t.status === "awaiting_finance" && sameTenant(t));
      const settlements = (allSettlements || []).filter((s) => s.status === "awaiting_finance" && sameTenant(s));
      return Response.json({ role: "finance", myEmp, actorId, actorName, leaves: withNat(leaves), loans: withNat(loans), trips: withNat(trips), settlements: withNat(settlements) });
    }

    return Response.json({ role: "none" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}