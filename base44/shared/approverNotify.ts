// منطق موحّد لإرسال تنبيه بريدي + إشعار داخلي للمعتمد المختص (المدير المباشر /
// الموارد البشرية / المالية) عند تقديم طلب أو انتقاله لمرحلة موافقة جديدة.
// يُستخدم من:
//   - portalData (تقديم الطلب من بوابة الموظف)
//   - approvalAction (الانتقال بين المراحل بعد كل موافقة)
//   - notifyApprover (تقديم الطلب من لوحة الإدارة)

const TYPE_LABEL: Record<string, string> = { leave: "إجازة", loan: "سلفة", trip: "انتداب", settlement: "مخالصة نهاية خدمة" };

export async function notifyApproverForStatus(
  base44: any,
  params: { type: string; employeeId: string; employeeName?: string; status: string }
): Promise<{ ok: boolean; skipped?: boolean; reason?: string; sentTo?: string }> {
  const { type, employeeId, employeeName, status } = params;
  if (!employeeId || !status) return { ok: true, skipped: true, reason: "missing-data" };

  const employees: any[] = await base44.asServiceRole.entities.Employee.list("-created_date", 5000);
  const requester = (employees || []).find((e) => e.id === employeeId);

  // تحديد المعتمد المختص بناءً على المرحلة الحالية للطلب
  let approver: any = null;
  let stageLabel = "";
  if (["pending_manager", "pending"].includes(status)) {
    approver = (employees || []).find((e) => e.id === requester?.manager_id) || null;
    stageLabel = "المدير المباشر";
  } else if (status === "manager_approved") {
    approver = (employees || []).find((e) => e.is_approver_hr) || null;
    stageLabel = "الموارد البشرية";
  } else if (["hr_approved", "hr_settled", "awaiting_finance"].includes(status)) {
    approver = (employees || []).find((e) => e.is_approver_finance) || null;
    stageLabel = "المالية";
  }

  if (!approver || !approver.email) return { ok: true, skipped: true, reason: "no-approver-email" };

  const label = TYPE_LABEL[type] || "طلب";
  const empName = employeeName || requester?.full_name || "—";
  const subject = `لديك طلب ${label} بانتظار الموافقة — منصة جدارة`;
  const bodyText =
    `السلام عليكم ${approver.full_name || ""}،\n\n` +
    `لديك طلب ${label} بانتظار ${stageLabel} على بوابة الموظف في منصة جدارة.\n\n` +
    `الموظف: ${empName}\n\n` +
    `يرجى الدخول إلى بوابة الموظف لمراجعة الطلب واتخاذ الإجراء المناسب.\n\n` +
    `مع التحية،\nمنصة جدارة للموارد البشرية`;

  // إشعار داخلي موجّه للمعتمد (يظهر في جرس البوابة إن كان مستخدماً مسجلاً)
  try {
    await base44.asServiceRole.entities.Notification.create({
      title: subject,
      body: bodyText,
      type: "approval_pending",
      employee_id: approver.id || "",
      user_id: approver.user_id || "",
      is_read: false,
    });
  } catch {}

  try {
    await base44.asServiceRole.integrations.Core.SendEmail({ to: approver.email, subject, body: bodyText });
    return { ok: true, sentTo: approver.email };
  } catch (e: any) {
    return { ok: true, skipped: true, reason: "send-failed", error: String(e?.message || e) };
  }
}