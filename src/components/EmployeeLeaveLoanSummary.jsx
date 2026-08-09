import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { computeEntitlement, sumUsedDays, getOrgOnce } from "@/lib/leaveBalance";
import { generateLeaveSettlement, generateLoanStatement } from "@/lib/docGenerators";
import { formatCurrency, leaveTypeLabel } from "@/lib/hr";
import { badge } from "@/lib/approvals";
import { Download, FileText, Loader2, RefreshCw, CalendarDays, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeeLeaveLoanSummary({ employee }) {
  const [leaves, setLeaves] = useState([]);
  const [loans, setLoans] = useState([]);
  const [org, setOrg] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    if (!employee?.id) return;
    const [lv, ln, o] = await Promise.all([
      base44.entities.LeaveRequest.filter({ employee_id: employee.id }, "-created_date", 300),
      base44.entities.LoanRequest.filter({ employee_id: employee.id }, "-created_date", 300),
      getOrgOnce(),
    ]);
    setLeaves(lv || []);
    setLoans(ln || []);
    setOrg(o);
  };

  useEffect(() => { load(); }, [employee?.id]);

  const annualDays = Number(org?.annual_leave_days) || 21;
  const entitlement = computeEntitlement(employee?.hire_date, annualDays);
  const prior = Number(employee?.prior_used_leave) || 0;
  const used = Math.round((sumUsedDays(leaves) + prior) * 10) / 10;
  const remaining = Math.max(0, Math.round((entitlement - used) * 10) / 10);

  const doneLeaves = leaves.filter((l) => l.status === "completed" || l.status === "paid");

  const regenLeave = async (l) => {
    setBusy("l" + l.id);
    try { await generateLeaveSettlement(l, employee, org, leaves); await load(); }
    finally { setBusy(null); }
  };
  const genLoan = async (l) => {
    setBusy("loan" + l.id);
    try { await generateLoanStatement(l, employee, org); await load(); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      {/* رصيد الإجازات */}
      <div className="rounded-xl border border-border bg-white p-3">
        <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
          <CalendarDays size={16} className="text-violet-600" /> رصيد الإجازات (محسوب تلقائياً من تاريخ المباشرة)
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="المستحق" value={`${entitlement} يوم`} tone="slate" />
          <Stat label="المستخدم" value={`${used} يوم`} tone="amber" />
          <Stat label="المتبقي" value={`${remaining} يوم`} tone="emerald" />
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          سياسة الشركة: {annualDays} يوماً/سنة · تناسبي شهرياً
        </div>
      </div>

      {/* سجل الإجازات المصفاة */}
      <div className="rounded-xl border border-border bg-white p-3">
        <div className="text-sm font-semibold mb-2">سجل التصفيات</div>
        {doneLeaves.length === 0 ? (
          <div className="text-xs text-muted-foreground py-3 text-center">لا توجد تصفيات بعد</div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {doneLeaves.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-border/60 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{leaveTypeLabel(l.leave_type)} · {l.start_date} ← {l.end_date}</div>
                  <div className="text-muted-foreground">
                    {l.days_count} يوم · <span className={cn("px-1.5 rounded-full", badge(l.status).cls)}>{badge(l.status).label}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {l.settlement_pdf_url ? (
                    <a href={l.settlement_pdf_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200">
                      <Download size={13} /> المخالصة
                    </a>
                  ) : (
                    <button type="button" onClick={() => regenLeave(l)} disabled={busy === "l" + l.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                      {busy === "l" + l.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} توليد
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* السلف */}
      <div className="rounded-xl border border-border bg-white p-3">
        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
          <Wallet size={16} className="text-amber-600" /> السلف
        </div>
        {loans.length === 0 ? (
          <div className="text-xs text-muted-foreground py-3 text-center">لا توجد سلف</div>
        ) : (
          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            {loans.map((l) => {
              const paid = Number(l.paid_amount) || 0;
              const remaining = Math.max(0, (Number(l.amount) || 0) - paid);
              const closed = (Number(l.amount) || 0) > 0 && paid >= (Number(l.amount) || 0);
              return (
                <div key={l.id} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-border/60 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{formatCurrency(l.amount)}</div>
                    <div className="text-muted-foreground">
                      تم سداد {formatCurrency(paid)} · متبقي {formatCurrency(remaining)} ·{" "}
                      <span className={cn("px-1.5 rounded-full", closed ? "bg-rose-50 text-rose-600" : badge(l.status).cls)}>
                        {closed ? "مغلقة" : badge(l.status).label}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {l.statement_pdf_url ? (
                      <a href={l.statement_pdf_url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200">
                        <FileText size={13} /> الكشف
                      </a>
                    ) : (
                      <button type="button" onClick={() => genLoan(l)} disabled={busy === "loan" + l.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                        {busy === "loan" + l.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} توليد
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className={cn("rounded-lg py-2 px-1", tones[tone])}>
      <div className="text-[10px] opacity-80">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}