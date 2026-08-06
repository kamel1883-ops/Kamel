import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Car, Plus, Pencil, Trash2, Shield, FileText, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { expirySeverity, todayISO } from "@/lib/eos";

const empty = {
  plate_number: "", vehicle_type: "sedan", brand: "", model: "", year: new Date().getFullYear(),
  color: "", assigned_to: "", insurance_number: "", insurance_expiry: "",
  license_expiry: "", inspection_expiry: "", status: "active", notes: "",
};

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.Vehicle.list("-created_date", 500);
    setVehicles(data);
    const emps = await base44.entities.Employee.filter({ status: "active" }, "-created_date", 500);
    setEmployees(emps);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (v) => { setEditing(v); setForm({ ...empty, ...v }); setOpen(true); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    if (editing) await base44.entities.Vehicle.update(editing.id, form);
    else await base44.entities.Vehicle.create(form);
    setOpen(false);
    load();
  };

  const remove = async (v) => {
    if (!confirm(`حذف المركبة ${v.plate_number}؟`)) return;
    await base44.entities.Vehicle.delete(v.id);
    load();
  };

  const typeLabel = (t) => ({ sedan: "سيدان", suv: "دفع رباعي", van: "فان", truck: "شاحنة", bus: "حافلة", other: "أخرى" }[t] || t);

  return (
    <div>
      <PageHeader title="إدارة الأسطول" subtitle="متابعة المركبات وانتهاء الرخص والفحص والتأمين"
        action={<Button onClick={startAdd} className="gap-2"><Plus size={18} /> مركبة جديدة</Button>} />

      {loading ? <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.length === 0 && (
            <div className="col-span-full p-14 text-center bg-white rounded-2xl border border-border">
              <Car size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-muted-foreground">لا توجد مركبات مسجلة</p>
            </div>
          )}
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"><Car size={20} /></div>
                  <div>
                    <div className="font-bold">{v.plate_number}</div>
                    <div className="text-xs text-muted-foreground">{v.brand} {v.model} · {v.year}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(v)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><Pencil size={15} /></button>
                  <button onClick={() => remove(v)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
                </div>
              </div>
              {v.assigned_to && <div className="text-sm mb-3 text-muted-foreground">المسؤول: {employees.find((e) => e.id === v.assigned_to)?.employee_number || v.assigned_to}</div>}
              <div className="space-y-2 text-sm">
                <ExpiryRow icon={Shield} label="التأمين" date={v.insurance_expiry} />
                <ExpiryRow icon={FileText} label="رخصة السير" date={v.license_expiry} />
                <ExpiryRow icon={Wrench} label="الفحص الفني" date={v.inspection_expiry} />
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <h3 className="font-semibold">{editing ? "تعديل مركبة" : "إضافة مركبة"}</h3>
            <div className="grid grid-cols-2 gap-3">
              <In label="رقم اللوحة"><Input value={form.plate_number} onChange={(e) => set("plate_number", e.target.value)} required /></In>
              <In label="النوع">
                <Select value={form.vehicle_type} onValueChange={(v) => set("vehicle_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["sedan","suv","van","truck","bus","other"].map((t) => <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </In>
              <In label="الماركة"><Input value={form.brand} onChange={(e) => set("brand", e.target.value)} /></In>
              <In label="الموديل"><Input value={form.model} onChange={(e) => set("model", e.target.value)} /></In>
              <In label="سنة الصنع"><Input type="number" value={form.year} onChange={(e) => set("year", Number(e.target.value))} /></In>
              <In label="اللون"><Input value={form.color} onChange={(e) => set("color", e.target.value)} /></In>
              <In label="المسؤول">
                <Select value={form.assigned_to} onValueChange={(v) => set("assigned_to", v)}>
                  <SelectTrigger><SelectValue placeholder="بدون" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.employee_number} - {e.position}</SelectItem>)}
                  </SelectContent>
                </Select>
              </In>
              <In label="الحالة">
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">سارية</SelectItem>
                    <SelectItem value="under_maintenance">صيانة</SelectItem>
                    <SelectItem value="out_of_service">خارج الخدمة</SelectItem>
                  </SelectContent>
                </Select>
              </In>
              <In label="انتهاء التأمين"><Input type="date" value={form.insurance_expiry} onChange={(e) => set("insurance_expiry", e.target.value)} /></In>
              <In label="رقم التأمين"><Input value={form.insurance_number} onChange={(e) => set("insurance_number", e.target.value)} /></In>
              <In label="انتهاء رخصة السير"><Input type="date" value={form.license_expiry} onChange={(e) => set("license_expiry", e.target.value)} /></In>
              <In label="انتهاء الفحص الفني"><Input type="date" value={form.inspection_expiry} onChange={(e) => set("inspection_expiry", e.target.value)} /></In>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button type="submit">حفظ</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ExpiryRow({ icon: Icon, label, date }) {
  const sev = expirySeverity(date);
  const days = date ? Math.ceil((new Date(date) - new Date(todayISO())) / 86400000) : null;
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon size={15} /> {label}</span>
      <span className={cn("text-xs px-2 py-1 rounded-lg border font-medium", sev.cls)}>
        {date ? `${date} (${days >= 0 ? "+" : ""}${days} يوم)` : "غير محدد"}
      </span>
    </div>
  );
}

function In({ label, children }) {
  return <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{label}</label>{children}</div>;
}