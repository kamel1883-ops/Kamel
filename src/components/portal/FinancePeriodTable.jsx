import React from "react";
import { formatCurrency } from "@/lib/hr";
import { cn } from "@/lib/utils";

// جدول الفترات: إيراد / مصروف / صافي لكل فترة (يوم، أسبوع، شهر، ربع، سنة)
export default function FinancePeriodTable({ rows, totals, isAr }) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-muted-foreground text-xs">
            <tr>
              <th className="text-right px-4 py-2 font-medium">{isAr ? "الفترة" : "Period"}</th>
              <th className="text-right px-4 py-2 font-medium text-emerald-600">{isAr ? "الإيرادات" : "Revenue"}</th>
              <th className="text-right px-4 py-2 font-medium text-rose-600">{isAr ? "المصروفات" : "Expenses"}</th>
              <th className="text-right px-4 py-2 font-medium">{isAr ? "الصافي" : "Net"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.start} className={cn(r.revenue === 0 && r.expense === 0 && "opacity-50")}>
                <td className="px-4 py-2 font-medium">{r.label}</td>
                <td className="px-4 py-2 tabular-nums text-emerald-700">{formatCurrency(r.revenue)}</td>
                <td className="px-4 py-2 tabular-nums text-rose-600">{formatCurrency(r.expense)}</td>
                <td className={cn("px-4 py-2 tabular-nums font-bold", r.net >= 0 ? "text-slate-800" : "text-rose-700")}>{formatCurrency(r.net)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold">
              <td className="px-4 py-2.5">{isAr ? "الإجمالي" : "Total"}</td>
              <td className="px-4 py-2.5 tabular-nums">{formatCurrency(totals.revenue)}</td>
              <td className="px-4 py-2.5 tabular-nums">{formatCurrency(totals.expense)}</td>
              <td className="px-4 py-2.5 tabular-nums">{formatCurrency(totals.net)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}