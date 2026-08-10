// حساب نهاية الخدمة والتأمينات الاجتماعية وفق نظام العمل السعودي — ثنائية اللغة
import { isAr } from "@/lib/lang";

export const terminationReasons = [
  { value: "end_of_contract", category: "full", ar: { label: "انتهاء العقد محدد المدة", article: "مادة 74", note: "انتهاء مدة العقد المحددة — مكافأة كاملة (مادة 84)" }, en: { label: "End of fixed-term contract", article: "Art. 74", note: "End of fixed term — full award (Art. 84)" } },
  { value: "contract_non_renewal", category: "full", ar: { label: "عدم التجديد / عدم الرغبة بالتمديد", article: "مادة 75", note: "إنهاء العقد من أحد الطرفين بإخطار مسبق — مكافأة كاملة" }, en: { label: "Non-renewal", article: "Art. 75", note: "Termination by either party with prior notice — full award" } },
  { value: "employer_termination", category: "full", ar: { label: "إنهاء العقد من صاحب العمل", article: "مادة 84", note: "إنهاء من صاحب العمل — مكافأة كاملة" }, en: { label: "Employer termination", article: "Art. 84", note: "Employer termination — full award" } },
  { value: "unjustified_dismissal", category: "full", ar: { label: "فصل تعسفي / إنهاء مخالف للنظام", article: "مادة 77", note: "الإنهاء المخالف للنظام يُوجب تعويض العامل عن الفصل التعسفي" }, en: { label: "Unjustified dismissal", article: "Art. 77", note: "Unlawful termination entitles compensation" } },
  { value: "resignation", category: "partial", ar: { label: "استقالة العامل", article: "مادة 85", note: "مكافأة جزئية حسب مدة الخدمة (أقل من سنتين لا شيء، 2-5 الثلث، 5-10 الثلثان، 10 فأكثر كاملة)" }, en: { label: "Employee resignation", article: "Art. 85", note: "Partial award by tenure (<2y none, 2-5 one third, 5-10 two thirds, 10+ full)" } },
  { value: "dismissal_for_cause", category: "none", ar: { label: "فصل لأسباب مشروعة", article: "مادة 80", note: "الأسباب الواردة في المادة 80 — لا يستحق مكافأة ولا إشعاراً" }, en: { label: "Dismissal for cause", article: "Art. 80", note: "Art. 80 grounds — no award or notice" } },
  { value: "employee_leave_with_rights", category: "full", ar: { label: "ترك العامل العمل لأسباب جائزة", article: "مادة 81", note: "ترك العامل العمل لسبب مشروع — يحتفظ بكامل حقوقه ومكافأته" }, en: { label: "Employee leave with rights", article: "Art. 81", note: "Lawful reason — keeps full rights and award" } },
  { value: "mutual_consent", category: "full", ar: { label: "إنهاء العقد بالتراضي", article: "مادة 74", note: "اتفاق الطرفين — يُراعى ما تم الاتفاق عليه ضمن العقد" }, en: { label: "Mutual consent", article: "Art. 74", note: "By agreement — per contract terms" } },
  { value: "death", category: "full", ar: { label: "وفاة العامل", article: "مادة 74", note: "تنصرف مكافأة نهاية الخدمة للورثة بالكامل" }, en: { label: "Death", article: "Art. 74", note: "Award paid in full to heirs" } },
  { value: "incapacity", category: "full", ar: { label: "العجز أو عدم اللياقة الصحية", article: "مادة 74", note: "انتهاء العقد بسبب العجز الصحي — مكافأة مستحقة" }, en: { label: "Incapacity / unfitness", article: "Art. 74", note: "Termination for health incapacity — award due" } },
  { value: "force_majeure", category: "none", ar: { label: "القوة القاهرة", article: "مادة 74", note: "ظرف خارج عن إرادة الطرفين — يُقدّر حسب الحالة" }, en: { label: "Force majeure", article: "Art. 74", note: "Beyond parties' control — assessed per case" } },
];

export function reasonMeta(reason) {
  const r = terminationReasons.find((x) => x.value === reason);
  if (!r) return { label: reason, note: "", article: "", category: reason === "resignation" ? "partial" : "none" };
  const m = isAr() ? r.ar : r.en;
  return { category: r.category, ...m };
}

export const eosArticleReference = [
  { article: "مادة 74", ar: { title: "انتهاء عقد العمل", desc: "حالات انتهاء العقد: انتهاء المدة، التراضي، الوفاة، العجز، القوة القاهرة." }, en: { title: "End of contract", desc: "Cases: term end, mutual consent, death, incapacity, force majeure." } },
  { article: "مادة 75", ar: { title: "إنهاء العقد بإرادة منفردة", desc: "جواز إنهاء العقد من أي طرف بشرط الإخطار المسبق المحدد نظاماً." }, en: { title: "Unilateral termination", desc: "Either party may terminate with the legally required notice." } },
  { article: "مادة 77", ar: { title: "الإنهاء المخالف للنظام", desc: "تعويض الطرف المتضرر عن إنهاء العقد بطريقة مخالفة لأحكام النظام." }, en: { title: "Unlawful termination", desc: "Compensation for the aggrieved party on unlawful termination." } },
  { article: "مادة 80", ar: { title: "الفصل دون مكافأة", desc: "الأسباب التي تخوّل صاحب العمل الفصل دون مكافأة ولا إشعار." }, en: { title: "Dismissal without award", desc: "Grounds allowing dismissal without award or notice." } },
  { article: "مادة 81", ar: { title: "ترك العامل العمل", desc: "حالات يحق فيها للعامل ترك العمل مع الاحتفاظ بكل حقوقه ومكافأته." }, en: { title: "Employee leaving", desc: "Cases where the employee may leave keeping full rights and award." } },
  { article: "مادة 84", ar: { title: "أساس حساب المكافأة", desc: "نصف شهر عن كل سنة من أول خمس سنوات، وشهر كامل عن كل سنة بعدها." }, en: { title: "Award basis", desc: "Half a month per year for the first five years, a full month per year thereafter." } },
  { article: "مادة 85", ar: { title: "مكافأة الاستقالة", desc: "احتساب جزء من المكافأة بحسب مدة الخدمة عند الاستقالة." }, en: { title: "Resignation award", desc: "Partial award by tenure on resignation." } },
];

export function computeYearsOfService(hireDate, lastWorkingDate) {
  if (!hireDate || !lastWorkingDate) return 0;
  const start = new Date(hireDate);
  const end = new Date(lastWorkingDate);
  const ms = end - start;
  if (ms < 0) return 0;
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

export function eosSalaryBasis(employee, basis = "gross") {
  const base = Number(employee.base_salary) || 0;
  if (basis === "base_only") return base;
  return base + (Number(employee.housing_allowance) || 0) + (Number(employee.transport_allowance) || 0) + (Number(employee.other_allowances) || 0);
}

export function computeEOS({ employee, lastWorkingDate, reason, basis = "gross" }) {
  const lwd = lastWorkingDate || employee.termination_date || todayISO();
  const years = computeYearsOfService(employee.hire_date, lwd);
  const monthlyWage = eosSalaryBasis(employee, basis);
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
  const L = isAr();
  if (category === "full") {
    amount = fullEOS;
    fractionLabel = L ? "كاملة (100%)" : "Full (100%)";
  } else if (category === "partial") {
    if (years < 2) { amount = 0; fractionLabel = L ? "لا شيء (أقل من سنتين)" : "None (under 2 years)"; }
    else if (years < 5) { amount = fullEOS * (1 / 3); fractionLabel = L ? "ثلث (1/3)" : "One third (1/3)"; }
    else if (years < 10) { amount = fullEOS * (2 / 3); fractionLabel = L ? "ثلثان (2/3)" : "Two thirds (2/3)"; }
    else { amount = fullEOS; fractionLabel = L ? "كاملة (10 سنوات فأكثر)" : "Full (10+ years)"; }
  } else {
    amount = 0;
    fractionLabel = L ? "لا تستحق (مادة 80)" : "Not entitled (Art. 80)";
  }
  const monthlyWageForDaily = monthlyWage / 30;
  return { years: years.toFixed(2), monthlyWage, dailyWage: monthlyWageForDaily, fullEOS, amount, fractionLabel, lastWorkingDate: lwd };
}

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

export function computeSettlement({ employee, org, lastWorkingDate, reason, leaveBalance, ticketAmount }) {
  const basis = org?.eos_basis || "gross";
  const eos = computeEOS({ employee, lastWorkingDate, reason, basis });
  const lb = leaveBalance != null ? Number(leaveBalance) : (Number(employee.leave_balance) || 0);
  const leaveCash = Number((eos.dailyWage * lb).toFixed(2));
  // قيمة التذكرة مفتوحة: أولوية للقيمة المُدخلة يدوياً (قرار مباشر من الشركة)، ثم قيمة الموظف مع مراعاة الاستحقاق والدورة
  let ticketVal = 0;
  if (ticketAmount != null && ticketAmount !== "" && Number(ticketAmount) > 0) {
    ticketVal = Number(ticketAmount);
  } else {
    const empTicket = Number(employee.ticket_value) || 0;
    if (employee.ticket_entitlement !== "none" && empTicket > 0) {
      const currentYear = new Date().getFullYear();
      const lastUsed = Number(employee.ticket_last_used_year) || 0;
      const cycle = employee.ticket_entitlement === "biennial" ? 2 : 1;
      if (currentYear - lastUsed >= cycle) ticketVal = empTicket;
    }
  }
  const total = Number((eos.amount + leaveCash + ticketVal).toFixed(2));
  return { ...eos, basis, leaveBalance: lb, leaveCash, ticketEntitlement: employee.ticket_entitlement, ticketValue: ticketVal, ticketAmount: ticketVal, total_settlement: total };
}

export function isSaudiNationalId(id) {
  if (!id) return false;
  const s = String(id).trim().replace(/\s|-/g, "");
  return /^1\d{9}$/.test(s) || s.startsWith("1");
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date(todayISO());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const SEVERITY_AR = {
  expired: { label: "منتهي", cls: "bg-rose-100 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  critical: { label: "خلال 30 يوم", cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  soon: { label: "خلال 90 يوم", cls: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  ok: { label: "ساري", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};
const SEVERITY_EN = {
  expired: { label: "Expired", cls: "bg-rose-100 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  critical: { label: "Within 30 days", cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  soon: { label: "Within 90 days", cls: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  ok: { label: "Active", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};
export const SEVERITY = SEVERITY_AR;

export function expirySeverity(dateStr) {
  const d = daysUntil(dateStr);
  const map = isAr() ? SEVERITY_AR : SEVERITY_EN;
  if (d === null) return map.ok;
  if (d < 0) return map.expired;
  if (d <= 30) return map.critical;
  if (d <= 90) return map.soon;
  return map.ok;
}