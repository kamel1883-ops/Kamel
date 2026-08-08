import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// قائمة الكيانات التي تنتمي بيانات المنشأة إليها عبر created_by_id — تُعاد إسنادها للحساب الجديد
const ENTITIES = [
  "Employee", "Attendance", "LeaveRequest", "LoanRequest", "BusinessTrip",
  "Warning", "Payroll", "Settlement", "License", "Subscription", "Branch",
  "OrgUnit", "WorkforcePlan", "Survey", "SurveyResponse", "ExitInterview",
  "Performance", "SuccessionPlan", "Vehicle"
];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // نقل ملكية حساب منشأة عملية حساسة — تقتصر على المالك
    let user;
    try { user = await base44.auth.me(); } catch (e) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const tenantId = String(body.tenant_id || '').trim();
    const newEmail = String(body.new_email || '').trim();
    if (!tenantId) return Response.json({ error: 'tenant_id مطلوب' }, { status: 400 });
    if (!newEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail))
      return Response.json({ error: 'بريد جديد صحيح مطلوب' }, { status: 400 });

    const tenant = await base44.asServiceRole.entities.Tenant.get(tenantId);
    if (!tenant) return Response.json({ error: 'العميل غير موجود' }, { status: 404 });

    const oldEmail = String(tenant.contact_email || '').trim().toLowerCase();
    const cleanNew = newEmail.toLowerCase();
    if (oldEmail && oldEmail === cleanNew)
      return Response.json({ error: 'البريد الجديد مطابق للبريد الحالي' }, { status: 400 });

    // إيجاد المستخدم القديم المرتبط بالبريد الحالي
    let oldUserId = null;
    let oldRole = 'user';
    if (oldEmail) {
      const oldUsers = await base44.asServiceRole.entities.User.filter({ email: oldEmail });
      if (oldUsers && oldUsers[0]) { oldUserId = oldUsers[0].id; oldRole = oldUsers[0].role || 'user'; }
    }

    // ضمان وجود مستخدم جديد: دعوة إن لم يكن مسجلاً مسبقاً (بنفس الدور)
    let newUsers = await base44.asServiceRole.entities.User.filter({ email: cleanNew });
    let newUser = newUsers && newUsers[0];
    if (!newUser) {
      try { await base44.users.inviteUser(cleanNew, oldRole); }
      catch (e) { return Response.json({ error: 'تعذّر إنشاء المستخدم الجديد: ' + (e?.message || e) }, { status: 500 }); }
      newUsers = await base44.asServiceRole.entities.User.filter({ email: cleanNew });
      newUser = newUsers && newUsers[0];
      if (!newUser) return Response.json({ error: 'تعذّر إيجاد المستخدم الجديد بعد الدعوة' }, { status: 500 });
    }
    const newUserId = newUser.id;

    // تحديث بريد المنشأة المعتمد
    await base44.asServiceRole.entities.Tenant.update(tenantId, { contact_email: cleanNew });

    // إعادة إسناد جميع سجلات المنشأة إلى المستخدم الجديد
    let moved = 0;
    if (oldUserId && oldUserId !== newUserId) {
      for (const name of ENTITIES) {
        const e = base44.asServiceRole.entities[name];
        if (!e || typeof e.updateMany !== 'function') continue;
        try {
          const r = await e.updateMany({ created_by_id: oldUserId }, { $set: { created_by_id: newUserId } });
          moved += Number(r?.modified_count || r?.count || 0);
        } catch (_) { /* بعض الكيانات قد لا تكون متاحة — تجاهل */ }
      }
    }

    return Response.json({
      ok: true,
      old_email: oldEmail || null,
      new_email: cleanNew,
      old_user_id: oldUserId,
      new_user_id: newUserId,
      records_moved: moved,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}