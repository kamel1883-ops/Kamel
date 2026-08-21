import React, { useMemo, useState, useRef } from "react";
import { formatCurrency } from "@/lib/hr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { printReport } from "@/lib/reportPrint";

export default function PayrollReport({ org, records, t }) {
  const isAr = !!t.monthsList && t.monthsList[0] === "يناير";
  const paid = useMemo(
    () => (records || []).filter((r) => r.status === "paid").slice().sort((a, b) => (b.year - a.year) || (b.month - a.month)),
    [records]
  );

  const groups = useMemo(() => {
    const m = new Map();
    paid.forEach((r) => {
      const k = `${r.year}-${String(r.month).padStart(2, "0")}`;
      if (!m.has(k)) m.set(k, { key: k, year: r.year, month: r.month, rows: [], total: 0 });
      const g = m.get(k);
      g.rows.push(r);
      g.total += Number(r.net_salary) || 0;
    });
    return Array.from(m.values()).sort((a, b) => (b.year - a.year) || (b.month - a.month));
  }, [paid]);

  const [selKey, setSelKey] = useState(groups[0]?.key || "");
  const sel = groups.find((g) => g.key === selKey) || groups[0] || null;
  const [exporting, setExporting] = useState(false);
  const ref = useRef(null);

  const monthLabel = (y, m) => `${t.monthsList[m - 1] || ""} ${y}`;

  const onExport = async () => {
    if (!ref.current || !sel) return;
    setExporting(true);
    try {
      await printReport(ref.current, { org, title: isAr ? `كشف رواتب — ${monthLabel(sel.year, sel.month)}` : `Payroll — ${monthLabel(sel.year, sel.month)}`, subtitle: t.paySel, stamp: true });
    } finally { setExporting(false); }
  };

  if (!groups.length) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
        <Wallet className="mx-auto mb-3 text-muted-foreground/50" size={28} />
        {t.payNone}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">{t.paySel}</label>
          <select
            value={selKey}
            onChange={(e) => setSelKey(e.target.value)}
            className="h-9 rounded-md border border-input bg-white px-3 text-sm font-medium min-w-[220px]"
          >
            {groups.map((g) => (
              <option key={g.key} value={g.key}>{monthLabel(g.year, g.month)} — {g.rows.length} {t.payEmps}</option>
            ))}
          </select>
        </div>
        <Button onClick={onExport} disabled={exporting || !sel} className="gap-2">
          {exporting ? <Printer size={16} className="animate-spin" /> : <Printer size={16} />} {t.payExport}
        </Button>
      </div>

      {sel && (
        <div ref={ref} className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Wallet size={16} className="text-violet-600" /> {monthLabel(sel.year, sel.month)}
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-muted/60 p-3">
              <div className="text-xs text-muted-foreground">{t.payEmps}</div>
              <div className="text-lg font-bold mt-0.5">{sel.rows.length}</div>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <div className="text-xs text-muted-foreground">{t.payTotal}</div>
              <div className="text-lg font-bold mt-0.5">{formatCurrency(sel.total)}</div>
            </div>
          </div>

          <Table>
            <TableHeader>
                <TableRow>
                  <TableHead>{t.payThEmp}</TableHead>
                  <TableHead className="text-center">{isAr ? "الهوية/الإقامة" : "National ID"}</TableHead>
                  <TableHead className="text-center">{t.payThBase}</TableHead>
                  <TableHead className="text-center">{t.payThNet}</TableHead>
                  <TableHead className="text-center">{t.payThStatus}</TableHead>
                  <TableHead className="text-center">{t.payDate}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sel.rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.employee_name || "—"}</TableCell>
                    <TableCell className="text-center tabular-nums text-xs" dir="ltr">{r.national_id || "—"}</TableCell>
                  <TableCell className="text-center">{formatCurrency(r.base_salary)}</TableCell>
                  <TableCell className="text-center font-semibold">{formatCurrency(r.net_salary)}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {t.payPaid}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">{r.paid_date ? String(r.paid_date).slice(0, 10) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}