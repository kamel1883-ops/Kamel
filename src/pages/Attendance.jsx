import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { CalendarCheck, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayISO, attendanceStatusLabel } from "@/lib/hr";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(todayISO());
  const [statusFilter, setStatusFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const [newRec, setNewRec] = useState({ employee_id: "", check_in: "08:00", check_out: "16:00", status: "present" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Attendance.filter({ date }, "-created_date", 500);
    setRecords(data);
    const emps = await base44.entities.Employee.filter({ status: "active" }, "-created_date", 500);
    setEmployees(emps);
    setLoading(false);
  };
  useEffect(() => { load(); }, [date]);

  const filtered = statusFilter === "all" ? records : records.filter((r) => r.status === statusFilter);

  const addRecord = async (e) => {
    e.preventDefault();
    if (!newRec.employee_id) return;
    setCreating(true);
    const emp = employees.find((x) => x.id === newRec.employee_id);
    await base44.entities.Attendance.create({
      employee_id: newRec.employee_id,
      employee_name: emp ? `${emp.employee_number} - ${emp.position}` : "",
      date, check_in: newRec.check_in, check_out: newRec.check_out,
      status: newRec.status, work_hours: 8,
    });
    setNewRec({ employee_id: "", check_in: "08:00", check_out: "16:00", status: "present" });
    setCreating(false);
    load();
  };

  const updateStatus = async (rec, status) => {
    await base44.entities.Attendance.update(rec.id, { status });
    load();
  };

  const remove = async (rec) => {
    await base44.entities.Attendance.delete(rec.id);
    load();
  };

  return (
    <div>
      <PageHeader title="الحضور والانصراف" subtitle="متابعة سجل الحضور اليومي للموظفين" />

      <div className="bg-white rounded-2xl border border-border p-4 mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">التاريخ</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-44" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">الحالة</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="present">حاضر</SelectItem>
              <SelectItem value="late">متأخر</SelectItem>
              <SelectItem value="absent">غائب</SelectItem>
              <SelectItem value="leave">إجازة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <form onSubmit={addRecord} className="bg-white rounded-2xl border border-border p-4 mb-5">
        <h3 className="font-semibold mb-4">تسجيل حضور جديد</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">الموظف</label>
            <Select value={newRec.employee_id} onValueChange={(v) => setNewRec({ ...newRec, employee_id: v })}>
              <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.employee_number} - {e.position}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">الحضور</label>
            <Input type="time" value={newRec.check_in} onChange={(e) => setNewRec({ ...newRec, check_in: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">الانصراف</label>
            <Input type="time" value={newRec.check_out} onChange={(e) => setNewRec({ ...newRec, check_out: e.target.value })} />
          </div>
          <Button type="submit" disabled={creating} className="gap-2"><Plus size={18} /> تسجيل</Button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center">
            <CalendarCheck size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-muted-foreground">لا توجد سجلات لهذا اليوم</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">الموظف</th>
                  <th className="text-right px-4 py-3 font-medium">الحضور</th>
                  <th className="text-right px-4 py-3 font-medium">الانصراف</th>
                  <th className="text-right px-4 py-3 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{r.employee_name}</td>
                    <td className="px-4 py-3 tabular-nums">{r.check_in || "-"}</td>
                    <td className="px-4 py-3 tabular-nums">{r.check_out || "-"}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <Select value={r.status} onValueChange={(v) => updateStatus(r, v)}>
                        <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">حاضر</SelectItem>
                          <SelectItem value="late">متأخر</SelectItem>
                          <SelectItem value="absent">غائب</SelectItem>
                          <SelectItem value="leave">إجازة</SelectItem>
                        </SelectContent>
                      </Select>
                      <button onClick={() => remove(r)} className="text-red-500 text-xs mr-2">حذف</button>
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

function StatusBadge({ status }) {
  const s = attendanceStatusLabel(status);
  return <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", s.cls)}>{s.label}</span>;
}