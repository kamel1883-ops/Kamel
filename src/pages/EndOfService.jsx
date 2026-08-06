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
import {
  Calculator, AlertTriangle, Printer, Save, User, FileText, CalendarDays, Trash2
} from "lucide-react";
import {
  computeSettlement, reasonMeta, terminationReasons, todayISO, isSaudiNationalId
} from "@/lib/eos";
import { formatCurrency } from "@/lib/hr";

export default function EndOfService() {
  const [employees, setEmployees] = useState([]);
  const [org, setOrg] = useState(null);
  const [empId, setEmpId] = useState("");
  const [reason, setReason] = useState("end_of_contract");
  const [lwd, setLwd] = useState(todayISO());
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
    const set = computeSettlement({ employee: emp, org, lastWorkingDate: lwd, reason });
    const record = {
      employee_id: emp.id,
      employee_number: emp.employee_number,
      employee_name: `${emp.employee_number} - ${emp.position}`,
      nationality: emp.nationality || (isSaudiNationalId(emp.national_id) ? "سعودي" : "مقيم"),
      national_id: emp.national_id,
      department: emp.department,
      position: emp.position,
      hire_date: emp.hire_date,
      last_working_date: lwd,
      years_of_service: set.years,
      reason,
      reason_note: reasonMeta(reason).note,
      basis: set.basis,
      monthly_wage: set.monthlyWage,
      daily_wage: set.dailyWage,
      fraction_label: set.fractionLabel,
      eos_amount: set.amount,
      leave_balance_days: set.leaveBalance,
      leave_cash: set.leaveCash,
      ticket_entitlement: set.ticketEntitlement,
      ticket_amount: set.ticketAmount,
      total_settlement: set.total_settlement,
      generated_date: todayISO(),
      status: "draft",
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
    } finally {
      setSaving(false);
    }
  };

  const reprint = (rec) => {
    setPreview({ ...rec, employee_name_full: rec.employee_name });
    setTimeout(() => window.print(), 200);
  };

  const removeSettlement = async (id) => {
    await base44.entities.Settlement.delete(id);
    load();
  };

  return (
    <div>
      <PageHeader title="نهاية الخدمة" subtitle="حاسبة مكافأة نهاية الخدمة وفق نظام العمل السعودي (المواد 80/84/85) مع تصفية الإجازات والتذاكر" />

      {/* حاسبة المخالصة */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5 md:col-span-3">
            <Label className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
              <User size={14} /> اختر الموظف
            </Label>
            <Select value={empId} onValueChange={setEmpId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="— اختر موظفاً من القائمة —" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.employee_number} - {e.position} {e.department ? `(${e.department})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
              <FileText size={14} /> سبب الإنهاء
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {terminationReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{reasonMeta(reason).note}</span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
              <CalendarDays size={14} /> تاريخ آخر يوم عمل
            </Label>
            <Input type="date" value={lwd} onChange={(e) => setLwd(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={compute} disabled={!emp} className="w-full gap-2">
              <Calculator size={18} /> احسب المخالصة
            </Button>
          </div>
        </div>

        {emp && (
          <div className="text-xs text-muted-foreground bg-slate-50 rounded-lg p-3 mb-3">
            الراتب الأساسي: {formatCurrency(emp.base_salary)} • بدل السكن: {formatCurrency(emp.housing_allowance)} •
            رصيد الإجازات: {emp.leave_balance || 0} يوم • استحقاق التذكرة: {emp.ticket_entitlement === "yearly" ? "سنوي" : emp.ticket_entitlement === "biennial" ? "كل سنتين" : "لا يستحق"}
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <div className="space-y-5">
          {preview && (
            <div>
              <div className="flex items-center justify-between mb-3 no-print">
                <h3 className="text-sm font-semibold">معاينة المخالصة</h3>
                <div className="flex gap-2">
                  <Button onClick={saveAndPrint} disabled={saving} className="gap-2">
                    <Save size={16} /> {saving ? "جارٍ الحفظ..." : "حفظ وطباعة"}
                  </Button>
                  <Button variant="outline" onClick={() => window.print()} className="gap-2">
                    <Printer size={16} /> طباعة فقط
                  </Button>
                </div>
              </div>
              <div className="border border-border rounded-2xl p-6 bg-white">
                <SettlementSheet record={preview} org={org} />
              </div>
            </div>
          )}

          {settlements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 no-print">المخالصات المحفوظة</h3>
              <div className="space-y-2 no-print">
                {settlements.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl border border-border p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{s.employee_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.last_working_date} • {reasonMeta(s.reason).label} • {formatCurrency(s.total_settlement)}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => reprint(s)} className="gap-1 h-7">
                        <Printer size={14} /> طباعة
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeSettlement(s.id)} className="h-7 text-rose-500">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2 no-print">
            <AlertTriangle size={16} className="shrink-0 text-amber-600" />
            <span>
              نصف شهر عن كل سنة من أول 5 سنوات ثم شهر كامل عن كل سنة بعدها. الاستقالة تُخفض المكافأة حسب المدة (مادة 85).
              الفصل لأسباب مشروعة (مادة 80) لا يستحق مكافأة. يتم تصفية رصيد الإجازات وتعويض التذكرة المستحقة ضمن المخالصة.
              تُطبع المخالصة بشعار المنشأة المُعرّف في الإعدادات.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}