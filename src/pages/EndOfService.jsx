import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calculator, AlertTriangle } from "lucide-react";
import { computeEOS, reasonMeta, terminationReasons, todayISO, isSaudiNationalId } from "@/lib/eos";
import { formatCurrency } from "@/lib/hr";

export default function EndOfService() {
  const [employees, setEmployees] = useState([]);
  const [org, setOrg] = useState(null);
  const [reason, setReason] = useState("end_of_contract");
  const [lwd, setLwd] = useState(todayISO());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Employee.list("-created_date", 500),
      base44.entities.Organization.list("-created_date", 1),
    ]).then(([emps, orgs]) => {
      setEmployees(emps.filter((e) => e.base_salary > 0));
      setOrg(orgs[0]);
      setLoading(false);
    });
  }, []);

  const rows = employees.map((emp) => {
    const res = computeEOS({
      employee: emp,
      lastWorkingDate: lwd,
      reason,
      basis: org?.eos_basis || "gross",
    });
    return { emp, res };
  });

  const totalEOS = rows.reduce((s, r) => s + r.res.amount, 0);

  return (
    <div>
      <PageHeader title="نهاية الخدمة" subtitle="حساب مكافأة نهاية الخدمة وفق نظام العمل السعودي (المواد 80/84/85)" />

      <div className="bg-white rounded-2xl border border-border p-4 mb-5 flex flex-col sm:flex-row gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">سبب الإنهاء</label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="w-full sm:w-80"><SelectValue /></SelectTrigger>
            <SelectContent>
              {terminationReasons.map((r) => <SelectItem key={r.value} value={r.value}>{r.label} — {r.note}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">تاريخ آخر يوم عمل</label>
          <Input type="date" value={lwd} onChange={(e) => setLwd(e.target.value)} className="sm:w-44" />
        </div>
        <div className="mr-auto text-sm">
          <span className="text-muted-foreground">السبب: </span>
          <span className="font-medium">{reasonMeta(reason).label}</span>
          <span className="text-xs text-muted-foreground block">{reasonMeta(reason).note}</span>
        </div>
      </div>

      {loading ? <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div> : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">الموظف</th>
                  <th className="text-right px-4 py-3 font-medium">الجنسية</th>
                  <th className="text-right px-4 py-3 font-medium">سنوات الخدمة</th>
                  <th className="text-right px-4 py-3 font-medium">أساس الحساب</th>
                  <th className="text-right px-4 py-3 font-medium">النسبة</th>
                  <th className="text-right px-4 py-3 font-medium">مكافأة نهاية الخدمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ emp, res }) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{emp.employee_number} - {emp.position}</td>
                    <td className="px-4 py-3">{emp.nationality || (isSaudiNationalId(emp.national_id) ? "سعودي" : "مقيم")}</td>
                    <td className="px-4 py-3 tabular-nums">{res.years}</td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(res.monthlyWage)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{res.fractionLabel}</td>
                    <td className="px-4 py-3 font-bold tabular-nums">{formatCurrency(res.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-semibold">
                  <td colSpan={5} className="px-4 py-3 text-left">إجمالي مكافآت نهاية الخدمة</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(totalEOS)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
        <AlertTriangle size={16} className="shrink-0 text-amber-600" />
        <span>يُحسب نصف شهر عن كل سنة من أول 5 سنوات ثم شهر كامل عن كل سنة بعدها. الاستقالة تُخفض المكافأة حسب المدة (مادة 85). الفصل لأسبب مشروع (مادة 80) لا يستحق مكافأة. تأكد من ضبط أساس الحساب من إعدادات المنشأة.</span>
      </div>
    </div>
  );
}