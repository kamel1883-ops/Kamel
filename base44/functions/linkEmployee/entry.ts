import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const nationalId = String(body.national_id || '').trim();
    if (!nationalId) return Response.json({ error: 'رقم الهوية/الإقامة مطلوب' }, { status: 400 });

    // بحث بسجلات الموظفين (service role لتجاوز قيود RLS) مطابقة رقم الهوية/الإقامة
    const matches = await base44.asServiceRole.entities.Employee.filter(
      { national_id: nationalId }, '-created_date', 20
    );
    if (!matches || matches.length === 0) {
      return Response.json({ error: 'لا يوجد موظف مسجل بهذا الرقم. تأكد من الرقم أو تواصل مع الموارد البشرية.' }, { status: 404 });
    }
    const emp = matches[0];

    // إن كان السجل مرتبطاً بحساب آخر → رفض
    if (emp.user_id && emp.user_id !== user.id) {
      return Response.json({ error: 'هذا السجل مرتبط بحساب آخر. تواصل مع الموارد البشرية.' }, { status: 409 });
    }
    // إن كان مرتبطاً بنفس المستخدم → لا شيء
    if (emp.user_id === user.id) {
      return Response.json({ ok: true, already_linked: true, employee_id: emp.id });
    }
    // ربط الحساب
    await base44.asServiceRole.entities.Employee.update(emp.id, { user_id: user.id });
    return Response.json({ ok: true, employee_id: emp.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}