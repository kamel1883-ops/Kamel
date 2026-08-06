import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Wallet, FileCheck, Clock, TrendingUp, Sparkles, CheckCircle2, Shield, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, payrollStatusLabel, todayISO } from "@/lib/hr";
import { computeGOSI } from "@/lib/eos";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [org, setOrg] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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
    const existing = new Set(payrolls.map((p) => p.employee_id));
    const orgs = org ? [org] : await base44.entities.Organization.list("-created_date", 1);
    const cfg = orgs[0];
    // ربط البصمات: جلب سجلات الحضور للشهر وحساب أيام الغياب وخصمها
    const mm = String(month).padStart(2, "0");
    const startDate = `${year}-${mm}-01`;
    const endDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${mm}-${String(endDay).padStart(2, "0")}`;
    const attRecords = await base44.entities.Attendance.filter(
      { date: { $gte: startDate, $lte: endDate } }, "-created_date", 2000
    );
    const absentByEmp = {};
    const lateByEmp = {};
    for (const a of attRecords) {
      if (!a.employee_id) continue;
      if (a.status === "absent") absentByEmp[a.employee_id] = (absentByEmp[a.employee_id] || 0) + 1;
      if (a.status === "late") lateByEmp[a.employee_id] = (lateByEmp[a.employee_id] || 0) + 1;
    }
    const created = [];
    for (const emp of employees) {
      if (existing.has(emp.id)) continue;
      const base = Number(emp.base_salary) || 0;
      const housing = Number(emp.housing_allowance) || 0;
      const transport = Number(emp.transport_allowance) || 0;
      const other = Number(emp.other_allowances) || 0;
      const gross = base + housing + transport + other;
      const gosi = computeGOSI({ employee: emp, org: cfg });
      const absentDays = absentByEmp[emp.id] || 0;
      const dailyWage = gross / 30;
      const absentDeduction = Number((dailyWage * absentDays).toFixed(2));
      const net = gross - gosi.gosi_employee - absentDeduction;
      created.push({
        employee_id: emp.id,
        employee_name: `${emp.employee_number} - ${emp.position}`,
        month, year,
        base_salary: base,
        housing_allowance: housing,
        transport_allowance: transport,
        other_allowances: other,
        gross_salary: gross,
        bonus: 0, deductions: absentDeduction,
        gosi_employee: Number(gosi.gosi_employee.toFixed(2)),
        gosi_employer: Number(gosi.gosi_employer.toFixed(2)),
        overtime_hours: 0,
        absent_days: absentDays,
        net_salary: net, status: "draft",
      });
    }
    if (created.length > 0) {
      await base44.entities.Payroll.bulkCreate(created);
    }
    setGenerating(false);
    load();
  };

  const updateField = async (id, field, value) => {
    const rec = payrolls.find((p) => p.id === id);
    const updated = { ...rec, [field]: Number(value) || 0 };
    updated.gross_salary =
      (updated.base_salary || 0) + (updated.housing_allowance || 0) +
      (updated.transport_allowance || 0) + (updated.other_allowances || 0);
    updated.net_salary = (updated.gross_salary || 0) +
      (updated.bonus || 0) - (updated.deductions || 0) -
      (updated.gosi_employee || 0);
    await base44.entities.Payroll.update(id, updated);
    setPayrolls((p) => p.map((x) => (x.id === id ? updated : x)));
  };

  const setStatus = async (rec, status) => {
    const patch = { status };
    if (status === "paid") patch.paid_date = todayISO();
    await base44.entities.Payroll.update(rec.id, patch);
    load();
  };

  const totalNet = payrolls.reduce((s, p) => s + (p.net_salary || 0), 0);
  const totalBonus = payrolls.reduce((s, p) => s + (p.bonus || 0), 0);
  const totalDed = payrolls.reduce((s, p) => s + (p.deductions || 0), 0);
  const totalGosiEmployee = payrolls.reduce((s, p) => s + (p.gosi_employee || 0), 0);
  const paidCount = payrolls.filter((p) => p.status === "paid").length;

  return (
    <div>
      <PageHeader
        title="الرواتب"
        subtitle="معالجة كشوفات الرواتب الشهرية"
        action={
          <Button onClick={generate} disabled={generating} className="gap-2">
            <Sparkles size={18} /> {generating ? "جارٍ التوليد..." : "توليد كشف الشهر"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="إجمالي الصافي" value={formatCurrency(totalNet)} tint="green" />
        <StatCard icon={TrendingUp} label="إجمالي الحوافز" value={formatCurrency(totalBonus)} tint="violet" />
        <StatCard icon={Shield} label="تأمينات الموظفين" value={formatCurrency(totalGosiEmployee)} tint="amber" />
        <StatCard icon={Clock} label="إجمالي الخصومات" value={formatCurrency(totalDed)} tint="rose" />
        <StatCard icon={CheckCircle2} label="رواتب مصروفة" value={paidCount} tint="blue" />
      </div>

      <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
        <Fingerprint size={14} /> البصمات مربوطة تلقائياً: يتم سحب أيام الغياب من سجلات الحضور وخصمها من الراتب عند توليد الكشف.
      </div>

      <div className="bg-white rounded-2xl border border-border p-4 mb-5 flex gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">الشهر</label>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"].map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">السنة</label>
          <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>
        ) : payrolls.length === 0 ? (
          <div className="p-14 text-center">
            <Wallet size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-muted-foreground">لا توجد كشوفات لهذا الشهر — اضغط "توليد كشف الشهر"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-right px-4 py-3 font-medium sticky right-0 bg-slate-50">الموظف</th>
                  <th className="text-right px-3 py-3 font-medium">أساسي</th>
                  <th className="text-right px-3 py-3 font-medium">سكن</th>
                  <th className="text-right px-3 py-3 font-medium">مواصلات</th>
                  <th className="text-right px-3 py-3 font-medium text-emerald-600">حوافز</th>
                  <th className="text-right px-3 py-3 font-medium text-amber-600">تأمينات (موظف)</th>
                  <th className="text-right px-3 py-3 font-medium">غياب (يوم)</th>
                  <th className="text-right px-3 py-3 font-medium text-rose-600">خصومات</th>
                  <th className="text-right px-3 py-3 font-medium">الصافي</th>
                  <th className="text-right px-3 py-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium sticky right-0 bg-white">{p.employee_name}</td>
                    <td className="px-3 py-2 tabular-nums">{formatCurrency(p.base_salary)}</td>
                    <td className="px-3 py-2 tabular-nums">{formatCurrency(p.housing_allowance)}</td>
                    <td className="px-3 py-2 tabular-nums">{formatCurrency(p.transport_allowance)}</td>
                    <td className="px-3 py-2"><EditableCell value={p.bonus} onCommit={(v) => updateField(p.id, "bonus", v)} /></td>
                    <td className="px-3 py-2 text-xs tabular-nums text-amber-700">{formatCurrency(p.gosi_employee || 0)}</td>
                    <td className="px-3 py-2"><EditableCell value={p.deductions} onCommit={(v) => updateField(p.id, "deductions", v)} /></td>
                    <td className="px-3 py-2 tabular-nums text-rose-600 font-medium">{p.absent_days || 0}</td>
                    <td className="px-3 py-2 font-bold tabular-nums">{formatCurrency(p.net_salary)}</td>
                    <td className="px-3 py-2">
                      {p.status === "draft" ? (
                        <Button size="sm" variant="outline" onClick={() => setStatus(p, "approved")} className="h-7 text-xs">اعتماد</Button>
                      ) : p.status === "approved" ? (
                        <Button size="sm" onClick={() => setStatus(p, "paid")} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1">
                          <FileCheck size={14} /> صرف
                        </Button>
                      ) : (
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", payrollStatusLabel(p.status).cls)}>
                          {payrollStatusLabel(p.status).label}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
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
    <input
      type="number"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => onCommit(v)}
      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
      className="w-20 px-2 py-1 text-xs tabular-nums border border-transparent rounded-lg hover:border-border focus:border-border focus:outline-none bg-transparent"
    />
  );
}