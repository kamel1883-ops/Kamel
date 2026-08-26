// حسابات مالية لبوابة المالك: توزيع الإيرادات والمصروفات (بما فيها المتكررة والعمولات)
// على فترات زمنية (يومي / أسبوعي / شهري / ربع سنوي / سنوي) واستخراج الصافي لكل فترة.

export const PERIOD_COUNT = { day: 30, week: 12, month: 12, quarter: 8, year: 5 };

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s) => (s ? new Date(String(s).slice(0, 10) + "T00:00:00") : null);

const startOf = (date, mode) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (mode === "day") return d;
  if (mode === "week") { d.setDate(d.getDate() - d.getDay()); return d; }
  if (mode === "month") return new Date(d.getFullYear(), d.getMonth(), 1);
  if (mode === "quarter") return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
  return new Date(d.getFullYear(), 0, 1);
};

const shift = (d, mode, n) => {
  const x = new Date(d);
  if (mode === "day") x.setDate(x.getDate() + n);
  else if (mode === "week") x.setDate(x.getDate() + 7 * n);
  else if (mode === "month") x.setMonth(x.getMonth() + n);
  else if (mode === "quarter") x.setMonth(x.getMonth() + 3 * n);
  else x.setFullYear(x.getFullYear() + n);
  return x;
};

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const labelOf = (d, mode, isAr) => {
  const months = isAr ? MONTHS_AR : MONTHS_EN;
  if (mode === "day") return iso(d);
  if (mode === "week") return `${isAr ? "أسبوع" : "Week of"} ${iso(d)}`;
  if (mode === "month") return `${months[d.getMonth()]} ${d.getFullYear()}`;
  if (mode === "quarter") return `${isAr ? "الربع" : "Q"}${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
  return String(d.getFullYear());
};

// الفترات من الأقدم للأحدث، آخرها الفترة الحالية
export function buildPeriods(mode, isAr) {
  const count = PERIOD_COUNT[mode] || 12;
  const current = startOf(new Date(), mode);
  const out = [];
  for (let i = count - 1; i >= 0; i--) {
    const s = shift(current, mode, -i);
    out.push({ start: iso(s), end: iso(shift(s, mode, 1)), label: labelOf(s, mode, isAr) });
  }
  return out;
}

// توزيع مصروف على تواريخ فعلية داخل نطاق [from, to) — يعيد قائمة { date, amount }
export function expenseOccurrences(exp, fromISO, toISO) {
  const amount = Number(exp.amount) || 0;
  const start = parse(exp.expense_date);
  if (!start || amount <= 0) return [];
  const from = parse(fromISO), to = parse(toISO);
  const stop = parse(exp.end_date);
  const hardEnd = stop && stop < to ? stop : to;
  const rec = exp.recurrence || "one_time";
  if (rec === "per_revenue") return []; // تُحسب كنسبة من الإيراد داخل financeRows
  if (rec === "one_time") return start >= from && start < to ? [{ date: iso(start), amount }] : [];
  const out = [];
  const cur = new Date(start);
  let guard = 0;
  while (cur < hardEnd && guard++ < 600) {
    if (cur >= from) out.push({ date: iso(cur), amount });
    if (rec === "monthly") cur.setMonth(cur.getMonth() + 1);
    else cur.setFullYear(cur.getFullYear() + 1);
  }
  return out;
}

const revenueDate = (r) => r.paid_date || r.period_start || String(r.created_date || "").slice(0, 10);

// صفوف التقرير: إيراد ومصروف وصافي لكل فترة + الإجماليات
export function financeRows({ revenues = [], expenses = [], mode = "month", isAr = true }) {
  const periods = buildPeriods(mode, isAr);
  const from = periods[0].start, to = periods[periods.length - 1].end;
  const rows = periods.map((p) => ({ ...p, revenue: 0, expense: 0, net: 0 }));
  const idx = (d) => rows.findIndex((r) => d >= r.start && d < r.end);

  for (const r of revenues) {
    if (r.status && r.status !== "paid") continue;
    const d = revenueDate(r);
    const i = d ? idx(d) : -1;
    if (i >= 0) rows[i].revenue += Number(r.amount) || 0;
  }
  // نِسب تُدفع مع كل إيراد (نسبة شريك/مستفيد) — تُحسب من إيراد كل فترة
  const perRevenuePct = expenses
    .filter((e) => e.recurrence === "per_revenue" && e.status !== "stopped")
    .reduce((s, e) => s + (Number(e.commission_percent) || 0), 0);
  if (perRevenuePct > 0) {
    for (const r of rows) r.expense += Number((r.revenue * perRevenuePct / 100).toFixed(2));
  }

  for (const e of expenses) {
    if (e.status === "stopped" && e.recurrence !== "one_time") continue;
    for (const occ of expenseOccurrences(e, from, to)) {
      const i = idx(occ.date);
      if (i >= 0) rows[i].expense += occ.amount;
    }
  }
  for (const r of rows) r.net = Number((r.revenue - r.expense).toFixed(2));
  const totals = rows.reduce(
    (s, r) => ({ revenue: s.revenue + r.revenue, expense: s.expense + r.expense, net: s.net + r.net }),
    { revenue: 0, expense: 0, net: 0 }
  );
  return { rows, totals, from, to };
}

// إجمالي المصروف الشهري/السنوي الثابت (للعرض في البطاقات)
export function recurringTotals(expenses = []) {
  const active = expenses.filter((e) => e.status !== "stopped");
  return {
    monthly: active.filter((e) => e.recurrence === "monthly").reduce((s, e) => s + (Number(e.amount) || 0), 0),
    yearly: active.filter((e) => e.recurrence === "yearly").reduce((s, e) => s + (Number(e.amount) || 0), 0),
  };
}

export const EXPENSE_CATEGORIES = [
  { key: "platform", ar: "منصة / اشتراك برمجي", en: "Platform / SaaS" },
  { key: "server", ar: "سيرفر / استضافة", en: "Server / Hosting" },
  { key: "domain", ar: "دومين", en: "Domain" },
  { key: "email", ar: "بريد إلكتروني", en: "Email" },
  { key: "marketing", ar: "حملات تسويقية", en: "Marketing" },
  { key: "commission", ar: "عمولة مسوّق", en: "Sales commission" },
  { key: "partner_share", ar: "نسبة مستفيد / شريك", en: "Partner share" },
  { key: "salary", ar: "رواتب وأجور", en: "Salaries" },
  { key: "tools", ar: "أدوات وخدمات", en: "Tools & services" },
  { key: "other", ar: "أخرى", en: "Other" },
];

export const RECURRENCES = [
  { key: "one_time", ar: "مرة واحدة", en: "One time" },
  { key: "monthly", ar: "شهري", en: "Monthly" },
  { key: "yearly", ar: "سنوي", en: "Yearly" },
];