import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Users, PieChart, Repeat } from "lucide-react";
import { formatCurrency } from "@/lib/hr";
import { EXPENSE_CATEGORIES } from "@/lib/finance";
import { REPORT_PERIODS, partnerStatements, categoryStatements, recurringCommitments } from "@/lib/expenseReports";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "partner", icon: Users, ar: "كشف حساب المستفيدين / الشركاء", en: "Beneficiary / partner statement" },
  { key: "category", icon: PieChart, ar: "المصروفات حسب النوع", en: "Expenses by category" },
  { key: "recurring", icon: Repeat, ar: "الالتزامات المتكررة", en: "Recurring commitments" },
];

// تقارير المصروفات: كشف حساب لكل شريك/مستفيد + تحليل حسب النوع + الالتزامات المتكررة
export default function ExpenseReports({ expenses = [], isAr = true }) {
  const [tab, setTab] = useState("partner");
  const [periodKey, setPeriodKey] = useState("month");

  const partner = useMemo(() => partnerStatements({ expenses, periodKey, isAr }), [expenses, periodKey, isAr]);
  const category = useMemo(() => categoryStatements({ expenses, periodKey, isAr }), [expenses, periodKey, isAr]);
  const recurring = useMemo(() => recurringCommitments(expenses), [expenses]);
  const catLabel = (k) => { const c = EXPENSE_CATEGORIES.find((x) => x.key === k); return c ? (isAr ? c.ar : c.en) : k; };

  const active = tab === "partner" ? partner : category;

  return (
    <section className="print-client bg-white rounded-2xl border border-border overflow-hidden">
      <header className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-sm">{isAr ? "تقارير المصروفات" : "Expense reports"}</h3>
        <div className="ms-auto flex items-center gap-2 no-print">
          {tab !== "recurring" && (
            <Select value={periodKey} onValueChange={setPeriodKey}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REPORT_PERIODS.map((p) => <SelectItem key={p.key} value={p.key}>{isAr ? p.ar : p.en}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => window.print()}>
            <Printer size={14} /> {isAr ? "طباعة" : "Print"}
          </Button>
        </div>
      </header>

      <div className="px-4 pt-3 flex flex-wrap gap-2 no-print">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5",
              tab === t.key ? "bg-[#0B2545] text-white border-[#0B2545]" : "bg-white text-muted-foreground border-border hover:bg-slate-50")}>
            <t.icon size={13} /> {isAr ? t.ar : t.en}
          </button>
        ))}
      </div>

      <div className="p-4 overflow-x-auto">
        {tab === "recurring" ? (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-start p-2">{isAr ? "المصروف" : "Expense"}</th>
                <th className="text-start p-2">{isAr ? "النوع" : "Category"}</th>
                <th className="text-start p-2">{isAr ? "شهرياً" : "Monthly"}</th>
                <th className="text-start p-2">{isAr ? "سنوياً" : "Yearly"}</th>
              </tr>
            </thead>
            <tbody>
              {recurring.rows.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">{isAr ? "لا توجد التزامات متكررة سارية." : "No active recurring commitments."}</td></tr>
              ) : recurring.rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-2 font-medium">{r.name}</td>
                  <td className="p-2 text-muted-foreground text-xs">{catLabel(r.category)}</td>
                  <td className="p-2 tabular-nums">{formatCurrency(r.monthly)}</td>
                  <td className="p-2 tabular-nums">{formatCurrency(r.yearly)}</td>
                </tr>
              ))}
            </tbody>
            {recurring.rows.length > 0 && (
              <tfoot>
                <tr className="bg-[#0B2545] text-white font-bold">
                  <td className="p-2" colSpan={2}>{isAr ? "الإجمالي" : "Total"}</td>
                  <td className="p-2 tabular-nums">{formatCurrency(recurring.monthly)}</td>
                  <td className="p-2 tabular-nums">{formatCurrency(recurring.yearly)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr>
                <th className="text-start p-2">{tab === "partner" ? (isAr ? "المستفيد" : "Beneficiary") : (isAr ? "النوع" : "Category")}</th>
                {active.periods.map((p) => <th key={p.start} className="text-start p-2 whitespace-nowrap text-xs">{p.label}</th>)}
                <th className="text-start p-2">{isAr ? "الإجمالي" : "Total"}</th>
              </tr>
            </thead>
            <tbody>
              {active.rows.length === 0 ? (
                <tr><td colSpan={active.periods.length + 2} className="p-6 text-center text-muted-foreground">
                  {isAr ? "لا توجد بيانات في هذه الفترات." : "No data in these periods."}
                </td></tr>
              ) : active.rows.map((r) => (
                <tr key={r.key || r.name} className="border-t border-border">
                  <td className="p-2 font-medium">
                    {tab === "partner" ? r.name : catLabel(r.key)}
                    {tab === "partner" && r.percents?.length > 0 && (
                      <span className="text-[11px] text-muted-foreground"> · {r.percents.join("% / ")}%</span>
                    )}
                  </td>
                  {r.cells.map((v, i) => (
                    <td key={i} className={cn("p-2 tabular-nums", v === 0 && "text-muted-foreground/60")}>{formatCurrency(v)}</td>
                  ))}
                  <td className="p-2 tabular-nums font-bold text-rose-600">{formatCurrency(r.total)}</td>
                </tr>
              ))}
            </tbody>
            {active.rows.length > 0 && (
              <tfoot>
                <tr className="bg-[#0B2545] text-white font-bold">
                  <td className="p-2">{isAr ? "الإجمالي" : "Total"}</td>
                  {active.totals.map((v, i) => <td key={i} className="p-2 tabular-nums">{formatCurrency(v)}</td>)}
                  <td className="p-2 tabular-nums">{formatCurrency(active.grand)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </section>
  );
}