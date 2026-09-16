import { base44 } from "@/api/base44Client";

// الفرق بالأشهر الكاملة بين تاريخين (أو 0)
export function monthDiff(fromISO, toISO) {
  if (!fromISO) return 0;
  const a = new Date(fromISO);
  const b = new Date(toISO);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  // إذا لم يكمل شهر هذا الشهر نحسبه ناقصًا (التناسبي)
  // نعم: Kenya. القيمة الشهرية الكاملة فقط.
  return Math.max(0, months);
}

// الرصيد المستحق تناسبياً شهرياً من تاريخ المباشرة
export function computeEntitlement(hireDate, annualDays, asOf = new Date()) {
  const days = Number(annualDays) || 21;
  if (!hireDate) return 0;
  const months = monthDiff(hireDate, asOf instanceof Date ? asOf.toISOString() : asOf);
  if (months <= 0) return 0;
  return Math.round((months / 12) * days * 10) / 10;
}

// الرصيد المستحق (التراكمي) وفق نظام العمل السعودي: 21 يوماً عن كل سنة من أول
// 5 سنوات، و30 يوماً عن كل سنة بعدها — تناسبياً شهرياً من تاريخ المباشرة.
// استثناء: إذا منحت المنشأة 30 يوماً من أول سنة (annual_leave_days=30) تُطبّق 30 عن كامل المدة.
// مثال: 6 سنوات خدمة = (5 × 21) + (1 × 30) = 135 يوماً (وليس 30 × 6 = 180).
export function computeLeaveEntitlement(hireDate, org, asOf = new Date()) {
  if (!hireDate) return 0;
  const months = monthDiff(hireDate, asOf instanceof Date ? asOf.toISOString() : asOf);
  if (months <= 0) return 0;
  if (Number(org?.annual_leave_days) === 30) {
    return Math.round((months / 12) * 30 * 10) / 10;
  }
  const first60 = Math.min(months, 60);
  const beyond = Math.max(0, months - 60);
  const val = (first60 / 12) * 21 + (beyond / 12) * 30;
  return Math.round(val * 10) / 10;
}

export async function getOrgOnce() {
  try {
    const orgs = await base44.entities.Organization.list("-created_date", 1);
    return orgs[0] || null;
  } catch {
    return null;
  }
}

export async function getAnnualLeaveDays() {
  const org = await getOrgOnce();
  const v = Number(org?.annual_leave_days);
  return v === 21 || v === 30 ? v : 21;
}

// سنوات الخدمة الكاملة من تاريخ المباشرة حتى تاريخ مرجعي (افتراضياً اليوم)
export function yearsOfService(hireDate, asOf = new Date()) {
  if (!hireDate) return 0;
  const a = new Date(hireDate);
  const b = asOf instanceof Date ? asOf : new Date(asOf);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  let years = b.getFullYear() - a.getFullYear();
  if (b.getMonth() < a.getMonth() || (b.getMonth() === a.getMonth() && b.getDate() < a.getDate())) years--;
  return Math.max(0, years);
}

// رصيد الإجازات السنوي للموظف وفق نظام العمل السعودي:
// - سياسة المنشأة الكريمة (annual_leave_days = 30) → 30 يوماً للجميع.
// - وإلا: أقل من 5 سنوات خدمة → 21 يوماً، وإكمال 5 سنوات فأكثر → 30 يوماً إلزامياً.
// خيار الـ 21/30 في ملف الموظف مقفل تلقائياً وفق هذه القاعدة (لا يملك الموارد البشرية
// اختيار 30 لموظف تحت 5 سنوات، ولا 21 لموظف أكمل 5 سنوات) — انظر EmployeeForm.
export function getEmployeeAnnualDays(employee, org) {
  if (Number(org?.annual_leave_days) === 30) return 30;
  const yos = yearsOfService(employee?.hire_date);
  return yos >= 5 ? 30 : 21;
}

// مجموع الأيام المستخدمة من طلبات الإجازة السنوية المعتمدة/المكتملة فقط —
// الإجازات المرضية وبدون راتب والاضطرارية والإذن لا تُخصم من رصيد الإجازات السنوية.
export function sumUsedDays(leaves) {
  if (!Array.isArray(leaves)) return 0;
  const consume = new Set(["completed", "paid", "approved", "hr_approved", "awaiting_finance", "manager_approved"]);
  return leaves
    .filter((l) => l.status !== "rejected" && consume.has(l.status) && l.leave_type === "annual")
    .reduce((s, l) => s + (Number(l.balance_deducted) || Number(l.days_count) || 0), 0);
}

// «الرصيد المستخدم الكلي» = الرصيد الافتتاحي (prior_used_leave — لقطة ثابتة لما قبل النظام)
// + مجموع الإجازات السنوية المعتمدة داخل النظام (sumUsedDays). عنصران منفصلان لا يتكرران.
// المعادلة المعتمدة: المتبقي = المستحق التراكمي − المستخدم الكلي.
export function usedLeaveTotal(employee, leaves) {
  const prior = Number(employee?.prior_used_leave) || 0;
  return Math.round((prior + sumUsedDays(leaves)) * 10) / 10;
}

// الرصيد المتبقي = المستحق التراكمي − المستخدم الكلي (قد يكون سالباً عند تقديم إجازة).
export function remainingLeave(employee, leaves, org, asOf) {
  const entitled = computeLeaveEntitlement(employee?.hire_date, org, asOf);
  const used = usedLeaveTotal(employee, leaves);
  return Math.round((entitled - used) * 10) / 10;
}

// يُعيد الموظفين الذين انتهت إجازتهم السنوية الفعلية (سفر) إلى «على رأس العمل» تلقائياً
// عند تجاوز تاريخ نهاية الإجازة. يُستدعى عند تحميل قائمة الموظفين.
export async function revertExpiredLeaves(employees) {
  const onLeave = (employees || []).filter((e) => e && e.status === "on_leave" && e.id);
  if (onLeave.length === 0) return [];
  const todayStr = new Date().toISOString().slice(0, 10);
  const reverted = [];
  for (const emp of onLeave) {
    const leaves = await base44.entities.LeaveRequest.filter({ employee_id: emp.id }, "-created_date", 50).catch(() => []);
    const travelLeave = (leaves || []).find(
      (l) => l.leave_type === "annual" && l.annual_leave_mode !== "encash_continue"
        && ["completed", "paid"].includes(l.status)
    );
    if (travelLeave && travelLeave.end_date && String(travelLeave.end_date) < todayStr) {
      await base44.entities.Employee.update(emp.id, { status: "active" }).catch(() => {});
      reverted.push(emp.id);
    }
  }
  return reverted;
}