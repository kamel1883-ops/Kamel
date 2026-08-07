import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import EmployeeForm from "@/components/EmployeeForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, statusEmployeeLabel } from "@/lib/hr";
import { useI18n } from "@/lib/i18n";

export default function Employees() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "الموظفون", subtitle: "إدارة بيانات وملفات الموظفين", add: "موظف جديد",
    search: "بحث بالرقم أو المسمى...", allDepts: "كل الإدارات", loading: "جارٍ التحميل...",
    empty: "لا يوجد موظفون مطابقون", del: (n) => `حذف الموظف ${n}؟`,
    thNum: "الرقم", thPos: "المسمى", thDept: "الإدارة", thStatus: "الحالة", thSalary: "الراتب", thActions: "إجراءات",
  } : {
    title: "Employees", subtitle: "Manage employee data and profiles", add: "New employee",
    search: "Search by number or title...", allDepts: "All departments", loading: "Loading...",
    empty: "No matching employees", del: (n) => `Delete employee ${n}?`,
    thNum: "Number", thPos: "Title", thDept: "Department", thStatus: "Status", thSalary: "Salary", thActions: "Actions",
  };

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.Employee.list("-created_date", 500);
    setEmployees(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [editTarget, formOpen]);

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
  const filtered = employees.filter((e) => {
    const q = search.trim();
    const matchQ = !q || e.employee_number?.includes(q) || e.position?.includes(q) || e.department?.includes(q);
    const matchD = deptFilter === "all" || e.department === deptFilter;
    return matchQ && matchD;
  });

  const remove = async (emp) => {
    if (!confirm(t.del(emp.employee_number))) return;
    await base44.entities.Employee.delete(emp.id);
    load();
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        action={<Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="gap-2"><Plus size={18} /> {t.add}</Button>}
      />

      <div className="bg-white rounded-2xl border border-border">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} className="pr-10" />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="sm:w-56"><SelectValue placeholder={t.allDepts} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allDepts}</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center">
            <Users size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-muted-foreground">{t.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">{t.thNum}</th>
                  <th className="text-right px-4 py-3 font-medium">{t.thPos}</th>
                  <th className="text-right px-4 py-3 font-medium">{t.thDept}</th>
                  <th className="text-right px-4 py-3 font-medium">{t.thStatus}</th>
                  <th className="text-right px-4 py-3 font-medium">{t.thSalary}</th>
                  <th className="text-right px-4 py-3 font-medium">{t.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{emp.employee_number}</td>
                    <td className="px-4 py-3">{emp.position}</td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.department}</td>
                    <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(emp.base_salary)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditTarget(emp); setFormOpen(true); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><Pencil size={16} /></button>
                        <button onClick={() => remove(emp)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} employee={editTarget} />
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", statusEmployeeLabel(status).cls)}>{statusEmployeeLabel(status).label}</span>;
}