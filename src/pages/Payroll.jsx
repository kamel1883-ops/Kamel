import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Wallet, FileCheck, Clock, TrendingUp, Sparkles, CheckCircle2, Shield, Fingerprint, FileDown, RotateCcw, FileSpreadsheet, Trash2, Check, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, payrollStatusLabel, todayISO } from "@/lib/hr";
import { useI18n } from "@/lib/i18n";
import { printReport } from "@/lib/reportPrint";
import { downloadMudadExcel } from "@/lib/mudadExcel";

export default function Payroll() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "الرواتب", subtitle: "معالجة كشوفات الرواتب الشهرية",
    gen: "توليد كشف الشهر", gening: "جارٍ التوليد...",
    sNet: "إجمالي الصافي", sBonus: "إجمالي الحوافز", sGosi: "تأمينات الموظفين", sDed: "إجمالي الخصومات", sPaid: "رواتب مصروفة",
    info: "البصمات مربوطة تلقائياً: يُسحب الغياب من سجلات الحضور عند التوليد. لمدير الموارد البشرية صلاحية تعديل أيام الغياب يدوياً في الجدول عند وجود إذن (يُعاد راتب اليوم تلقائياً).",
    month: "الشهر", year: "السنة",
    months: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
    monthStatus: "حالة كشف الشهر:", empCount: (n) => `(${n} موظف)`, approve: "اعتماد كشف الشهر", pay: "صرف الكشف",
    loading: "جارٍ التحميل...", empty: 'لا توجد كشوفات لهذا الشهر — اضغط "توليد كشف الشهر"',
    pdf: "تحميل / طباعة PDF", printDraft: "طباعة كمسودة", excel: "تحميل Excel", reopen: "إعادة فتح للتعديل وإعادة الاعتماد", exporting: "جارٍ التجهيز...",
    mudadSend: "تحويل الرواتب إلى مدد", mudadEmpty: "لا توجد رواتب معتمدة أو مصروفة لتوليد ملف مدد.",
    gosi: "التأمينات الاجتماعية", gosiHint: "احتساب اشتراكات GOSI وحفظها وتصديرها",
    thEmp: "الموظف", thBase: "أساسي", thHouse: "سكن", thTrans: "مواصلات", thBonus: "حوافز", thOvertime: "عمل إضافي", thGosi: "تأمينات (موظف)", thAbsent: "غياب (يوم)", thDed: "خصومات", thLoan: "سلفة", thNet: "الصافي", thIncl: "يشمل الصرف", thStatus: "الحالة",
    totalIncludedLabel: "إجمالي الرواتب للمشمولين بالصرف هذا الشهر", excludedHint: (n) => `${n} موظف مستثنى من صرف هذا الشهر`, allIncluded: "كل الموظفين مشمولون بالصرف",
  } : {
    title: "Payroll", subtitle: "Process monthly payroll sheets",
    gen: "Generate month sheet", gening: "Generating...",
    sNet: "Total net", sBonus: "Total bonus", sGosi: "Employee GOSI", sDed: "Total deductions", sPaid: "Paid salaries",
    info: "Attendance is linked automatically: absences are pulled from attendance records on generation. HR may manually adjust absence days in the table when excused (the day's salary is restored automatically).",
    month: "Month", year: "Year",
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    monthStatus: "Month sheet status:", empCount: (n) => `(${n} employees)`, approve: "Approve sheet", pay: "Pay sheet",
    loading: "Loading...", empty: 'No sheets for this month — click "Generate month sheet"',
    pdf: "Download / Print PDF", printDraft: "Print draft", excel: "Download Excel", reopen: "Reopen to edit & re-approve", exporting: "Preparing...",
    mudadSend: "Send salaries to Mudad", mudadEmpty: "No approved or paid salaries to generate a Mudad file.",
    gosi: "Social Insurance (GOSI)", gosiHint: "Calculate, save and export GOSI subscriptions",
    thEmp: "Employee", thBase: "Base", thHouse: "Housing", thTrans: "Transport", thBonus: "Bonus", thOvertime: "Overtime", thGosi: "GOSI (emp)", thAbsent: "Absent (days)", thDed: "Deductions", thLoan: "Loan", thNet: "Net", thIncl: "Include pay", thStatus: "Status",
    totalIncludedLabel: "Total payroll for employees included in this month's pay", excludedHint: (n) => `${n} employee(s) excluded from this month's pay`, allIncluded: "All employees are included in pay",
  };

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [org, setOrg] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [batching, setBatching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const sheetRef = React.useRef(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Payroll.filter({ month, year }, "-created_date", 500);
    setPayrolls(data);
    const emps = await base44.entities.Employee.filter({ status: "active" }, "-created_date", 500);
    setEmployees(emps);
    const orgs = await base44.entities.Organization.list("-created_date", 1);
    setOrg(orgs[0]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [month, year]);

  const generate = async () => {
    setGenerating(true);
    // جلب الموظفين الفعليين النشطين لحظة التوليد (يستبني من ترك العمل تلقائياً، ويضم المنضمين الجدد)
    const activeEmps = await base44.entities.Employee.filter({ status: "active" }, "-created_date", 500);
    setEmployees(activeEmps);
    const existing = new Set(payrolls.map((p) => p.employee_id));
    const mm = String(month).padStart(2, "0");
    const startDate = `${year}-${mm}-01`;
    const endDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${mm}-${String(endDay).padStart(2, "0")}`;
    const attRecords = await base44.entities.Attendance.filter({ date: { $gte: startDate, $lte: endDate } }, "-created_date", 2000);
    const absentByEmp = {};
    for (const a of attRecords) {
      if (!a.employee_id) continue;
      if (a.status === "absent") absentByEmp[a.employee_id] = (absentByEmp[a.employee_id] || 0) + 1;
    }
    const created = [];
    for (const emp of activeEmps) {
      if (existing.has(emp.id)) continue;
      const base = Number(emp.base_salary) || 0;
      const housing = Number(emp.housing_allowance) || 0;
      const transport = Number(emp.transport_allowance) || 0;
      const other = Number(emp.other_allowances) || 0;
      const gross = base + housing + transport + other;
      const absentDays = absentByEmp[emp.id] || 0;
      const dailyWage = gross / 30;
      const absentDeduction = Number((dailyWage * absentDays).toFixed(2));
      const net = gross - absentDeduction;
      created.push({
        employee_id: emp.id, employee_name: emp.full_name || "", national_id: emp.national_id || "",
        month, year, base_salary: base, housing_allowance: housing, transport_allowance: transport, other_allowances: other,
        gross_salary: gross, bonus: 0, deductions: absentDeduction, loan_installment: 0,
        overtime_hours: 0, overtime_amount: 0, absent_days: absentDays, net_salary: net, status: "draft",
      });
    }
    if (created.length > 0) await base44.entities.Payroll.bulkCreate(created);
    setGenerating(false);
    load();
  };

  const updateField = async (id, field, value) => {
    const rec = payrolls.find((p) => p.id === id);
    const updated = { ...rec, [field]: Number(value) || 0 };
    updated.gross_salary = (updated.base_salary || 0) + (updated.housing_allowance || 0) + (updated.transport_allowance || 0) + (updated.other_allowances || 0);
    updated.net_salary = (updated.gross_salary || 0) + (updated.bonus || 0) + (updated.overtime_amount || 0) - (updated.deductions || 0) - (updated.loan_installment || 0);
    updated.net_salary = Number(updated.net_salary.toFixed(2));
    await base44.entities.Payroll.update(id, updated);
    setPayrolls((p) => p.map((x) => (x.id === id ? updated : x)));
  };

  const overrideAbsentDays = async (id, days) => {
    const rec = payrolls.find((p) => p.id === id);
    const abs = Math.max(0, Number(days) || 0);
    const gross = Number(rec.gross_salary) || (Number(rec.base_salary) || 0);
    const daily = gross / 30;
    const deductions = Number((daily * abs).toFixed(2));
    const updated = { ...rec, absent_days: abs, deductions };
    updated.net_salary = (updated.gross_salary || 0) + (updated.bonus || 0) + (updated.overtime_amount || 0) - deductions - (updated.loan_installment || 0);
    updated.net_salary = Number(updated.net_salary.toFixed(2));
    await base44.entities.Payroll.update(id, updated);
    setPayrolls((p) => p.map((x) => (x.id === id ? updated : x)));
  };

  const toggleInclude = async (id) => {
    const rec = payrolls.find((p) => p.id === id);
    const next = rec.include_in_payroll === false ? true : false;
    setPayrolls((p) => p.map((x) => (x.id === id ? { ...x, include_in_payroll: next } : x)));
    try { await base44.entities.Payroll.update(id, { include_in_payroll: next }); }
    catch (e) { load(); }
  };

  const approveAll = async () => {
    setBatching(true);
    const updates = payrolls.filter((p) => p.status === "draft" && p.include_in_payroll !== false).map((p) => ({ id: p.id, status: "approved" }));
    if (updates.length) alert(isAr ? `سيتم اعتماد رواتب ${updates.length} موظف مشمول فقط` : `Only ${updates.length} included employees will be approved`);
    if (updates.length) await base44.entities.Payroll.bulkUpdate(updates);
    setBatching(false); load();
  };
  const payAll = async () => {
    setBatching(true);
    const target = payrolls.filter((p) => p.status === "approved" && p.include_in_payroll !== false);
    const updates = target.map((p) => ({ id: p.id, status: "paid", paid_date: todayISO() }));
    if (updates.length) await base44.entities.Payroll.bulkUpdate(updates);
    const updated = payrolls.map((p) => (target.find((tg) => tg.id === p.id) ? { ...p, status: "paid", paid_date: todayISO() } : p));
    setPayrolls(updated);
    setBatching(false);
    load();
  };

  // إعادة فتح الكشف للتعديل وإعادة الاعتماد (من مدفوع ← معتمد)
  const reopen = async () => {
    setBatching(true);
    const updates = payrolls.filter((p) => p.status === "paid").map((p) => ({ id: p.id, status: "approved", paid_date: null }));
    if (updates.length) await base44.entities.Payroll.bulkUpdate(updates);
    setBatching(false); load();
  };

  const exportPdf = async (opts = {}) => {
    if (!sheetRef.current) return;
    setExporting(true);
    try {
      await printReport(sheetRef.current, {
        org,
        title: isAr ? `كشف رواتب ${t.months[month - 1]} ${year}` : `Payroll sheet ${t.months[month - 1]} ${year}`,
        subtitle: isAr
          ? `إجمالي الصافي للمشمولين: ${formatCurrency(totalNet)} — المشمولون: ${includedCount} موظف — المستثنون: ${excludedCount} موظف`
          : `Total net (included): ${formatCurrency(totalNet)} — Included: ${includedCount} — Excluded: ${excludedCount}`,
        stamp: monthStatus === "paid" && payrolls.length > 0 && !opts.draft,
        draft: !!opts.draft,
        filterInclude: true,
        landscape: true,
      });
    } finally { setExporting(false); }
  };

  const deleteRow = async (id) => {
    if (!confirm(isAr ? "حذف هذا الموظف من كشف الشهر؟" : "Remove this employee from the month sheet?")) return;
    try {
      await base44.entities.Payroll.delete(id);
      setPayrolls((p) => p.filter((x) => x.id !== id));
    } catch (e) { alert(isAr ? "تعذّر الحذف" : "Delete failed"); }
  };

  const includedPayrolls = payrolls.filter((p) => p.include_in_payroll !== false);
  const excludedPayrolls = payrolls.filter((p) => p.include_in_payroll === false);
  const includedCount = includedPayrolls.length;
  const excludedCount = excludedPayrolls.length;
  const totalNet = includedPayrolls.reduce((s, p) => s + (p.net_salary || 0), 0);
  const totalBonus = includedPayrolls.reduce((s, p) => s + (p.bonus || 0), 0);
  const totalDed = includedPayrolls.reduce((s, p) => s + (p.deductions || 0), 0);
  const paidCount = includedPayrolls.filter((p) => p.status === "paid").length;
  const totalPaid = includedPayrolls.filter((p) => p.status === "paid").reduce((s, p) => s + (Number(p.net_salary) || 0), 0);
  const anyDraft = includedPayrolls.some((p) => p.status === "draft");
  const anyApproved = includedPayrolls.some((p) => p.status === "approved");
  const monthStatus = includedPayrolls.length && includedPayrolls.every((p) => p.status === "paid") ? "paid" : anyDraft ? "draft" : anyApproved ? "approved" : "draft";

  // تحويل المسير إلى مدد: يولّد ملف مسير الرواتب (xlsx) المطابق لنموذج مدد ويفتح بوابة الرفع
  const sendToMudad = async () => {
    if (!anyApproved && monthStatus !== "paid") {
      alert(isAr
        ? "اعتمد كشف الرواتب أولاً قبل التحويل إلى مدد."
        : "Approve the payroll sheet before sending to Mudad.");
      return;
    }
    setBatching(true);
    try {
      const n = await downloadMudadExcel({ payrolls, employees, org, month, year });
      if (n === 0) { alert(t.mudadEmpty); return; }
      window.open("https://mudad.com.sa/home/payroll/regular/bulk", "_blank", "noopener,noreferrer");
      alert(isAr
        ? `تم توليد ملف مسير الرواتب لمدد (${n} موظف) بصيغة xlsx محمية.\n\nالخطوات:\n1) سجّل الدخول في بوابة «مدد» التي فُتحت في تبويب جديد.\n2) من قائمة «إدارة الرواتب ← الرواتب الشهرية» اضغط «رفع ملف الرواتب» واسحب الملف.\n3) اضغط «رفع» ثم اعتمد المسير — ثم يحوّل البنك المرتبط الرواتب إلى حسابات الموظفين.`
        : `Mudad payroll file generated (${n} employees) as a protected xlsx.\n\nSteps:\n1) Sign in to the Mudad portal opened in the new tab.\n2) From "Payroll Management ► Monthly Salaries" choose "Upload Payroll File" and drop the file.\n3) Click "Upload" then approve the payroll — your linked bank will transfer salaries to employees.`);
    } catch (e) {
      alert(isAr ? "تعذّر توليد ملف مدد." : "Failed to generate the Mudad file.");
    } finally {
      setBatching(false);
    }
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/gosi"><Shield size={18} /> {t.gosi}</Link>
            </Button>
            <Button onClick={generate} disabled={generating} className="gap-2">
              <Sparkles size={18} /> {generating ? t.gening : t.gen}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label={t.sNet} value={formatCurrency(totalNet)} tint="green" />
        <StatCard icon={TrendingUp} label={t.sBonus} value={formatCurrency(totalBonus)} tint="violet" />
        <StatCard icon={Clock} label={t.sDed} value={formatCurrency(totalDed)} tint="rose" />
        <StatCard icon={CheckCircle2} label={t.sPaid} value={paidCount} tint="blue" />
      </div>

      <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
        <Fingerprint size={14} /> {t.info}
      </div>

      <div className="bg-white rounded-2xl border border-border p-4 mb-5 flex gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t.month}</label>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {t.months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t.year}</label>
          <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28" />
        </div>
      </div>

      {payrolls.length > 0 && !loading && (
        <div className="bg-white rounded-2xl border border-border p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t.monthStatus}</span>
            <span className={cn("px-3 py-1 rounded-full font-medium text-xs", payrollStatusLabel(monthStatus).cls)}>{payrollStatusLabel(monthStatus).label}</span>
            <span className="text-xs text-muted-foreground">{t.empCount(payrolls.length)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {anyDraft && (<Button onClick={approveAll} disabled={batching} variant="outline" className="gap-2"><FileCheck size={16} /> {t.approve}</Button>)}
            {anyApproved && (<Button onClick={payAll} disabled={batching} className="gap-2 bg-emerald-600 hover:bg-emerald-700"><FileCheck size={16} /> {t.pay}</Button>)}
            {monthStatus === "paid" && (<Button onClick={reopen} disabled={batching} variant="outline" className="gap-2"><RotateCcw size={16} /> {t.reopen}</Button>)}
            {(anyApproved || monthStatus === "paid") && (<Button onClick={sendToMudad} disabled={batching} className="gap-2 bg-[#0B2545] hover:bg-[#14315a] text-white"><Send size={16} /> {t.mudadSend}</Button>)}
            <Button onClick={() => exportPdf({ draft: true })} variant="outline" className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"><FileDown size={16} /> {exporting ? t.exporting : t.printDraft}</Button>
            <Button onClick={() => exportPdf()} disabled={exporting} variant="outline" className="gap-2"><FileDown size={16} /> {exporting ? t.exporting : t.pdf}</Button>
            </div>
            </div>
            )}

            {payrolls.length > 0 && !loading && (
            <div className="bg-gradient-to-l from-emerald-50 to-emerald-100/60 border border-emerald-200 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
            <div className="text-sm font-semibold text-emerald-900">{t.totalIncludedLabel}</div>
            <div className="text-xs text-emerald-700 mt-1">
             {excludedCount > 0 ? t.excludedHint(excludedCount) : t.allIncluded}
            </div>
            <div className="text-xs text-emerald-700 mt-0.5">{isAr ? `المشمولون بالصرف: ${includedCount} — المستثنون: ${excludedCount}` : `Included: ${includedCount} — Excluded: ${excludedCount}`}</div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 tabular-nums">{formatCurrency(totalNet)}</div>
            </div>
            )}

            <div ref={sheetRef} className="relative bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
        ) : payrolls.length === 0 ? (
          <div className="p-14 text-center">
            <Wallet size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-muted-foreground">{t.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-center px-3 py-3 font-medium">{t.thIncl}</th>
                  <th className="text-right px-4 py-3 font-medium sticky right-0 bg-slate-50">{t.thEmp}</th>
                  <th className="text-right px-3 py-3 font-medium">{isAr ? "الهوية/الإقامة" : "National ID"}</th>
                  <th className="text-right px-3 py-3 font-medium">{t.thBase}</th>
                  <th className="text-right px-3 py-3 font-medium">{t.thHouse}</th>
                  <th className="text-right px-3 py-3 font-medium">{t.thTrans}</th>
                  <th className="text-right px-3 py-3 font-medium text-emerald-600">{t.thBonus}</th>
                  <th className="text-right px-3 py-3 font-medium text-blue-600">{t.thOvertime}</th>
                  <th className="text-right px-3 py-3 font-medium">{t.thAbsent}</th>
                  <th className="text-right px-3 py-3 font-medium text-rose-600">{t.thDed}</th>
                  <th className="text-right px-3 py-3 font-medium text-violet-600">{t.thLoan}</th>
                  <th className="text-right px-3 py-3 font-medium">{t.thNet}</th>
                  <th className="text-right px-3 py-3 font-medium">{t.thStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payrolls.map((p) => {
                  const included = p.include_in_payroll !== false;
                  return (
                  <tr key={p.id} data-include={included ? "true" : "false"} className={cn("hover:bg-slate-50", !included && "opacity-60")}>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => toggleInclude(p.id)}
                        title={included ? (isAr ? "مشمول — اضغط لاستثنائه من هذا الشهر" : "Included — click to exclude") : (isAr ? "مستثنى — اضغط لإعادة إشراكه" : "Excluded — click to include")}
                        className={cn("inline-flex items-center justify-center w-7 h-7 rounded-lg border-2 transition-all",
                          included ? "border-emerald-400 bg-emerald-50 text-emerald-600" : "border-rose-400 bg-rose-50 text-rose-500")}>
                        {included ? <Check size={16} /> : <X size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-2 font-medium sticky right-0 bg-white">{employees.find((e) => e.id === p.employee_id)?.full_name || p.employee_name}</td>
                    <td className="px-3 py-2 tabular-nums text-xs">{p.national_id || (employees.find((e) => e.id === p.employee_id)?.national_id || "—")}</td>
                    <td className="px-3 py-2 tabular-nums">{formatCurrency(p.base_salary)}</td>
                    <td className="px-3 py-2"><EditableCell value={p.housing_allowance} onCommit={(v) => updateField(p.id, "housing_allowance", v)} /></td>
                    <td className="px-3 py-2"><EditableCell value={p.transport_allowance} onCommit={(v) => updateField(p.id, "transport_allowance", v)} /></td>
                    <td className="px-3 py-2"><EditableCell value={p.bonus} onCommit={(v) => updateField(p.id, "bonus", v)} /></td>
                    <td className="px-3 py-2"><EditableCell value={p.overtime_amount || 0} onCommit={(v) => updateField(p.id, "overtime_amount", v)} /></td>
                    <td className="px-3 py-2"><EditableCell value={p.absent_days || 0} onCommit={(v) => overrideAbsentDays(p.id, v)} /></td>
                    <td className="px-3 py-2"><EditableCell value={p.deductions} onCommit={(v) => updateField(p.id, "deductions", v)} /></td>
                    <td className="px-3 py-2"><EditableCell value={p.loan_installment || 0} onCommit={(v) => updateField(p.id, "loan_installment", v)} /></td>
                    <td className="px-3 py-2 font-bold tabular-nums">{formatCurrency(p.net_salary)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", payrollStatusLabel(p.status).cls)}>{payrollStatusLabel(p.status).label}</span>
                        {p.status === "draft" && (
                          <button onClick={() => deleteRow(p.id)} title={isAr ? "حذف من الكشف لهذا الشهر" : "Remove from sheet"}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function EditableCell({ value, onCommit }) {
  const [v, setV] = useState(value || 0);
  useEffect(() => { setV(value || 0); }, [value]);
  return (
    <input type="number" value={v} onChange={(e) => setV(e.target.value)} onBlur={() => onCommit(v)}
      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
      className="w-20 px-2 py-1 text-xs tabular-nums border border-transparent rounded-lg hover:border-border focus:border-border focus:outline-none bg-transparent" />
  );
}