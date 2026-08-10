import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const today = () => new Date().toISOString().slice(0, 10);

// تنفيذ إجراء موافقة نيابة عن المدير المباشر أو المدير المالي (تتجاوز RLS عبر خدمة-الدور).
// التحقق من الصلاحية مطبق: المدير لا يوافق إلا على إجازات مرؤوسيه، والمالية لا تصرف إلا الطلبات في مرحلة الصرف.
// ملاحظة: توليد مستندات PDF (المخالصة/كشف السلفة/موافقة الانتداب) يبقى في الواجهة الأمامية لإدارة الموارد البشرية.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

    const role = user.role;
    const body = await req.json().catch(() => ({}));
    const type = body.type;        // 'leaves' | 'loans' | 'trips'
    const action = body.action;    // 'approve' | 'reject' | 'confirm'
    const id = body.id;
    const note = String(body.note || '');
    const proofUrl = String(body.proof_url || '');

    if (!id || !type || !action) return Response.json({ error: 'بيانات ناقصة' }, { status: 400 });

    if (role === 'manager') {
      if (type !== 'leaves' || (action !== 'approve' && action !== 'reject'))
        return Response.json({ error: 'غير مصرح لك بهذا الإجراء' }, { status: 403 });
      const allEmployees = await base44.asServiceRole.entities.Employee.list('-created_date', 500);
      const myEmp = (allEmployees || []).find((e) => e.user_id === user.id);
      if (!myEmp) return Response.json({ error: 'لم يتم ربط حسابك بسجل موظف' }, { status: 403 });
      const leave = await base44.asServiceRole.entities.LeaveRequest.get(id);
      const emp = (allEmployees || []).find((e) => e.id === leave.employee_id);
      if (!emp || emp.manager_id !== myEmp.id)
        return Response.json({ error: 'هذا الطلب خارج نطاق مرؤوسيك' }, { status: 403 });
      if (leave.status !== 'pending_manager' && leave.status !== 'pending')
        return Response.json({ error: 'الطلب ليس في مرحلة موافقة المدير المباشر' }, { status: 400 });

      if (action === 'approve') {
        await base44.asServiceRole.entities.LeaveRequest.update(id, {
          manager_status: 'approved', manager_id: user.id, manager_name: user.full_name,
          manager_date: today(), status: 'manager_approved',
        });
      } else {
        await base44.asServiceRole.entities.LeaveRequest.update(id, {
          manager_status: 'rejected', manager_id: user.id, manager_name: user.full_name,
          manager_date: today(), manager_note: note, status: 'rejected',
        });
      }
      return Response.json({ ok: true });
    }

    if (role === 'finance') {
      if (action !== 'confirm' && action !== 'reject')
        return Response.json({ error: 'غير مصرح' }, { status: 403 });

      if (type === 'leaves') {
        const r = await base44.asServiceRole.entities.LeaveRequest.get(id);
        if (!['awaiting_finance', 'hr_approved'].includes(r.status))
          return Response.json({ error: 'الطلب ليس في مرحلة الصرف' }, { status: 400 });
        if (action === 'confirm') {
          await base44.asServiceRole.entities.LeaveRequest.update(id, {
            finance_status: 'paid', finance_paid_date: today(), finance_proof_url: proofUrl,
            finance_proof_date: today(), finance_note: note, status: 'completed',
          });
          if (Number(r.ticket_amount) > 0) {
            const emp = await base44.asServiceRole.entities.Employee.get(r.employee_id).catch(() => null);
            if (emp) await base44.asServiceRole.entities.Employee.update(emp.id, { ticket_last_used_year: new Date().getFullYear() });
          }
        } else {
          await base44.asServiceRole.entities.LeaveRequest.update(id, {
            finance_status: 'rejected', finance_note: note, status: 'rejected',
          });
        }
        return Response.json({ ok: true });
      }

      if (type === 'loans') {
        const r = await base44.asServiceRole.entities.LoanRequest.get(id);
        if (!['awaiting_finance', 'hr_approved'].includes(r.status))
          return Response.json({ error: 'الطلب ليس في مرحلة الصرف' }, { status: 400 });
        if (action === 'confirm') {
          await base44.asServiceRole.entities.LoanRequest.update(id, {
            finance_status: 'paid', finance_paid_date: today(), finance_proof_url: proofUrl,
            finance_proof_date: today(), paid_amount: Number(r.amount) || 0, status: 'completed',
          });
        } else {
          await base44.asServiceRole.entities.LoanRequest.update(id, {
            finance_status: 'rejected', finance_note: note, status: 'rejected',
          });
        }
        return Response.json({ ok: true });
      }

      if (type === 'trips') {
        const r = await base44.asServiceRole.entities.BusinessTrip.get(id);
        if (r.status !== 'awaiting_finance')
          return Response.json({ error: 'الطلب ليس في مرحلة الصرف' }, { status: 400 });
        if (action === 'confirm') {
          await base44.asServiceRole.entities.BusinessTrip.update(id, {
            finance_status: 'paid', finance_paid_date: today(), finance_proof_url: proofUrl,
            finance_proof_date: today(), finance_note: note, status: 'completed',
          });
        } else {
          await base44.asServiceRole.entities.BusinessTrip.update(id, {
            finance_status: 'rejected', finance_note: note, status: 'rejected',
          });
        }
        return Response.json({ ok: true });
      }

      if (type === 'settlements') {
        const r = await base44.asServiceRole.entities.Settlement.get(id);
        if (r.status !== 'awaiting_finance')
          return Response.json({ error: 'الطلب ليس في مرحلة الصرف' }, { status: 400 });
        if (action === 'confirm') {
          await base44.asServiceRole.entities.Settlement.update(id, {
            finance_status: 'paid', finance_id: user.id, finance_name: user.full_name,
            finance_paid_date: today(), finance_proof_url: proofUrl, finance_proof_date: today(),
            finance_note: note, status: 'completed',
          });
          if (r.employee_id) {
            const empStatus = r.reason === 'resignation' ? 'resigned' : 'terminated';
            await base44.asServiceRole.entities.Employee.update(r.employee_id, {
              status: empStatus, termination_reason: r.reason, termination_date: r.last_working_date,
            });
          }
        } else {
          await base44.asServiceRole.entities.Settlement.update(id, {
            finance_status: 'rejected', finance_note: note, status: 'rejected',
          });
        }
        return Response.json({ ok: true });
      }
    }

    return Response.json({ error: 'غير مصرح' }, { status: 403 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}