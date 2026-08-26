// تحليل الوضع المالي الفعلي لمنصة جدارة — يُبنى على نفس بيانات بوابة المالك:
// الإيرادات (اشتراكات مدفوعة) + المصروفات التشغيلية + عمولة الشركاء 7% من أول اشتراك للعميل المُحال.
import { financeRows, recurringTotals, EXPENSE_CATEGORIES } from "@/lib/finance";

export const AFFILIATE_RATE = 7;

const dateOf = (s) => String(s || "").slice(0, 10);

// عمولة الشركاء: 7% من أول اشتراك مدفوع لكل عميل جاء برمز إحالة شريك
export function affiliateCommissions(subscriptions = [], tenants = []) {
  const referred = new Map();
  for (const t of tenants) {
    if (t.referral_affiliate_id || t.referral_code) {
      referred.set(t.id, t.referral_affiliate_name || t.referral_code || "شريك");
    }
  }
  const firstByTenant = new Map();
  for (const s of subscriptions) {
    if (s.status !== "paid" || !referred.has(s.tenant_id)) continue;
    const d = dateOf(s.paid_date || s.period_start || s.created_date);
    const cur = firstByTenant.get(s.tenant_id);
    if (!cur || d < cur.date) firstByTenant.set(s.tenant_id, { date: d, amount: Number(s.amount) || 0, sub: s });
  }
  const items = [...firstByTenant.entries()].map(([tenantId, v]) => ({
    tenant_id: tenantId,
    tenant_name: v.sub.tenant_name || "—",
    partner: referred.get(tenantId),
    date: v.date,
    base_amount: v.amount,
    commission: Number((v.amount * AFFILIATE_RATE / 100).toFixed(2)),
  }));
  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  return { items, total: items.reduce((s, i) => s + i.commission, 0) };
}

// إجمالي المصروفات موزّعة على الأنواع (للعرض والتحليل)
export function expensesByCategory(expenses = [], isAr = true) {
  const active = expenses.filter((e) => e.status !== "stopped");
  const map = new Map();
  for (const e of active) {
    const key = e.category || "other";
    map.set(key, (map.get(key) || 0) + (Number(e.amount) || 0));
  }
  return [...map.entries()]
    .map(([key, amount]) => {
      const c = EXPENSE_CATEGORIES.find((x) => x.key === key);
      return { key, label: c ? (isAr ? c.ar : c.en) : key, amount };
    })
    .sort((a, b) => b.amount - a.amount);
}

// لوحة الوضع المالي الفعلي — الأساس الذي تُبنى عليه الخطة
export function actualSnapshot({ subscriptions = [], expenses = [], tenants = [], isAr = true }) {
  const paid = subscriptions.filter((s) => s.status === "paid");
  const monthly = financeRows({ revenues: paid, expenses, mode: "month", isAr });
  const yearly = financeRows({ revenues: paid, expenses, mode: "year", isAr });
  const fixed = recurringTotals(expenses);
  const commissions = affiliateCommissions(subscriptions, tenants);

  const clients = new Set(paid.map((s) => s.tenant_id)).size;
  const revenueTotal = paid.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const arpu = clients ? revenueTotal / clients : 0;

  // المصروف السنوي الفعلي = مصروفات السنة (من جدول الفترات) + عمولات الشركاء
  const yearRow = yearly.rows[yearly.rows.length - 1] || { revenue: 0, expense: 0 };
  const yearRevenue = yearRow.revenue;
  const yearExpense = yearRow.expense + commissions.total;
  const yearNet = Number((yearRevenue - yearExpense).toFixed(2));
  const margin = yearRevenue > 0 ? (yearNet / yearRevenue) * 100 : 0;

  // العبء الثابت السنوي (شهري ×12 + سنوي) وعدد العملاء اللازم لتغطيته
  const fixedYearly = fixed.monthly * 12 + fixed.yearly;
  const netPerClient = arpu > 0 ? arpu * (1 - AFFILIATE_RATE / 100) : 0;
  const breakEvenClients = netPerClient > 0 ? Math.ceil(fixedYearly / netPerClient) : 0;

  return {
    monthly, yearly, fixed, fixedYearly, commissions,
    categories: expensesByCategory(expenses, isAr),
    clients, revenueTotal, arpu,
    yearRevenue, yearExpense, yearNet, margin,
    breakEvenClients,
  };
}