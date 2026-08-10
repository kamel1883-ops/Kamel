import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// يعيد طابور الموافقات الخاص بالمستخدم الحالي:
// - المدير المباشر (manager): فقط طلبات إجازات مرؤوسيه في مرحلة موافقة المدير المباشر.
// - المدير المالي (finance): طلبات الإجازات والسلف والانتدابات الواصلة لمرحلة الصرف.
// تستخدم خدمة-الدورService لتجاوز قيود RLS لأن العلاقات بين الجداول لا تُعبّر في RLS.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

    const role = user.role;
    if (role !== 'manager' && role !== 'finance') {
      return Response.json({ error: 'هذه الدالة مخصصة للمدير المباشر والمالك المالي فقط.' }, { status: 403 });
    }

    if (role === 'manager') {
      const allEmployees = await base44.asServiceRole.entities.Employee.list('-created_date', 500);
      const myEmp = (allEmployees || []).find((e) => e.user_id === user.id) || null;
      if (!myEmp) {
        return Response.json({
          role: 'manager',
          myEmp: null,
          subordinates: [],
          leaves: [],
          message: 'لم يتم ربط حسابك بسجل موظف بعد. تواصل مع الموارد البشرية لربط بريدك بسجل مديرك وضبط مرؤوسيك.',
        });
      }
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

    // finance
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
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}