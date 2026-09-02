// دوال احتساب الرواتب بحسب الحضور الفعلي — مرآة خادمية لـ src/lib/payrollCompute.js
// (تُستخدم في إجراءات بوابة الموظف المُفوّضة بصلاحية الرواتب لتفادي قيود RLS).

export const PAID_STATUSES = new Set(["present", "late", "leave", "holiday"]);

export const computeWorkDaysSet = (workDaysStr: any) =>
  new Set(String(workDaysStr || "0,1,2,3,4,6").split(",").map((d) => Number(d.trim())).filter((n) => !isNaN(n)));

export const computeWorkDaysInMonth = (year: number, month: number, workDaysSet: Set<number>) => {
  const days = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= days; d++) {
    if (workDaysSet.has(new Date(year, month - 1, d).getDay())) count++;
  }
  return count;
};

export const computeDailyWage = (gross: number, workDaysInMonth: number) => (workDaysInMonth ? Number(gross) / workDaysInMonth : 0);
export const computeHourlyWage = (dailyWage: number, workHoursPerDay: number) => (workHoursPerDay > 0 ? dailyWage / workHoursPerDay : 0);

export const computeAbsentDeduction = (gross: number, absentDays: number, absentHours: number, workDaysInMonth: number, workHoursPerDay: number) => {
  const daily = computeDailyWage(gross, workDaysInMonth);
  const hourly = computeHourlyWage(daily, workHoursPerDay);
  return Number(((absentDays || 0) * daily + (absentHours || 0) * hourly).toFixed(2));
};

export const computeNetFromAttendance = (gross: number, absentDays: number, absentHours: number, workDaysInMonth: number, workHoursPerDay: number, bonus: number, overtime: number, deductions: number, loan: number) => {
  if (!workDaysInMonth) return 0;
  const absentDeduction = computeAbsentDeduction(gross, absentDays, absentHours, workDaysInMonth, workHoursPerDay);
  const net = (Number(gross) || 0) - absentDeduction + (bonus || 0) + (overtime || 0) - (deductions || 0) - (loan || 0);
  return Number(net.toFixed(2));
};