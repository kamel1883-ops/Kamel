// مساعدات مسار الموافقات (إجازات + سلف) — ثنائية اللغة
import { isAr } from "@/lib/lang";

const ar = {
  pending_manager: { label: "بانتظار المدير المباشر", cls: "bg-amber-50 text-amber-600", step: 1 },
  manager_approved: { label: "وافق المدير — بانتظار الموارد البشرية", cls: "bg-blue-50 text-blue-600", step: 2 },
  hr_approved: { label: "وافقت الموارد البشرية", cls: "bg-violet-50 text-violet-600", step: 3 },
  awaiting_finance: { label: "بانتظار المالية/المحاسبة", cls: "bg-blue-50 text-blue-600", step: 4 },
  paid: { label: "تم الصرف", cls: "bg-emerald-50 text-emerald-600", step: 5 },
  completed: { label: "مكتملة ✅", cls: "bg-emerald-100 text-emerald-700", step: 6 },
  rejected: { label: "مرفوضة", cls: "bg-rose-50 text-rose-600", step: 0 },
  pending: { label: "بانتظار", cls: "bg-amber-50 text-amber-600", step: 1 },
  approved: { label: "موافق", cls: "bg-emerald-50 text-emerald-600", step: 6 },
};
const en = {
  pending_manager: { label: "Awaiting direct manager", cls: "bg-amber-50 text-amber-600", step: 1 },
  manager_approved: { label: "Manager approved — awaiting HR", cls: "bg-blue-50 text-blue-600", step: 2 },
  hr_approved: { label: "HR approved", cls: "bg-violet-50 text-violet-600", step: 3 },
  awaiting_finance: { label: "Awaiting Finance/Accounting", cls: "bg-blue-50 text-blue-600", step: 4 },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-600", step: 5 },
  completed: { label: "Completed ✅", cls: "bg-emerald-100 text-emerald-700", step: 6 },
  rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-600", step: 0 },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-600", step: 1 },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-600", step: 6 },
};

export function badge(stage) {
  const map = isAr() ? ar : en;
  return map[stage] || { label: stage || "—", cls: "bg-slate-100 text-slate-600", step: 0 };
}

// حساب تعويض التذكرة عند التصفية الكاملة للإجازة
export function leaveTicketAmount(employee, org) {
  const currentYear = new Date().getFullYear();
  const lastUsed = Number(employee?.ticket_last_used_year) || 0;
  const ticketValue = Number(org?.ticket_value) || 0;
  if (employee?.ticket_entitlement === "none" || ticketValue <= 0) return 0;
  const cycle = employee?.ticket_entitlement === "biennial" ? 2 : 1;
  if (currentYear - lastUsed >= cycle) return ticketValue;
  return 0;
}

// أنواع الطلبات التي تتطلب صرفاً مالياً
export function needsFinance(req, employee, org) {
  if (!req) return false;
  if (!req.leave_type) return true;
  if (req.is_full_clearance) return true;
  return req.leave_type === 'annual';
}