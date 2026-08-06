// حساب نهاية الخدمة والتأمينات الاجتماعية وفق نظام العمل السعودي

// نهاية الخدمة - المواد 84 و85
// عند انتهاء العقد أو إنهاء صاحب العمل: نصف شهر عن كل من أول 5 سنوات + شهر كامل عن كل سنة بعدها.
// عند الاستقالة (المادة 85): أقل من سنتين لا شيء، 2-5 سنوات الثلث، 5-10 الثلثان، 10 فأكثر كامل.
// الفصل لأسباب مشروعة (المادة 80): لا شيء.

export const terminationReasons = [
  { value: "end_of_contract", label: "انتهاء العقد", note: "المادة 84 - مكافأة كاملة" },
  { value: "employer_termination", label: "إنهاء من صاحب العمل", note: "المادة 84 - مكافأة كاملة" },
  { value: "resignation", label: "استقالة", note: "المادة 85 - مكافأة جزئية حسب المدة" },
  { value: "dismissal_for_cause", label: "فصل لأسباب مشروعة", note: "المادة 80 - لا تستحق مكافأة" },
  { value: "force_majeure", label: "القوة القاهرة", note: "لا تستحق مكافأة" },
];

export function reasonMeta(reason) {
  return terminationReasons.find((r) => r.value === reason) || { label: reason, note: "" };
}

export function computeYearsOfService(hireDate, lastWorkingDate) {
  if (!hireDate || !lastWorkingDate) return 0;
  const start = new Date(hireDate);
  const end = new Date(lastWorkingDate);
  const ms = end - start;
  if (ms < 0) return 0;
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

// الأساس: الراتب الذي تُحسب عليه مكافأة نهاية الخدمة
export function eosSalaryBasis(employee, basis = "gross") {
  const base = Number(employee.base_salary) || 0;
  if (basis === "base_only") return base;
  return base + (Number(employee.housing_allowance) || 0) + (Number(employee.transport_allowance) || 0) + (Number(employee.other_allowances) || 0);
}

export function computeEOS({ employee, lastWorkingDate, reason, basis = "gross" }) {
  const lwd = lastWorkingDate || employee.termination_date || todayISO();
  const years = computeYearsOfService(employee.hire_date, lwd);
  const monthlyWage = eosSalaryBasis(employee, basis);
  //ورب عمل للموظف: نصف شهر عن كل سنة من أول خمس سنوات + شهر كامل لكل سنة بعدها.
  let fullFraction = 0;
  if (years >= 1) {
    const first5 = Math.min(years, 5);
    const beyond = Math.max(0, years - 5);
    fullFraction = first5 * 0.5 + beyond * 1;
  }
  const fullEOS = monthlyWage * fullFraction;

  let amount = 0;
  let fractionLabel = "";
  if (reason === "end_of_contract" || reason === "employer_termination") {
    amount = fullEOS;
    fractionLabel = "كاملة (100%)";
  } else if (reason === "resignation") {
    if (years < 2) { amount = 0; fractionLabel = "لا شيء (أقل من سنتين)"; }
    else if (years < 5) { amount = fullEOS * (1 / 3); fractionLabel = "ثلث (1/3)"; }
    else if (years < 10) { amount = fullEOS * (2 / 3); fractionLabel = "ثلثان (2/3)"; }
    else { amount = fullEOS; fractionLabel = "كاملة (10 سنوات فأكثر)"; }
  } else {
    amount = 0;
    fractionLabel = "لا تستحق (مادة 80)";
  }
  const monthlyWageForDaily = monthlyWage / 30;
  return { years: years.toFixed(2), monthlyWage, dailyWage: monthlyWageForDaily, fullEOS, amount, fractionLabel, lastWorkingDate: lwd };
}

// التأمينات الاجتماعية (GOSI)
// سعودي: 9.75% موظف + 9.75% رب عمل (المعاشات) + حوادث العمل أحياناً
// مقيم: 2% رب عمل فقط (حوادث العمل)
export function computeGOSI({ employee, org }) {
  const gross = eosSalaryBasis(employee, "gross");
  const isSaudi = employee.is_saudi || isSaudiNationalId(employee.national_id);
  if (isSaudi) {
    const empRate = (Number(org?.gosi_saudi_employee_rate) || 9.75) / 100;
    const employerRate = (Number(org?.gosi_saudi_employer_rate) || 9.75) / 100;
    return { isSaudi: true, gosi_employee: gross * empRate, gosi_employer: gross * employerRate, gross };
  }
  const expatRate = (Number(org?.gosi_expat_employer_rate) || 2) / 100;
  return { isSaudi: false, gosi_employee: 0, gosi_employer: gross * expatRate, gross };
}

// الهوية الوطنية السعودية تبدأ برقم 1 للمواطنين
export function isSaudiNationalId(id) {
  if (!id) return false;
  const s = String(id).trim().replace(/\s|-/g, "");
  return /^1\d{9}$/.test(s) || s.startsWith("1");
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// الأيام المتبقية حتى تاريخ (عددي، سالب = متأخر)
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date(todayISO());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const SEVERITY = {
  expired: { label: "منتهي", cls: "bg-rose-100 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  critical: { label: "خلال 30 يوم", cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  soon: { label: "خلال 90 يوم", cls: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  ok: { label: "ساري", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

export function expirySeverity(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return SEVERITY.ok;
  if (d < 0) return SEVERITY.expired;
  if (d <= 30) return SEVERITY.critical;
  if (d <= 90) return SEVERITY.soon;
  return SEVERITY.ok;
}