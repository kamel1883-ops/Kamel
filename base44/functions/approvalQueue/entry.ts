import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// يعيد طابور الموافقات للموظف الحالي بناءً على علامات سجل الموظف (وليس دور المستخدم):
// - is_approver_manager: إجازات مرؤوسيه في مرحلة موافقة المدير المباشر.
// - is_approver_finance: الإجازات والسلف والانتدابات والمخالصات في مرحلة الصرف.
// تتجاوز RLS عبر خدمة-الدور لأن العلاقات بين الجداول لا تُعبّر في RLS.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

    const allEmployees = await base44.asServiceRole.entities.Employee.list('-created_date', 500);
    const myEmp = (allEmployees || []).find((e) => e.user_id === user.id) || null;
    if (!myEmp) return Response.json({ role: 'none', message: 'لم يُربط حسابك بسجل موظف بعد.' });

    if (myEmp.is_approver_manager) {
      const subs = (allEmployees || []).filter((e) => e.manager_id === myEmp.id);
      const subIds = new Set(subs.map((s) => s.id));
      const allLeaves = await base44.asServiceRole.entities.LeaveRequest.list('-created_date', 500);
      const leaves = (allLeaves || []).filter(
        (l) => subIds.has(l.employee_id) && (l.status === 'pending_manager' || l.status === 'pending')
      );
      return Response.json({
        role: 'manager',
        myEmp,
        subordinates: subs.map((s) => ({ id: s.id, full_name: s.full_name, department: s.department, position: s.position })),
        leaves,
        message: subs.length === 0 ? 'لا يوجد مرؤوسون مربوطون بك حالياً.' : null,
      });
    }

    if (myEmp.is_approver_finance) {
      const [allLeaves, allLoans, allTrips, allSettlements] = await Promise.all([
        base44.asServiceRole.entities.LeaveRequest.list('-created_date', 500),
        base44.asServiceRole.entities.LoanRequest.list('-created_date', 500),
        base44.asServiceRole.entities.BusinessTrip.list('-created_date', 500),
        base44.asServiceRole.entities.Settlement.list('-created_date', 500),
      ]);
      const finStatuses = ['awaiting_finance', 'hr_approved'];
      const leaves = (allLeaves || []).filter((l) => finStatuses.includes(l.status));
      const loans = (allLoans || []).filter((l) => finStatuses.includes(l.status));
      const trips = (allTrips || []).filter((t) => t.status === 'awaiting_finance');
      const settlements = (allSettlements || []).filter((s) => s.status === 'awaiting_finance');
      return Response.json({ role: 'finance', leaves, loans, trips, settlements });
    }

    return Response.json({ role: 'none' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}