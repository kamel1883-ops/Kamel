// دوال احتساب الرواتب بحسب الحضور الفعلي — مشتركة بين بوابة الإدارة وبوابة الموظف
// (المُفوّض بصلاحية الرواتب) لتفادي الازدواجية وضمان اتساق الأرقام.

export const PAID_STATUSES = new Set(["present", "late", "leave", "holiday"]);

export const computeWorkDaysSet = (workDaysStr) =>
  new Set(String(workDaysStr || "0,1,2,3,4,6").split(",").map((d) => Number(d.trim())).filter((n) => !isNaN(n)));

export const computeWorkDaysInMonth = (year, month, workDaysSet) => {
  const days = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= days; d++) {
    if (workDaysSet.has(new Date(year, month - 1, d).getDay())) count++;
  }
  return count;
};

// الأجر اليومي = الإجمالي ÷ أيام عمل المنشأة بالشهر، والأجر بالساعة = الأجر اليومي ÷ ساعات اليوم
export const computeDailyWage = (gross, workDaysInMonth) => (workDaysInMonth ? Number(gross) / workDaysInMonth : 0);
export const computeHourlyWage = (dailyWage, workHoursPerDay) => (workHoursPerDay > 0 ? dailyWage / workHoursPerDay : 0);

// قيمة خصم الغياب (أيام + ساعات)
export const computeAbsentDeduction = (gross, absentDays, absentHours, workDaysInMonth, workHoursPerDay) => {
  const daily = computeDailyWage(gross, workDaysInMonth);
  const hourly = computeHourlyWage(daily, workHoursPerDay);
  return Number(((absentDays || 0) * daily + (absentHours || 0) * hourly).toFixed(2));
};

// الصافي = الإجمالي − خصم الغياب + الحوافز + العمل الإضافي − الخصومات الأخرى − السلفة
export const computeNetFromAttendance = (gross, absentDays, absentHours, workDaysInMonth, workHoursPerDay, bonus, overtime, deductions, loan) => {
  if (!workDaysInMonth) return 0;
  const absentDeduction = computeAbsentDeduction(gross, absentDays, absentHours, workDaysInMonth, workHoursPerDay);
  const net = (Number(gross) || 0) - absentDeduction + (bonus || 0) + (overtime || 0) - (deductions || 0) - (loan || 0);
  return Number(net.toFixed(2));
};

// يعيد بناء سجل رواتب واحد بعد تعديل حقل مالي وإعادة احتساب الإجمالي/خصم الغياب/الصافي
export const recomputeRow = (rec, workDaysInMonth, workHoursPerDay) => {
  const updated = { ...rec };
  updated.gross_salary =
    (Number(updated.base_salary) || 0) + (Number(updated.housing_allowance) || 0) +
    (Number(updated.transport_allowance) || 0) + (Number(updated.other_allowances) || 0);
  updated.absent_deduction = computeAbsentDeduction(
    updated.gross_salary, updated.absent_days, updated.absent_hours, workDaysInMonth, workHoursPerDay
  );
  updated.net_salary = computeNetFromAttendance(
    updated.gross_salary, updated.absent_days, updated.absent_hours, workDaysInMonth, workHoursPerDay,
    updated.bonus, updated.overtime_amount, updated.deductions, updated.loan_installment
  );
  return updated;
};