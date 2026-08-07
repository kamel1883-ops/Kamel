import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Network, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function OrgStructure() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const UNIT_TYPES = isAr ? [
    { value: "general_management", label: "الإدارة العليا" }, { value: "executive", label: "إدارة تنفيذية" },
    { value: "department", label: "إدارة" }, { value: "division", label: "قطاع" },
    { value: "section", label: "قسم" }, { value: "unit", label: "وحدة" },
    { value: "supervisor", label: "مشرف" }, { value: "role", label: "وظيفة" }, { value: "other", label: "أخرى" },
  ] : [
    { value: "general_management", label: "General management" }, { value: "executive", label: "Executive" },
    { value: "department", label: "Department" }, { value: "division", label: "Division" },
    { value: "section", label: "Section" }, { value: "unit", label: "Unit" },
    { value: "supervisor", label: "Supervisor" }, { value: "role", label: "Role" }, { value: "other", label: "Other" },
  ];
  const typeLabel = (v) => UNIT_TYPES.find((t) => t.value === v)?.label || v;
  const t = isAr ? {
    title: "الهيكل التنظيمي", subtitle: "ابنِ هيكل منشأتك بنفسك بعدد مستويات ووحدات غير محدود — من الإدارة العليا إلى الأقسام والمشرفين والعمال.",
    addRoot: "إضافة وحدة جذرية", sUnits: "إجمالي الوحدات", sPlanned: "العدد المخطط الكلي", sActual: "العدد الفعلي الكلي",
    loading: "جارٍ التحميل...", empty: "لا توجد وحدات بعد. ابدأ بإضافة وحدة جذرية (مثل الإدارة العليا أو رئيس المنشأة).",
    sub: "وحدة فرعية", planned: (p, a) => `مخطط: ${p || 0} / فعلي: ${a || 0}`,
    editT: "تعديل وحدة تنظيمية", newT: "إضافة وحدة تنظيمية", name: "اسم الوحدة *", namePh: "مثال: الإدارة المالية",
    type: "نوع الوحدة *", parent: "الوحدة الأصل", root: "بدون (وحدة جذرية)", manager: "المسؤول عن الوحدة", managerPh: "اسم المسؤول",
    plannedH: "العدد المخطط", actualH: "العدد الفعلي", order: "الترتيب", notes: "ملاحظات", cancel: "إلغاء", save: "حفظ التعديلات", addB: "إضافة",
  } : {
    title: "Organizational structure", subtitle: "Build your org chart yourself with unlimited levels — from top management to sections, supervisors and staff.",
    addRoot: "Add root unit", sUnits: "Total units", sPlanned: "Total planned", sActual: "Total actual",
    loading: "Loading...", empty: "No units yet. Add a root unit (e.g. top management or head of org).",
    sub: "Sub-unit", planned: (p, a) => `Planned: ${p || 0} / Actual: ${a || 0}`,
    editT: "Edit org unit", newT: "Add org unit", name: "Unit name *", namePh: "e.g. Finance",
    type: "Unit type *", parent: "Parent unit", root: "None (root unit)", manager: "Unit owner", managerPh: "Owner name",
    plannedH: "Planned headcount", actualH: "Actual headcount", order: "Order", notes: "Notes", cancel: "Cancel", save: "Save changes", addB: "Add",
  };

  const empty = { name: "", unit_type: "department", parent_id: "none", manager_name: "", planned_headcount: 0, current_headcount: 0, order: 0, notes: "" };
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.OrgUnit.list("-created_date", 500);
    setUnits(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setEditing(null); setForm(empty); };
  const openNew = (parentId = "none") => { reset(); setForm((f) => ({ ...f, parent_id: parentId })); setOpen(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name || "", unit_type: u.unit_type || "department", parent_id: u.parent_id || "none", manager_name: u.manager_name || "", planned_headcount: u.planned_headcount || 0, current_headcount: u.current_headcount || 0, order: u.order || 0, notes: u.notes || "" });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const parent = form.parent_id === "none" ? null : units.find((u) => u.id === form.parent_id);
    const payload = { ...form, parent_id: form.parent_id === "none" ? null : form.parent_id, parent_name: parent ? parent.name : null, planned_headcount: Number(form.planned_headcount) || 0, current_headcount: Number(form.current_headcount) || 0, order: Number(form.order) || 0 };
    if (editing) await base44.entities.OrgUnit.update(editing.id, payload);
    else await base44.entities.OrgUnit.create(payload);
    setOpen(false); reset(); load();
  };
  const remove = async (id) => { await base44.entities.OrgUnit.delete(id); await load(); };

  const childrenOf = (parentId) => units.filter((u) => (u.parent_id || null) === parentId).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));

  const renderNode = (node, depth = 0) => {
    const kids = childrenOf(node.id);
    return (
      <div key={node.id}>
        <div className="flex items-center justify-between gap-3 bg-white border border-border rounded-xl px-4 py-3" style={{ marginRight: depth * 22 }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0"><Network size={16} className="text-violet-600" /></div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{node.name}</div>
              <div className="text-xs text-muted-foreground">{typeLabel(node.unit_type)}{node.manager_name ? ` • ${node.manager_name}` : ""}{` • ${t.planned(node.planned_headcount, node.current_headcount)}`}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" variant="ghost" onClick={() => openNew(node.id)} className="gap-1 h-7 text-xs"><Plus size={14} /> {t.sub}</Button>
            <Button size="sm" variant="ghost" onClick={() => openEdit(node)} className="h-7"><Pencil size={14} /></Button>
            <Button size="sm" variant="ghost" onClick={() => remove(node.id)} className="h-7 text-rose-500"><Trash2 size={14} /></Button>
          </div>
        </div>
        {kids.length > 0 && <div className="mt-1.5 space-y-1.5">{kids.map((k) => renderNode(k, depth + 1))}</div>}
      </div>
    );
  };

  const roots = childrenOf(null);
  const totalPlanned = units.reduce((s, u) => s + (u.planned_headcount || 0), 0);
  const totalActual = units.reduce((s, u) => s + (u.current_headcount || 0), 0);

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} action={<Button onClick={() => openNew()} className="gap-2"><Plus size={16} /> {t.addRoot}</Button>} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Stat label={t.sUnits} value={units.length} icon={Network} />
        <Stat label={t.sPlanned} value={totalPlanned} icon={Users} />
        <Stat label={t.sActual} value={totalActual} icon={Users} />
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
      ) : units.length === 0 ? (
        <div className="bg-white border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground">{t.empty}</div>
      ) : (
        <div className="space-y-1.5">{roots.map((n) => renderNode(n))}</div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? t.editT : t.newT}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.name}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder={t.namePh} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t.type}</Label>
                <Select value={form.unit_type} onValueChange={(v) => setForm({ ...form, unit_type: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{UNIT_TYPES.map((tt) => <SelectItem key={tt.value} value={tt.value}>{tt.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.parent}</Label>
                <Select value={form.parent_id} onValueChange={(v) => setForm({ ...form, parent_id: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.root}</SelectItem>
                    {units.filter((u) => u.id !== editing?.id).map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>{t.manager}</Label><Input value={form.manager_name} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} placeholder={t.managerPh} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label>{t.plannedH}</Label><Input type="number" min={0} value={form.planned_headcount} onChange={(e) => setForm({ ...form, planned_headcount: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>{t.actualH}</Label><Input type="number" min={0} value={form.current_headcount} onChange={(e) => setForm({ ...form, current_headcount: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>{t.order}</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>{t.notes}</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t.cancel}</Button>
              <Button type="submit">{editing ? t.save : t.addB}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center"><Icon size={20} className="text-violet-600" /></div>
      <div><div className="text-xl font-bold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
    </div>
  );
}