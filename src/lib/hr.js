export function formatCurrency(n) {
  return `${(Number(n) || 0).toLocaleString("en-US")} ر.س`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function leaveTypeLabel(type) {
  const map = {
    annual: "إجازة سنوية",
    sick: "إجازة مرضية",
    emergency: "إجازة طارئة",
    unpaid: "بدون راتب",
    maternity: "إجازة أمومة",
  };
  return map[type] || type;
}

export function statusColors(status) {
  if (status === "pending") return "bg-amber-50 text-amber-600";
  if (status === "approved") return "bg-emerald-50 text-emerald-600";
  return "bg-rose-50 text-rose-600";
}

export function statusEmployeeLabel(status) {
  const map = {
    active: { label: "على رأس العمل", cls: "bg-emerald-50 text-emerald-600" },
    on_leave: { label: "في إجازة", cls: "bg-amber-50 text-amber-600" },
    terminated: { label: "منهي", cls: "bg-rose-50 text-rose-600" },
    resigned: { label: "مستقيل", cls: "bg-slate-100 text-slate-500" },
  };
  return map[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
}

export function attendanceStatusLabel(status) {
  const map = {
    present: { label: "حاضر", cls: "bg-emerald-50 text-emerald-600" },
    late: { label: "متأخر", cls: "bg-amber-50 text-amber-600" },
    absent: { label: "غائب", cls: "bg-rose-50 text-rose-600" },
    leave: { label: "إجازة", cls: "bg-blue-50 text-blue-600" },
    holiday: { label: "عطلة", cls: "bg-violet-50 text-violet-600" },
  };
  return map[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
}

export function payrollStatusLabel(status) {
  const map = {
    draft: { label: "مسودة", cls: "bg-slate-100 text-slate-600" },
    approved: { label: "معتمد", cls: "bg-blue-50 text-blue-600" },
    paid: { label: "مصروف", cls: "bg-emerald-50 text-emerald-600" },
  };
  return map[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
}