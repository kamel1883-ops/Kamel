import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Loader2, Plus, Pencil, Search, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS = { active: "نشط", on_leave: "في إجازة", terminated: "منهى", resigned: "مستقيل" };
const STATUS_CLS = { active: "bg-emerald-100 text-emerald-700", on_leave: "bg-amber-100 text-amber-700", terminated: "bg-rose-100 text-rose-700", resigned: "bg-slate-100 text-slate-600" };
const CONTRACT = { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد" };

const EMPTY = {
  full_name: "", employee_number: "", national_id: "", department: "", position: "",
  base_salary: 0, housing_allowance: 0, transport_allowance: 0, other_allowances: 0,
  hire_date: new Date().toISOString().slice(0, 10), contract_type: "full_time", status: "active",
  is_saudi: false, gender: "male", phone: "", email: "",
};

// إدارة الموظفين في بوابة الموظف — للموظف المُفوّض بصلاحية «الموظفون».
// إضافة وتعديل بيانات الموظفين، وتُوثّق كل عملية باسم وهوية المُنفّذ (حقل وُظّف بواسطة).
export default function PortalEmployeesManager({ session, isAr = true }) {
  const args = { token: session.token, employee_id: session.employee_id };
  const [employees, setEmployees] = useState([]);
  const [preparer, setPreparer] = useState({ name: "", id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const invoke = async (action, extra = {}) => { const res = await base44.functions.invoke("portalData", { ...args, action, ...extra }); return res?.data || res; };
  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await invoke("delegated_list", { section: "employees" }); if (!d?.ok) return; setEmployees(d.records || []); setPreparer(d.preparer || { name: "", id: "" }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean))).sort();

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (e) => { setEditing(e); setForm({ ...EMPTY, ...e, base_salary: e.base_salary || 0, housing_allowance: e.housing_allowance || 0, transport_allowance: e.transport_allowance || 0, other_allowances: e.other_allowances || 0 }); setShowForm(true); };

  const submit = async () => {
    if (!form.full_name) return;
    setSaving(true);
    try {
      const payload = { ...form, base_salary: Number(form.base_salary) || 0, housing_allowance: Number(form.housing_allowance) || 0, transport_allowance: Number(form.transport_allowance) || 0, other_allowances: Number(form.other_allowances) || 0 };
      if (editing) { await invoke("delegated_update", { section: "employees", id: editing.id, payload }); setEmployees((r) => r.map((x) => (x.id === editing.id ? { ...x, ...payload } : x))); }
      else { const d = await invoke("delegated_create", { section: "employees", payload }); if (d?.ok) setEmployees((r) => [d.record, ...r]); }
      setShowForm(false);
    } finally { setSaving(false); }
  };

  const changeStatus = async (id, status) => { setEmployees((r) => r.map((x) => (x.id === id ? { ...x, status } : x))); await invoke("delegated_update", { section: "employees", id, payload: { status } }); };

  const ql = q.trim().toLowerCase();
  const filtered = employees.filter((e) => !ql || (e.full_name || "").toLowerCase().includes(ql) || (e.employee_number || "").toLowerCase().includes(ql) || (e.national_id || "").toLowerCase().includes(ql));

  const inp = "h-9 rounded-md border border-input bg-transparent px-3 text-sm";
  const lbl = "text-[11px] font-medium text-muted-foreground mb-1";

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2"><Users size={18} className="text-violet-600" /><h3 className="font-bold text-sm">{isAr ? "إدارة الموظفين" : "Employees"}</h3></div>
          <Button onClick={openNew} size="sm" className="gap-1.5"><Plus size={14} />{isAr ? "إضافة موظف" : "Add employee"}</Button>
        </div>
        {preparer.name && <div className="text-[11px] text-violet-700 flex items-center gap-1.5 mb-2"><ShieldCheck size={13} />{isAr ? `كل إضافة/تعديل يُوثّق باسمك (${preparer.name}).` : `Every add/edit is attributed to you (${preparer.name}).`}</div>}
        <div className="relative mt-2">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={isAr ? "ابحث بالاسم أو الرقم أو الهوية..." : "Search..."} className="ps-9" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2 text-sm"><Loader2 className="animate-spin" size={16} />{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
        : filtered.length === 0 ? <div className="p-10 text-center text-muted-foreground text-sm">{isAr ? "لا يوجد موظفون" : "No employees"}</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-muted-foreground text-xs"><tr>
                <th className="text-right px-4 py-2.5 font-medium">{isAr ? "الموظف" : "Employee"}</th>
                <th className="text-right px-4 py-2.5 font-medium">{isAr ? "الرقم" : "Number"}</th>
                <th className="text-right px-4 py-2.5 font-medium">{isAr ? "الإدارة" : "Department"}</th>
                <th className="text-right px-4 py-2.5 font-medium">{isAr ? "المسمى" : "Position"}</th>
                <th className="text-right px-4 py-2.5 font-medium">{isAr ? "الراتب" : "Salary"}</th>
                <th className="text-right px-4 py-2.5 font-medium">{isAr ? "الحالة" : "Status"}</th>
                <th className="text-right px-4 py-2.5 font-medium">{isAr ? "وُظّف بواسطة" : "Hired by"}</th>
                <th className="text-right px-4 py-2.5 font-medium">{isAr ? "إجراءات" : "Actions"}</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium">{e.full_name}<div className="text-xs text-muted-foreground" dir="ltr">{e.national_id || ""}</div></td>
                    <td className="px-4 py-2.5 tabular-nums text-xs">{e.employee_number || "—"}</td>
                    <td className="px-4 py-2.5">{e.department || "—"}</td>
                    <td className="px-4 py-2.5">{e.position || "—"}</td>
                    <td className="px-4 py-2.5 tabular-nums">{e.base_salary ? e.base_salary.toLocaleString() : "—"}</td>
                    <td className="px-4 py-2.5">
                      <select value={e.status} onChange={(ev) => changeStatus(e.id, ev.target.value)} className="text-[11px] rounded-md border border-border px-2 py-1 bg-transparent">
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-violet-700">{e.hired_by_name ? `${e.hired_by_name}${e.hired_by_employee_id ? ` — ${e.hired_by_employee_id}` : ""}` : "—"}</td>
                    <td className="px-4 py-2.5"><button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-600"><Pencil size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? (isAr ? "تعديل موظف" : "Edit employee") : (isAr ? "إضافة موظف" : "Add employee")}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-2">
            <div className="col-span-2"><Label className={lbl}>{isAr ? "الاسم الكامل *" : "Full name *"}</Label><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "الرقم الوظيفي" : "Employee number"}</Label><Input value={form.employee_number} onChange={(e) => set("employee_number", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "الهوية/الإقامة" : "National ID"}</Label><Input value={form.national_id} onChange={(e) => set("national_id", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "الإدارة" : "Department"}</Label>
              <Select value={form.department} onValueChange={(v) => set("department", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label className={lbl}>{isAr ? "المسمى" : "Position"}</Label><Input value={form.position} onChange={(e) => set("position", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "نوع العقد" : "Contract"}</Label><Select value={form.contract_type} onValueChange={(v) => set("contract_type", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CONTRACT).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className={lbl}>{isAr ? "تاريخ المباشرة" : "Hire date"}</Label><Input type="date" value={form.hire_date} onChange={(e) => set("hire_date", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "الراتب الأساسي" : "Base salary"}</Label><Input type="number" value={form.base_salary} onChange={(e) => set("base_salary", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "بدل السكن" : "Housing"}</Label><Input type="number" value={form.housing_allowance} onChange={(e) => set("housing_allowance", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "بدل المواصلات" : "Transport"}</Label><Input type="number" value={form.transport_allowance} onChange={(e) => set("transport_allowance", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "بدلات أخرى" : "Other allowances"}</Label><Input type="number" value={form.other_allowances} onChange={(e) => set("other_allowances", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "الجنسية" : "Nationality"}</Label><Input value={form.nationality || ""} onChange={(e) => set("nationality", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "الجوال" : "Phone"}</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{isAr ? "البريد" : "Email"}</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} className={inp} /></div>
            <div className="flex items-end gap-2"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!form.is_saudi} onChange={(e) => set("is_saudi", e.target.checked)} className="rounded" />{isAr ? "سعودي" : "Saudi"}</label></div>
            <div><Label className={lbl}>{isAr ? "الحالة" : "Status"}</Label><Select value={form.status} onValueChange={(v) => set("status", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={submit} disabled={saving} className="gap-1.5">{saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}{isAr ? "حفظ" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}