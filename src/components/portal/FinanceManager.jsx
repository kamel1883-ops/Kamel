import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Pencil, Trash2, TrendingUp, TrendingDown, Wallet, Repeat, Eraser } from "lucide-react";
import { formatCurrency } from "@/lib/hr";
import { financeRows, recurringTotals, EXPENSE_CATEGORIES, RECURRENCES } from "@/lib/finance";
import ExpenseFormDialog from "@/components/portal/ExpenseFormDialog";
import FinancePeriodTable from "@/components/portal/FinancePeriodTable";
import ExpenseReports from "@/components/portal/ExpenseReports";
import { cn } from "@/lib/utils";

// لوحة العمليات المالية للمالك: الإيرادات (اشتراكات مدفوعة) مقابل المصروفات (ثابتة/متكررة/عمولات)
export default function FinanceManager({ session, isAr = true }) {
  const [loading, setLoading] = useState(true);
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [mode, setMode] = useState("month");
  const [dlg, setDlg] = useState({ open: false, expense: null });
  const [cleaning, setCleaning] = useState(false);

  const call = (action, extra = {}) =>
    base44.functions.invoke("portalData", { token: session.token, employee_id: session.employee_id, action, ...extra })
      .then((r) => r?.data || r);

  const load = async () => {
    setLoading(true);
    try {
      const d = await call("finance_list");
      if (d?.ok) { setRevenues(d.revenues || []); setExpenses(d.expenses || []); }
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const { rows, totals } = useMemo(() => financeRows({ revenues, expenses, mode, isAr }), [revenues, expenses, mode, isAr]);
  const fixed = useMemo(() => recurringTotals(expenses), [expenses]);

  const save = async (payload) => {
    await call("expense_save", { payload, id: dlg.expense?.id || "" });
    await load();
  };
  const remove = async (id) => {
    if (!window.confirm(isAr ? "حذف هذا المصروف؟" : "Delete this expense?")) return;
    await call("expense_delete", { id });
    await load();
  };

  // تنظيف الإيرادات المكرّرة (سجلات نتجت عن إعادة توليد عقد نفس الاشتراك)
  const dedupe = async () => {
    if (!window.confirm(isAr ? "سيتم حذف سجلات الإيراد المكرّرة لنفس العميل ونفس الفترة. متابعة؟" : "Duplicate revenue rows for the same client and period will be deleted. Continue?")) return;
    setCleaning(true);
    try {
      const r = await call("finance_dedupe");
      await load();
      window.alert(isAr ? `تم حذف ${r?.removed || 0} سجل إيراد مكرّر.` : `Removed ${r?.removed || 0} duplicate revenue rows.`);
    } finally { setCleaning(false); }
  };

  const catLabel = (k) => { const c = EXPENSE_CATEGORIES.find((x) => x.key === k); return c ? (isAr ? c.ar : c.en) : k; };
  const recLabel = (k) => { const r = RECURRENCES.find((x) => x.key === k); return r ? (isAr ? r.ar : r.en) : k; };

  const periodLabels = isAr
    ? { day: "يومي", week: "أسبوعي", month: "شهري", quarter: "ربع سنوي", year: "سنوي" }
    : { day: "Daily", week: "Weekly", month: "Monthly", quarter: "Quarterly", year: "Yearly" };

  if (loading) {
    return <div className="py-20 flex justify-center text-muted-foreground"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* بطاقات المؤشرات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={TrendingUp} tint="emerald" label={isAr ? "إجمالي الإيرادات" : "Total revenue"} value={formatCurrency(totals.revenue)} />
        <Kpi icon={TrendingDown} tint="rose" label={isAr ? "إجمالي المصروفات" : "Total expenses"} value={formatCurrency(totals.expense)} />
        <Kpi icon={Wallet} tint="navy" label={isAr ? "صافي الإيراد" : "Net profit"} value={formatCurrency(totals.net)} />
        <Kpi icon={Repeat} tint="amber"
          label={isAr ? "مصروف ثابت (شهري / سنوي)" : "Fixed (monthly / yearly)"}
          value={`${formatCurrency(fixed.monthly)} / ${formatCurrency(fixed.yearly)}`} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={dedupe} disabled={cleaning} className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50 ms-auto order-last">
          {cleaning ? <Loader2 size={14} className="animate-spin" /> : <Eraser size={14} />} {isAr ? "تنظيف الإيرادات المكرّرة" : "Clean duplicate revenue"}
        </Button>
        <span className="text-sm text-muted-foreground">{isAr ? "طريقة العرض:" : "View by:"}</span>
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.keys(periodLabels).map((k) => <SelectItem key={k} value={k}>{periodLabels[k]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <FinancePeriodTable rows={rows} totals={totals} isAr={isAr} />

      {/* نصف الإيرادات | نصف المصروفات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-2xl border border-border overflow-hidden">
          <header className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <h3 className="font-semibold text-emerald-800 text-sm">{isAr ? "الإيرادات — مبيعات الاشتراكات" : "Revenue — subscription sales"}</h3>
            <span className="text-xs text-emerald-700">{revenues.length}</span>
          </header>
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {revenues.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">{isAr ? "لا توجد إيرادات مسجّلة بعد." : "No revenue yet."}</p>
            ) : revenues.map((r) => (
              <div key={r.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{r.tenant_name || "—"}</div>
                  <div className="text-[11px] text-muted-foreground">{r.paid_date || r.period_start} · {r.plan === "annual" ? (isAr ? "سنوي" : "Annual") : (isAr ? "شهري" : "Monthly")}</div>
                </div>
                <div className="text-sm font-bold tabular-nums text-emerald-700">{formatCurrency(r.amount)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-border overflow-hidden">
          <header className="px-4 py-3 bg-rose-50 border-b border-rose-100 flex items-center justify-between gap-2">
            <h3 className="font-semibold text-rose-800 text-sm">{isAr ? "المصروفات والعمولات" : "Expenses & commissions"}</h3>
            <Button size="sm" onClick={() => setDlg({ open: true, expense: null })} className="gap-1.5 h-8">
              <Plus size={14} /> {isAr ? "إضافة" : "Add"}
            </Button>
          </header>
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {expenses.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">{isAr ? "لم تُدخل أي مصروف بعد." : "No expenses yet."}</p>
            ) : expenses.map((e) => (
              <div key={e.id} className={cn("px-4 py-2.5 flex items-center justify-between gap-3", e.status === "stopped" && "opacity-55")}>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{e.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {catLabel(e.category)} · {recLabel(e.recurrence)} · {e.expense_date}
                    {e.commission_percent ? ` · ${e.commission_percent}% ${e.partner_name || ""}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold tabular-nums text-rose-600">
                    {formatCurrency(e.amount)}
                  </span>
                  <button onClick={() => setDlg({ open: true, expense: e })} className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground"><Pencil size={14} /></button>
                  <button onClick={() => remove(e.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ExpenseReports expenses={expenses} isAr={isAr} />

      <ExpenseFormDialog
        open={dlg.open}
        expense={dlg.expense}
        revenues={revenues}
        isAr={isAr}
        onClose={() => setDlg({ open: false, expense: null })}
        onSave={save}
      />
    </div>
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