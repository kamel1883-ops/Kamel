// تقارير المصروفات لبوابة المالك: كشف حساب لكل مستفيد/شريك، وتحليل حسب النوع،
// والالتزامات المتكررة — كلها موزّعة على فترات (شهري / ربع سنوي / نصف سنوي / سنوي).
import { expenseOccurrences } from "@/lib/finance";

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const REPORT_PERIODS = [
  { key: "month", ar: "شهري", en: "Monthly", months: 1, count: 12 },
  { key: "quarter", ar: "ربع سنوي", en: "Quarterly", months: 3, count: 8 },
  { key: "half", ar: "نصف سنوي", en: "Half-yearly", months: 6, count: 6 },
  { key: "year", ar: "سنوي", en: "Yearly", months: 12, count: 5 },
];

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// فترات متساوية بالأشهر تنتهي بالفترة الحالية
export function reportPeriods(key, isAr) {
  const cfg = REPORT_PERIODS.find((p) => p.key === key) || REPORT_PERIODS[0];
  const now = new Date();
  const anchorMonth = Math.floor(now.getMonth() / cfg.months) * cfg.months;
  const out = [];
  for (let i = cfg.count - 1; i >= 0; i--) {
    const s = new Date(now.getFullYear(), anchorMonth - cfg.months * i, 1);
    const e = new Date(s.getFullYear(), s.getMonth() + cfg.months, 1);
    const months = isAr ? MONTHS_AR : MONTHS_EN;
    let label;
    if (cfg.months === 1) label = `${months[s.getMonth()]} ${s.getFullYear()}`;
    else if (cfg.months === 12) label = String(s.getFullYear());
    else if (cfg.months === 3) label = `${isAr ? "الربع" : "Q"}${Math.floor(s.getMonth() / 3) + 1} ${s.getFullYear()}`;
    else label = `${isAr ? "النصف" : "H"}${Math.floor(s.getMonth() / 6) + 1} ${s.getFullYear()}`;
    out.push({ start: iso(s), end: iso(e), label });
  }
  return out;
}

const sumInRange = (exp, from, to) =>
  expenseOccurrences(exp, from, to).reduce((s, o) => s + o.amount, 0);

// كشف حساب لكل مستفيد/شريك/مسوّق (بناءً على partner_name) موزّعاً على الفترات
export function partnerStatements({ expenses = [], periodKey = "month", isAr = true }) {
  const periods = reportPeriods(periodKey, isAr);
  const rows = new Map();
  for (const e of expenses) {
    const name = (e.partner_name || "").trim();
    if (!name) continue;
    const cells = periods.map((p) => sumInRange(e, p.start, p.end));
    const prev = rows.get(name) || { name, cells: periods.map(() => 0), entries: 0, percents: new Set() };
    prev.cells = prev.cells.map((v, i) => v + cells[i]);
    prev.entries += 1;
    if (e.commission_percent) prev.percents.add(Number(e.commission_percent));
    rows.set(name, prev);
  }
  const out = [...rows.values()].map((r) => ({
    ...r,
    percents: [...r.percents].sort((a, b) => a - b),
    total: Number(r.cells.reduce((s, v) => s + v, 0).toFixed(2)),
  })).sort((a, b) => b.total - a.total);
  const totals = periods.map((_, i) => out.reduce((s, r) => s + r.cells[i], 0));
  return { periods, rows: out, totals, grand: totals.reduce((s, v) => s + v, 0) };
}

// المصروفات حسب النوع موزّعة على الفترات
export function categoryStatements({ expenses = [], periodKey = "month", isAr = true }) {
  const periods = reportPeriods(periodKey, isAr);
  const map = new Map();
  for (const e of expenses) {
    const key = e.category || "other";
    const cells = periods.map((p) => sumInRange(e, p.start, p.end));
    const prev = map.get(key) || { key, cells: periods.map(() => 0), entries: 0 };
    prev.cells = prev.cells.map((v, i) => v + cells[i]);
    prev.entries += 1;
    map.set(key, prev);
  }
  const out = [...map.values()].map((r) => ({ ...r, total: Number(r.cells.reduce((s, v) => s + v, 0).toFixed(2)) }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);
  const totals = periods.map((_, i) => out.reduce((s, r) => s + r.cells[i], 0));
  return { periods, rows: out, totals, grand: totals.reduce((s, v) => s + v, 0) };
}

// الالتزامات المتكررة السارية + التزام سنوي متوقّع (للتخطيط)
export function recurringCommitments(expenses = []) {
  const active = expenses.filter((e) => e.status !== "stopped" && e.recurrence !== "one_time");
  const rows = active.map((e) => {
    const amount = Number(e.amount) || 0;
    const monthly = e.recurrence === "monthly" ? amount : Number((amount / 12).toFixed(2));
    return { ...e, monthly, yearly: Number((monthly * 12).toFixed(2)) };
  }).sort((a, b) => b.yearly - a.yearly);
  return {
    rows,
    monthly: Number(rows.reduce((s, r) => s + r.monthly, 0).toFixed(2)),
    yearly: Number(rows.reduce((s, r) => s + r.yearly, 0).toFixed(2)),
  };
}