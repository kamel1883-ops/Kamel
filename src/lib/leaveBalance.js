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

// رصيد الإجازات السنوي للموظف: أولوية لاختيار الموارد البشرية في ملف الموظف (21 أو 30)،
// ثم إعداد المنشأة، ثم 21 افتراضياً. هذا المصدر الموحّد لكل حسابات الإجازات ومخالصتها ونهاية الخدمة.
export function getEmployeeAnnualDays(employee, org) {
  const emp = Number(employee?.annual_leave_entitlement);
  if (emp === 21 || emp === 30) return emp;
  const orgV = Number(org?.annual_leave_days);
  return orgV === 21 || orgV === 30 ? orgV : 21;
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