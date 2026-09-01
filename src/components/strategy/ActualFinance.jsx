import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, TrendingUp, TrendingDown, Wallet, Repeat, Users, Handshake, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/hr";
import { actualSnapshot, AFFILIATE_RATE } from "@/lib/strategyFinance";
import FinancePeriodTable from "@/components/portal/FinancePeriodTable";
import FinanceInsights from "@/components/strategy/FinanceInsights";
import { cn } from "@/lib/utils";

export default function ActualFinance({ session }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ subscriptions: [], expenses: [], tenants: [] });

  // عند توفر جلسة المالك نأخذ البيانات من نفس مصدر تبويب «العمليات المالية» عبر portalData
  // (كيانات الاشتراك/المصروف محمية بصلاحية admin فقط، وجلسة البوابة ليست جلسة Base44).
  // بدون جلسة (صفحة /strategic-plan المستقلة) نعود للاستدعاء المباشر (يعمل لحساب admin).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let subscriptions = [], expenses = [], tenants = [];
      if (session) {
        const call = (action, extra = {}) =>
          base44.functions.invoke("portalData", { token: session.token, employee_id: session.employee_id, action, ...extra })
            .then((r) => r?.data || r);
        const [fin, own] = await Promise.all([call("finance_list"), call("owner_list")]);
        subscriptions = fin?.revenues || [];
        expenses = fin?.expenses || [];
        tenants = own?.tenants || [];
      } else {
        [subscriptions, expenses, tenants] = await Promise.all([
          base44.entities.Subscription.list("-created_date", 500),
          base44.entities.Expense.list("-created_date", 500),
          base44.entities.Tenant.list("-created_date", 500),
        ]);
      }
      if (cancelled) return;
      setData({ subscriptions, expenses, tenants });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [session?.token, session?.employee_id]);

  const snap = useMemo(() => actualSnapshot({ ...data, isAr: true }), [data]);

  if (loading) {
    return <div className="py-20 flex justify-center text-muted-foreground"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        كل الأرقام أدناه مسحوبة مباشرة من العمليات المالية في بوابة المالك: الاشتراكات المدفوعة (الإيرادات)،
        والمصروفات التشغيلية المسجّلة، مضافاً إليها عمولة الشركاء {AFFILIATE_RATE}% من أول اشتراك لكل عميل جاء برمز إحالة.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={TrendingUp} tint="emerald" label="إيراد السنة الحالية" value={formatCurrency(snap.yearRevenue)} />
        <Kpi icon={TrendingDown} tint="rose" label="مصروف السنة (مع العمولات)" value={formatCurrency(snap.yearExpense)} />
        <Kpi icon={Wallet} tint="navy" label="صافي السنة" value={formatCurrency(snap.yearNet)} />
        <Kpi icon={PieChart} tint="amber" label="هامش الربح الفعلي" value={`${snap.margin.toFixed(1)}%`} />
        <Kpi icon={Users} tint="navy" label="عملاء مشتركون فعلياً" value={String(snap.clients)} />
        <Kpi icon={Wallet} tint="emerald" label="متوسط قيمة الاشتراك" value={formatCurrency(snap.arpu)} />
        <Kpi icon={Repeat} tint="amber" label="عبء ثابت سنوي" value={formatCurrency(snap.fixedYearly)} />
        <Kpi icon={Handshake} tint="rose" label={`عمولات الشركاء ${AFFILIATE_RATE}%`} value={formatCurrency(snap.commissions.total)} />
      </div>

      <FinanceInsights snap={snap} />

      <Section title="الإيراد والمصروف والصافي — شهرياً">
        <FinancePeriodTable rows={snap.monthly.rows} totals={snap.monthly.totals} isAr />
      </Section>

      <Section title="الإيراد والمصروف والصافي — سنوياً">
        <FinancePeriodTable rows={snap.yearly.rows} totals={snap.yearly.totals} isAr />
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="المصروفات التشغيلية حسب النوع">
          {snap.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">لا توجد مصروفات مسجّلة.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr><th className="text-start p-3">النوع</th><th className="text-start p-3">المبلغ</th></tr></thead>
              <tbody>
                {snap.categories.map((c) => (
                  <tr key={c.key} className="border-t border-border">
                    <td className="p-3">{c.label}</td>
                    <td className="p-3 font-semibold text-rose-600">{formatCurrency(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title={`عمولات الشركاء — ${AFFILIATE_RATE}% من أول اشتراك`}>
          {snap.commissions.items.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">لا يوجد عملاء محالون عبر روابط الشركاء بعد.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-start p-3">العميل</th>
                  <th className="text-start p-3">الشريك</th>
                  <th className="text-start p-3">قيمة الاشتراك</th>
                  <th className="text-start p-3">العمولة</th>
                </tr>
              </thead>
              <tbody>
                {snap.commissions.items.map((i) => (
                  <tr key={i.tenant_id} className="border-t border-border">
                    <td className="p-3 font-medium">{i.tenant_name}</td>
                    <td className="p-3 text-muted-foreground">{i.partner}</td>
                    <td className="p-3">{formatCurrency(i.base_amount)}</td>
                    <td className="p-3 font-semibold text-rose-600">{formatCurrency(i.commission)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#0B2545] text-white">
                  <td className="p-3 font-bold" colSpan={3}>إجمالي العمولات</td>
                  <td className="p-3 font-bold">{formatCurrency(snap.commissions.total)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-2xl border border-border overflow-hidden">
      <header className="px-4 py-3 border-b border-border bg-muted/40">
        <h3 className="font-semibold text-sm">{title}</h3>
      </header>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

const TINTS = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  navy: "bg-[#0B2545]/5 text-[#0B2545] border-[#0B2545]/15",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
};

function Kpi({ icon: Icon, label, value, tint }) {
  return (
    <div className={cn("rounded-2xl border p-4", TINTS[tint])}>
      <div className="flex items-center gap-2 text-xs font-medium opacity-80"><Icon size={14} /> {label}</div>
      <div className="text-lg font-extrabold tabular-nums mt-1.5">{value}</div>
    </div>
  );
}