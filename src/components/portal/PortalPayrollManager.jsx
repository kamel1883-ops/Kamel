import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Wallet, Sparkles, FileCheck, CheckCircle2, Send, Banknote, FileDown, RotateCcw, Check, X, Loader2, Printer, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, payrollStatusLabel } from "@/lib/hr";
import { downloadMudadExcel } from "@/lib/mudadExcel";
import { downloadCashPayrollExcel } from "@/lib/cashPayrollExcel";
import PayrollPrintSheet from "@/components/reports/PayrollPrintSheet";
import {
  computeWorkDaysSet, computeWorkDaysInMonth, recomputeRow,
} from "@/lib/payrollCompute";

// مدير رواتب بوابة الموظف — للموظف المُفوّض بصلاحية «الرواتب».
// يتيح: توليد كشف الشهر، تعديل البنود، الاعتماد، الصرف، الطباعة (مع توقيع المُعِدّ)،
// وتصدير ملفات مدد/كاش. كل العمليات عبر إجراءات خلفية مُقيّدة بالصلاحية.
export default function PortalPayrollManager({ session, isAr = true }) {
  const args = { token: session.token, employee_id: session.employee_id };
  const t = isAr ? {
    title: "إدارة الرواتب", gen: "توليد كشف الشهر", gening: "جارٍ التوليد...",
    month: "الشهر", year: "السنة",
    months: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
    sNet: "إجمالي الصافي", sBonus: "الحوافز", sDed: "الخصومات", sPaid: "مصروفة",
    approve: "اعتماد الكشف", pay: "صرف الكشف", reopen: "إعادة فتح للتعديل",
    print: "طباعة الكشف (PDF)", mudad: "تصدير مدد", cash: "كشف الكاش",
    loading: "جارٍ التحميل...", empty: "لا يوجد كشف — اضغط «توليد كشف الشهر»",
    thIncl: "تضمين", thEmp: "الموظف", thBase: "أساسي", thGross: "الإجمالي",
    thBonus: "حافز", thOt: "عمل إضافي", thAbsentD: "غياب (يوم)", thAbsentH: "غياب (ساعة)",
    thDed: "خصومات", thLoan: "سلفة", thNet: "الصافي", thMethod: "القناة", thStatus: "الحالة",
    mudadBadge: "مدد", cashBadge: "كاش",
    preparedBy: "أُعدّت بواسطة", youPrepared: (n, id) => `الكشف الحالي أُعدّ/اعتُمد بواسطة: ${n}${id ? ` — ${id}` : ""}`,
    notPrepared: "الكشف لم يُعتمد بعد — عند الاعتماد يُسجَّل اسمك ورقم هويتك كمسؤول عن الإعداد.",
  } : {
    title: "Payroll management", gen: "Generate sheet", gening: "Generating...",
    month: "Month", year: "Year",
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    sNet: "Total net", sBonus: "Bonus", sDed: "Deductions", sPaid: "Paid",
    approve: "Approve sheet", pay: "Pay sheet", reopen: "Reopen to edit",
    print: "Print sheet (PDF)", mudad: "Export Mudad", cash: "Cash sheet",
    loading: "Loading...", empty: 'No sheet — click "Generate sheet"',
    thIncl: "Incl", thEmp: "Employee", thBase: "Base", thGross: "Gross",
    thBonus: "Bonus", thOt: "Overtime", thAbsentD: "Absent (d)", thAbsentH: "Absent (h)",
    thDed: "Deductions", thLoan: "Loan", thNet: "Net", thMethod: "Channel", thStatus: "Status",
    mudadBadge: "Mudad", cashBadge: "Cash",
    preparedBy: "Prepared by", youPrepared: (n, id) => `Current sheet prepared/approved by: ${n}${id ? ` — ${id}` : ""}`,
    notPrepared: "Sheet not approved yet — on approval your name and ID are recorded as the preparer.",
  };

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const invoke = async (action, extra = {}) => {
    const res = await base44.functions.invoke("portalData", { ...args, action, ...extra });
    return res?.data || res;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await invoke("payroll_list", { month, year });
      if (!d?.ok) return;
      setOrg(d.org); setEmployees(d.employees || []); setPayrolls(d.payrolls || []);
    } finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const workDaysInMonth = () => computeWorkDaysInMonth(year, month, computeWorkDaysSet(org?.work_days));
  const workHoursPerDay = () => Number(org?.work_hours_per_day) || 0;
  const empMap = {}; for (const e of employees) empMap[e.id] = e;
  const methodOf = (p) => empMap[p.employee_id]?.salary_payment_method || p.salary_payment_method || "mudad";

  const generate = async () => {
    setBusy(true);
    try { await invoke("payroll_generate", { month, year }); await load(); }
    finally { setBusy(false); }
  };

  const updateField = async (id, field, value) => {
    const rec = payrolls.find((p) => p.id === id);
    if (!rec) return;
    const next = recomputeRow({ ...rec, [field]: Number(value) || 0 }, workDaysInMonth(), workHoursPerDay());
    setPayrolls((ps) => ps.map((p) => (p.id === id ? next : p)));
    try {
      await invoke("payroll_update", { id, [field]: Number(value) || 0 });
    } catch { load(); }
  };

  const toggleInclude = async (id) => {
    const rec = payrolls.find((p) => p.id === id);
    const next = rec.include_in_payroll === false;
    setPayrolls((ps) => ps.map((p) => (p.id === id ? { ...p, include_in_payroll: next } : p)));
    try { await invoke("payroll_update", { id, include_in_payroll: next }); }
    catch { load(); }
  };

  const approveAll = async () => {
    setBusy(true);
    try { await invoke("payroll_approve", { month, year }); await load(); }
    finally { setBusy(false); }
  };
  const payAll = async () => {
    setBusy(true);
    try { await invoke("payroll_pay", { month, year }); await load(); }
    finally { setBusy(false); }
  };
  const reopen = async () => {
    setBusy(true);
    try { await invoke("payroll_reopen", { month, year }); await load(); }
    finally { setBusy(false); }
  };

  const included = payrolls.filter((p) => p.include_in_payroll !== false);
  const totalNet = included.reduce((s, p) => s + (Number(p.net_salary) || 0), 0);
  const totalBonus = included.reduce((s, p) => s + (Number(p.bonus) || 0), 0);
  const totalDed = included.reduce((s, p) => s + (Number(p.deductions) || 0) + (Number(p.absent_deduction) || 0), 0);
  const paidCount = included.filter((p) => p.status === "paid").length;
  const anyDraft = included.some((p) => p.status === "draft");
  const anyApproved = included.some((p) => p.status === "approved");
  const monthStatus = included.length && included.every((p) => p.status === "paid") ? "paid" : anyDraft ? "draft" : anyApproved ? "approved" : "draft";
  const mudadPays = included.filter((p) => methodOf(p) === "mudad");
  const cashPays = included.filter((p) => methodOf(p) === "cash");
  const preparer = included.find((p) => p.prepared_by_name);

  const printSheet = () => window.print();

  const sendMudad = async () => {
    if (!mudadPays.some((p) => p.status === "approved")) {
      alert(isAr ? "اعتمد رواتب مدد أولاً." : "Approve Mudad salaries first."); return;
    }
    setBusy(true);
    try {
      const n = await downloadMudadExcel({ payrolls: mudadPays, employees, org, month, year });
      if (n === 0) { alert(isAr ? "لا توجد رواتب مدد." : "No Mudad salaries."); return; }
      window.open("https://mudad.com.sa/home/payroll/regular/bulk", "_blank", "noopener,noreferrer");
      alert(isAr ? `تم توليد ملف مدد (${n} موظف).` : `Mudad file generated (${n} employees).`);
    } catch { alert(isAr ? "تعذّر توليد ملف مدد." : "Failed."); }
    finally { setBusy(false); }
  };

  const exportCash = async () => {
    setBusy(true);
    try {
      const n = await downloadCashPayrollExcel({ payrolls: cashPays, employees, month, year, monthName: t.months[month - 1] });
      if (n === 0) { alert(isAr ? "لا توجد رواتب كاش." : "No cash salaries."); return; }
      alert(isAr ? `تم توليد كشف الكاش (${n} موظف).` : `Cash sheet generated (${n}).`);
    } catch { alert(isAr ? "تعذّر توليد كشف الكاش." : "Failed."); }
    finally { setBusy(false); }
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Wallet size={18} className="text-violet-600" /><h3 className="font-bold text-sm">{t.title}</h3></div>
          <div className="flex items-center gap-2">
            <Button onClick={generate} disabled={busy} size="sm" className="gap-1.5"><Sparkles size={15} />{busy ? t.gening : t.gen}</Button>
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">{t.month}</label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{t.months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">{t.year}</label>
            <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-24 h-8 text-xs" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Mini label={t.sNet} value={formatCurrency(totalNet)} tint="text-emerald-700" />
        <Mini label={t.sBonus} value={formatCurrency(totalBonus)} tint="text-violet-700" />
        <Mini label={t.sDed} value={formatCurrency(totalDed)} tint="text-rose-700" />
        <Mini label={t.sPaid} value={paidCount} tint="text-blue-700" />
      </div>

      {payrolls.length > 0 && !loading && (
        <div className="bg-white rounded-2xl border border-border p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className={cn("px-2.5 py-1 rounded-full font-medium", payrollStatusLabel(monthStatus).cls)}>{payrollStatusLabel(monthStatus).label}</span>
            <span className="text-muted-foreground">({payrolls.length} {isAr ? "موظف" : "emp"})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {anyDraft ? (
              <Button onClick={approveAll} disabled={busy} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><FileCheck size={14} />{t.approve}</Button>
            ) : (
              <>
                {mudadPays.length > 0 && <Button onClick={sendMudad} disabled={busy} size="sm" className="gap-1.5 bg-[#0B2545] hover:bg-[#14315a] text-white"><Send size={14} />{t.mudad}</Button>}
                {cashPays.length > 0 && <Button onClick={exportCash} disabled={busy} size="sm" variant="outline" className="gap-1.5"><Banknote size={14} />{t.cash}</Button>}
                <Button onClick={() => printSheet()} size="sm" variant="outline" className="gap-1.5"><Printer size={14} />{t.print}</Button>
                {monthStatus === "approved" && <Button onClick={payAll} disabled={busy} size="sm" className="gap-1.5"><CheckCircle2 size={14} />{t.pay}</Button>}
                {monthStatus === "paid" && <Button onClick={reopen} disabled={busy} size="sm" variant="outline" className="gap-1.5"><RotateCcw size={14} />{t.reopen}</Button>}
              </>
            )}
          </div>
        </div>
      )}

      {/* توقيع المُعِدّ — يُسجَّل عند الاعتماد من البوابة باسم الموظف المُفوّض وهويته */}
      {payrolls.length > 0 && !anyDraft && (
        <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800 flex items-center gap-2">
          <ShieldCheck size={14} />
          {preparer ? t.youPrepared(preparer.prepared_by_name, preparer.prepared_by_id) : t.notPrepared}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2 text-sm"><Loader2 className="animate-spin" size={16} />{t.loading}</div>
        ) : payrolls.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">{t.empty}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-muted-foreground text-[11px]">
                <tr>
                  <th className="text-center px-2 py-1.5 font-medium">{t.thIncl}</th>
                  <th className="text-right px-3 py-1.5 font-medium sticky right-0 bg-slate-50 z-10">{t.thEmp}</th>
                  <th className="text-right px-2 py-1.5 font-medium">{t.thBase}</th>
                  <th className="text-right px-2 py-1.5 font-medium font-bold text-slate-700">{t.thGross}</th>
                  <th className="text-right px-2 py-1.5 font-medium text-emerald-600">{t.thBonus}</th>
                  <th className="text-right px-2 py-1.5 font-medium text-blue-600">{t.thOt}</th>
                  <th className="text-right px-2 py-1.5 font-medium">{t.thAbsentD}</th>
                  <th className="text-right px-2 py-1.5 font-medium">{t.thAbsentH}</th>
                  <th className="text-right px-2 py-1.5 font-medium text-rose-600">{t.thDed}</th>
                  <th className="text-right px-2 py-1.5 font-medium text-violet-600">{t.thLoan}</th>
                  <th className="text-right px-2 py-1.5 font-medium font-bold text-primary sticky left-0 bg-slate-50 z-10">{t.thNet}</th>
                  <th className="text-right px-2 py-1.5 font-medium">{t.thMethod}</th>
                  <th className="text-right px-2 py-1.5 font-medium">{t.thStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payrolls.map((p) => {
                  const incl = p.include_in_payroll !== false;
                  return (
                    <tr key={p.id} className={cn("hover:bg-slate-50", !incl && "opacity-60")}>
                      <td className="px-2 py-1 text-center">
                        <button onClick={() => toggleInclude(p.id)} className={cn("inline-flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all", incl ? "border-emerald-400 bg-emerald-50 text-emerald-600" : "border-rose-400 bg-rose-50 text-rose-500")}>
                          {incl ? <Check size={14} /> : <X size={14} />}
                        </button>
                      </td>
                      <td className="px-3 py-1 font-medium sticky right-0 bg-white z-10 max-w-[160px] truncate">{empMap[p.employee_id]?.full_name || p.employee_name}</td>
                      <td className="px-2 py-1 tabular-nums">{formatCurrency(p.base_salary)}</td>
                      <td className="px-2 py-1 font-bold tabular-nums text-slate-800">{formatCurrency(p.gross_salary)}</td>
                      <td className="px-2 py-1"><NumCell value={p.bonus} onCommit={(v) => updateField(p.id, "bonus", v)} disabled={p.status !== "draft"} /></td>
                      <td className="px-2 py-1"><NumCell value={p.overtime_amount} onCommit={(v) => updateField(p.id, "overtime_amount", v)} disabled={p.status !== "draft"} /></td>
                      <td className="px-2 py-1"><NumCell value={p.absent_days} onCommit={(v) => updateField(p.id, "absent_days", v)} disabled={p.status !== "draft"} /></td>
                      <td className="px-2 py-1"><NumCell value={p.absent_hours} onCommit={(v) => updateField(p.id, "absent_hours", v)} disabled={p.status !== "draft"} /></td>
                      <td className="px-2 py-1"><NumCell value={p.deductions} onCommit={(v) => updateField(p.id, "deductions", v)} disabled={p.status !== "draft"} /></td>
                      <td className="px-2 py-1"><NumCell value={p.loan_installment} onCommit={(v) => updateField(p.id, "loan_installment", v)} disabled={p.status !== "draft"} /></td>
                      <td className="px-2 py-1 font-bold tabular-nums text-primary sticky left-0 bg-white z-10">{formatCurrency(p.net_salary)}</td>
                      <td className="px-2 py-1"><span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap", methodOf(p) === "mudad" ? "bg-[#0B2545]/10 text-[#0B2545]" : "bg-emerald-100 text-emerald-700")}>{methodOf(p) === "mudad" ? t.mudadBadge : t.cashBadge}</span></td>
                      <td className="px-2 py-1"><span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap", payrollStatusLabel(p.status).cls)}>{payrollStatusLabel(p.status).label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* كشف الطباعة — داخل الصفحة (تفادي النوافذ المنبثقة في الـ WebView) */}
      {payrolls.length > 0 && (
        <div className="print-payroll hidden print:block" aria-hidden>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0b1120" }}>{org?.name || ""}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{isAr ? "كشف الرواتب" : "Payroll sheet"} — {t.months[month - 1]} {year}</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{isAr ? "الإجمالي" : "Total"}: {formatCurrency(totalNet)} — {included.length} {isAr ? "موظف" : "employees"}</div>
          </div>
          <PayrollPrintSheet payrolls={included} employees={employees} workDaysInMonth={workDaysInMonth()} workHoursPerDay={workHoursPerDay()} isAr={isAr} />
        </div>
      )}
    </div>
  );
}

function Mini({ label, value, tint }) {
  return (
    <div className="bg-white rounded-xl border border-border p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("text-lg font-bold tabular-nums mt-0.5", tint)}>{value}</div>
    </div>
  );
}

function NumCell({ value, onCommit, disabled }) {
  const [v, setV] = useState(value || 0);
  useEffect(() => { setV(value || 0); }, [value]);
  return (
    <input type="number" value={v} disabled={disabled} onChange={(e) => setV(e.target.value)}
      onBlur={() => onCommit(v)} onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
      className="w-16 px-1.5 py-0.5 text-[11px] tabular-nums border border-transparent rounded-md hover:border-border focus:border-border focus:outline-none bg-transparent disabled:bg-slate-50 disabled:text-slate-500" />
  );
}