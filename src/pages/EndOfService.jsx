import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import SettlementSheet from "@/components/SettlementSheet";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, AlertTriangle, Printer, Save, User, FileText, CalendarDays, Plane, Trash2 } from "lucide-react";
import { computeSettlement, reasonMeta, terminationReasons, todayISO, isSaudiNationalId } from "@/lib/eos";
import { formatCurrency } from "@/lib/hr";
import { useI18n } from "@/lib/i18n";

export default function EndOfService() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "نهاية الخدمة", subtitle: "حاسبة مكافأة نهاية الخدمة وفق نظام العمل السعودي (المواد 74 إلى 85) — جميع أسباب الإنهاء ومواد النظام المقابلة مع تصفية الإجازات والتذاكر",
    chooseEmp: "اختر الموظف", choosePh: "— اختر موظفاً من القائمة —", reason: "سبب الإنهاء", lwd: "تاريخ آخر يوم عمل",
    ticketAmt: "قيمة التذكرة (ريال — اختيارية)", ticketHint: "اتركها فارغة: المخالصة = مكافأة نهاية الخدمة + تصفية الإجازات فقط. أدخل مبلغاً فقط إن رغبت الشركة بإضافة تعويض تذكرة.",
    calc: "احسب المخالصة",
    empInfo: (e) => `الراتب الأساسي: ${formatCurrency(e.base_salary)} • بدل السكن: ${formatCurrency(e.housing_allowance)} • رصيد الإجازات: ${e.leave_balance || 0} يوم • استحقاق التذكرة: ${e.ticket_entitlement === "yearly" ? "سنوي" : e.ticket_entitlement === "biennial" ? "كل سنتين" : "لا يستحق"}`,
    loading: "جارٍ التحميل...", preview: "معاينة المخالصة", savePrint: "حفظ وطباعة", saving: "جارٍ الحفظ...", printOnly: "طباعة فقط",
    savedH: "المخالصات المحفوظة", print: "طباعة",
    note: "نصف شهر عن كل سنة من أول 5 سنوات ثم شهر كامل عن كل سنة بعدها. الاستقالة تُخفض المكافأة حسب المدة (مادة 85). الفصل لأسباب مشروعة (مادة 80) لا يستحق مكافأة. المخالصة تحسب مكافأة نهاية الخدمة + تصفية رصيد الإجازات المتبقي، وقيمة التذكرة مفتوحة (اختيارية) يضيفها المسؤول يدوياً إن رغبت الشركة. تُطبع المخالصة بشعار المنشأة المُعرّف في الإعدادات.",
  } : {
    title: "End of service", subtitle: "EOS award calculator per Saudi Labor Law (Art. 74 to 85) — all termination reasons and matching articles, with leave balance and ticket compensation",
    chooseEmp: "Select employee", choosePh: "— pick an employee —", reason: "Termination reason", lwd: "Last working date",
    ticketAmt: "Ticket value (SAR — optional)", ticketHint: "Leave empty: settlement = EOS + leave balance only. Enter an amount only if the company wishes to add ticket compensation.",
    calc: "Calculate settlement",
    empInfo: (e) => `Base: ${formatCurrency(e.base_salary)} • Housing: ${formatCurrency(e.housing_allowance)} • Leave balance: ${e.leave_balance || 0} days • Ticket: ${e.ticket_entitlement === "yearly" ? "Yearly" : e.ticket_entitlement === "biennial" ? "Biennial" : "None"}`,
    loading: "Loading...", preview: "Settlement preview", savePrint: "Save & print", saving: "Saving...", printOnly: "Print only",
    savedH: "Saved settlements", print: "Print",
    note: "Half a month per year for the first 5 years, then a full month per year. Resignation reduces the award by tenure (Art. 85). Dismissal for cause (Art. 80) is not entitled. The settlement computes EOS + remaining leave balance; ticket value is open (optional) and added manually by the admin if the company wishes. Printed with the organization logo set in settings.",
  };

  const [employees, setEmployees] = useState([]);
  const [org, setOrg] = useState(null);
  const [empId, setEmpId] = useState("");
  const [reason, setReason] = useState("end_of_contract");
  const [lwd, setLwd] = useState(todayISO());
  const [ticketAmount, setTicketAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [settlements, setSettlements] = useState([]);

  const load = async () => {
    setLoading(true);
    const [emps, orgs, sets] = await Promise.all([
      base44.entities.Employee.list("-created_date", 500),
      base44.entities.Organization.list("-created_date", 1),
      base44.entities.Settlement.list("-created_date", 50),
    ]);
    setEmployees(emps.filter((e) => e.base_salary > 0));
    setOrg(orgs[0]);
    setSettlements(sets);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const emp = employees.find((e) => e.id === empId);

  const compute = () => {
    if (!emp) return;
    const set = computeSettlement({ employee: emp, org, lastWorkingDate: lwd, reason, ticketAmount });
    const record = {
      employee_id: emp.id, employee_number: emp.employee_number,
      employee_name: `${emp.employee_number} - ${emp.position}`,
      nationality: emp.nationality || (isSaudiNationalId(emp.national_id) ? (isAr ? "سعودي" : "Saudi") : (isAr ? "مقيم" : "Expat")),
      national_id: emp.national_id, department: emp.department, position: emp.position, hire_date: emp.hire_date,
      last_working_date: lwd, years_of_service: set.years, reason, reason_note: reasonMeta(reason).note,
      basis: set.basis, monthly_wage: set.monthlyWage, daily_wage: set.dailyWage, fraction_label: set.fractionLabel,
      eos_amount: set.amount, leave_balance_days: set.leaveBalance, leave_cash: set.leaveCash,
      ticket_entitlement: set.ticketEntitlement, ticket_amount: set.ticketAmount,
      total_settlement: set.total_settlement, generated_date: todayISO(), status: "draft",
    };
    setPreview({ ...record, employee_name_full: record.employee_name });
  };

  const saveAndPrint = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      const saved = await base44.entities.Settlement.create(preview);
      setSettlements((s) => [saved, ...s]);
      setPreview({ ...preview, id: saved.id });
      setTimeout(() => window.print(), 300);
    } finally { setSaving(false); }
  };
  const reprint = (rec) => { setPreview({ ...rec, employee_name_full: rec.employee_name }); setTimeout(() => window.print(), 200); };
  const removeSettlement = async (id) => { await base44.entities.Settlement.delete(id); load(); };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="bg-white rounded-2xl border border-border p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5 md:col-span-3">
            <Label className="text-xs font-medium flex items-center gap-1 text-muted-foreground"><User size={14} /> {t.chooseEmp}</Label>
            <Select value={empId} onValueChange={setEmpId}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t.choosePh} /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.employee_number} - {e.position} {e.department ? `(${e.department})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1 text-muted-foreground"><FileText size={14} /> {t.reason}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {terminationReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{reasonMeta(r.value).label} <span className="text-muted-foreground">— {reasonMeta(r.value).article}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{reasonMeta(reason).article ? `${reasonMeta(reason).article} — ` : ""}{reasonMeta(reason).note}</span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1 text-muted-foreground"><CalendarDays size={14} /> {t.lwd}</Label>
            <Input type="date" value={lwd} onChange={(e) => setLwd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1 text-muted-foreground"><Plane size={14} /> {t.ticketAmt}</Label>
            <Input type="number" dir="ltr" value={ticketAmount} placeholder="0" onChange={(e) => setTicketAmount(e.target.value)} />
            <span className="text-xs text-muted-foreground">{t.ticketHint}</span>
          </div>
          <div className="flex items-end">
            <Button onClick={compute} disabled={!emp} className="w-full gap-2"><Calculator size={18} /> {t.calc}</Button>
          </div>
        </div>

        {emp && (<div className="text-xs text-muted-foreground bg-slate-50 rounded-lg p-3 mb-3">{t.empInfo(emp)}</div>)}
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
      ) : (
        <div className="space-y-5">
          {preview && (
            <div>
              <div className="flex items-center justify-between mb-3 no-print">
                <h3 className="text-sm font-semibold">{t.preview}</h3>
                <div className="flex gap-2">
                  <Button onClick={saveAndPrint} disabled={saving} className="gap-2"><Save size={16} /> {saving ? t.saving : t.savePrint}</Button>
                  <Button variant="outline" onClick={() => window.print()} className="gap-2"><Printer size={16} /> {t.printOnly}</Button>
                </div>
              </div>
              <div className="border border-border rounded-2xl p-6 bg-white"><SettlementSheet record={preview} org={org} /></div>
            </div>
          )}

          {settlements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 no-print">{t.savedH}</h3>
              <div className="space-y-2 no-print">
                {settlements.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl border border-border p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{s.employee_name}</div>
                      <div className="text-xs text-muted-foreground">{s.last_working_date} • {reasonMeta(s.reason).label} • {formatCurrency(s.total_settlement)}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => reprint(s)} className="gap-1 h-7"><Printer size={14} /> {t.print}</Button>
                      <Button size="sm" variant="ghost" onClick={() => removeSettlement(s.id)} className="h-7 text-rose-500"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2 no-print">
            <AlertTriangle size={16} className="shrink-0 text-amber-600" />
            <span>{t.note}</span>
          </div>
        </div>
      )}
    </div>
  );
}