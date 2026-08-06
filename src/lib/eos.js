// حساب نهاية الخدمة والتأمينات الاجتماعية وفق نظام العمل السعودي

// نهاية الخدمة - المواد 84 و85
// عند انتهاء العقد أو إنهاء صاحب العمل: نصف شهر عن كل من أول 5 سنوات + شهر كامل عن كل سنة بعدها.
// عند الاستقالة (المادة 85): أقل من سنتين لا شيء، 2-5 سنوات الثلث، 5-10 الثلثان، 10 فأكثر كامل.
// الفصل لأسباب مشروعة (المادة 80): لا شيء.

// أسباب إنهاء الخدمة ومواد نظام العمل السعودي المقابلة
// category: full = مكافأة كاملة | partial = مكافأة جزئية (مادة 85) | none = لا تستحق
export const terminationReasons = [
  { value: "end_of_contract", label: "انتهاء العقد محدد المدة", article: "مادة 74", note: "انتهاء مدة العقد المحددة — مكافأة كاملة (مادة 84)", category: "full" },
  { value: "contract_non_renewal", label: "عدم التجديد / عدم الرغبة بالتمديد", article: "مادة 75", note: "إنهاء العقد من أحد الطرفين بإخطار مسبق — مكافأة كاملة", category: "full" },
  { value: "employer_termination", label: "إنهاء العقد من صاحب العمل", article: "مادة 84", note: "إنهاء من صاحب العمل — مكافأة كاملة", category: "full" },
  { value: "unjustified_dismissal", label: "فصل تعسفي / إنهاء مخالف للنظام", article: "مادة 77", note: "الإنهاء المخالف للنظام يُوجب تعويض العامل عن الفصل التعسفي", category: "full" },
  { value: "resignation", label: "استقالة العامل", article: "مادة 85", note: "مكافأة جزئية حسب مدة الخدمة (أقل من سنتين لا شيء، 2-5 الثلث، 5-10 الثلثان، 10 فأكثر كاملة)", category: "partial" },
  { value: "dismissal_for_cause", label: "فصل لأسباب مشروعة", article: "مادة 80", note: "الأسباب الواردة في المادة 80 — لا يستحق مكافأة ولا إشعاراً", category: "none" },
  { value: "employee_leave_with_rights", label: "ترك العامل العمل لأسباب جائزة", article: "مادة 81", note: "ترك العامل العمل لسبب مشروع — يحتفظ بكامل حقوقه ومكافأته", category: "full" },
  { value: "mutual_consent", label: "إنهاء العقد بالتراضي", article: "مادة 74", note: "اتفاق الطرفين — يُراعى ما تم الاتفاق عليه ضمن العقد", category: "full" },
  { value: "death", label: "وفاة العامل", article: "مادة 74", note: "تنصرف مكافأة نهاية الخدمة للورثة بالكامل", category: "full" },
  { value: "incapacity", label: "العجز أو عدم اللياقة الصحية", article: "مادة 74", note: "انتهاء العقد بسبب العجز الصحي — مكافأة مستحقة", category: "full" },
  { value: "force_majeure", label: "القوة القاهرة", article: "مادة 74", note: "ظرف خارج عن إرادة الطرفين — يُقدّر حسب الحالة", category: "none" },
];

export function reasonMeta(reason) {
  return terminationReasons.find((r) => r.value === reason) || { label: reason, note: "" };
}

// مرجع مواد نظام العمل المستخدمة في حساب نهاية الخدمة
export const eosArticleReference = [
  { article: "مادة 74", title: "انتهاء عقد العمل", desc: "حالات انتهاء العقد: انتهاء المدة، التراضي، الوفاة، العجز، القوة القاهرة." },
  { article: "مادة 75", title: "إنهاء العقد بإرادة منفردة", desc: "جواز إنهاء العقد من أي طرف بشرط الإخطار المسبق المحدد نظاماً." },
  { article: "مادة 77", title: "الإنهاء المخالف للنظام", desc: "تعويض الطرف المتضرر عن إنهاء العقد بطريقة مخالفة لأحكام النظام." },
  { article: "مادة 80", title: "الفصل دون مكافأة", desc: "الأسباب التي تخوّل صاحب العمل الفصل دون مكافأة ولا إشعار." },
  { article: "مادة 81", title: "ترك العامل العمل", desc: "حالات يحق فيها للعامل ترك العمل مع الاحتفاظ بكل حقوقه ومكافأته." },
  { article: "مادة 84", title: "أساس حساب المكافأة", desc: "نصف شهر عن كل سنة من أول خمس سنوات، وشهر كامل عن كل سنة بعدها." },
  { article: "مادة 85", title: "مكافأة الاستقالة", desc: "احتساب جزء من المكافأة بحسب مدة الخدمة عند الاستقالة." },
];

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

  const category = reasonMeta(reason).category || (reason === "resignation" ? "partial" : "none");
  let amount = 0;
  let fractionLabel = "";
  if (category === "full") {
    amount = fullEOS;
    fractionLabel = "كاملة (100%)";
  } else if (category === "partial") {
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

// مخالصة نهاية الخدمة الكاملة: مكافأة + تصفية رصيد الإجازات + تعويض التذكرة
export function computeSettlement({ employee, org, lastWorkingDate, reason }) {
  const basis = org?.eos_basis || "gross";
  const eos = computeEOS({ employee, lastWorkingDate, reason, basis });

  // تصفية الإجازات المستحقة (الأجر اليومي × عدد الأيام المتبقية)
  const leaveBalance = Number(employee.leave_balance) || 0;
  const leaveCash = Number((eos.dailyWage * leaveBalance).toFixed(2));

  // تعويض التذكرة حسب سياسة المنشأة وآخر استخدام
  const currentYear = new Date().getFullYear();
  const lastUsed = Number(employee.ticket_last_used_year) || 0;
  const ticketValue = Number(org?.ticket_value) || 0;
  let ticketAmount = 0;
  if (employee.ticket_entitlement !== "none" && ticketValue > 0) {
    const cycle = employee.ticket_entitlement === "biennial" ? 2 : 1;
    if (currentYear - lastUsed >= cycle) ticketAmount = ticketValue;
  }

  const total = Number((eos.amount + leaveCash + ticketAmount).toFixed(2));
  return {
    ...eos,
    basis,
    leaveBalance,
    leaveCash,
    ticketEntitlement: employee.ticket_entitlement,
    ticketValue,
    ticketAmount,
    total_settlement: total,
  };
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