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
  return Number(org?.annual_leave_days) || 21;
}

// مجموع الأيام المستخدمة من طلبات الإجازة المعتمدة/المكتملة (باستثناء المرفوضة المؤرشفة)
export function sumUsedDays(leaves) {
  if (!Array.isArray(leaves)) return 0;
  const consume = new Set(["completed", "paid", "approved", "hr_approved", "awaiting_finance", "manager_approved"]);
  return leaves
    .filter((l) => l.status !== "rejected" && consume.has(l.status) && l.leave_type !== "unpaid")
    .reduce((s, l) => s + (Number(l.balance_deducted) || Number(l.days_count) || 0), 0);
}