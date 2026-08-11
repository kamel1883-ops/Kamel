import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Users } from "lucide-react";
import EmployeePickerDialog from "./EmployeePickerDialog";

const parseIds = (s) => {
  try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
};

export default function TrainingPlanFormDialog({ open, onOpenChange, onSaved, plan, employees }) {
  const { toast } = useToast();
  const isEdit = !!plan;
  const empty = {
    title: "", scope: "employee", employee_id: "", employee_name: "",
    employee_ids: "[]", employee_names: "", department: "",
    deficiency: "", goal: "", mechanism: "", cost: 0, start_date: "", end_date: "",
    status: "draft", description: "",
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerInitial, setPickerInitial] = useState([]);

  useEffect(() => {
    if (plan) setForm({ ...empty, ...plan, employee_ids: plan.employee_ids || JSON.stringify(plan.employee_id ? [plan.employee_id] : []) });
    else setForm(empty);
  }, [plan, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selIds = parseIds(form.employee_ids);

  const openPicker = () => {
    let init = selIds;
    if (form.scope === "department" && form.department && init.length === 0) {
      init = (employees || []).filter((e) => e.department && e.department === form.department).map((e) => e.id);
    }
    setPickerInitial(init);
    setPickerOpen(true);
  };

  const onPickConfirm = (ids) => {
    const emps = employees || [];
    const names = emps.filter((e) => ids.includes(e.id)).map((e) => e.full_name).join("، ");
    set("employee_ids", JSON.stringify(ids));
    set("employee_names", names);
    set("employee_id", ids[0] || "");
    set("employee_name", emps.find((e) => e.id === ids[0])?.full_name || "");
  };

  const fillDept = () => {
    if (!form.department) { toast({ title: "أدخل اسم القسم أولاً", variant: "destructive" }); return; }
    const ids = (employees || []).filter((e) => e.department && e.department === form.department).map((e) => e.id);
    onPickConfirm(ids);
    toast({ title: `تم تعبئة ${ids.length} موظف من القسم` });
  };

  const handleSave = async () => {
    if (!form.title) { toast({ title: "يرجى إدخال اسم الخطة", variant: "destructive" }); return; }
    const ids = parseIds(form.employee_ids);
    setSaving(true);
    try {
      const payload = { ...form, cost: Number(form.cost) || 0, employee_ids: JSON.stringify(ids) };
      if (form.scope !== "department") {
        payload.department = form.department || (employees || []).find((e) => e.id === ids[0])?.department || "";
      }
      if (isEdit) await base44.entities.TrainingPlan.update(plan.id, payload);
      else await base44.entities.TrainingPlan.create(payload);
      toast({ title: isEdit ? "تم تحديث الخطة" : "تم إنشاء الخطة" });
      onSaved?.();
      onOpenChange(false);
    } catch (e) { toast({ title: "تعذر الحفظ", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "تعديل خطة تدريبية" : "خطة تدريبية جديدة"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div><Label>اسم الخطة *</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="مثال: تطوير مهارات التواصل" /></div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>نطاق التطبيق</Label>
              <Select value={form.scope} onValueChange={(v) => set("scope", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">موظفون محددون</SelectItem>
                  <SelectItem value="department">جهة/قسم كامل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>الحالة</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.scope === "department" && (
            <div className="flex gap-2 items-end">
              <div className="flex-1"><Label>الجهة/القسم</Label><Input value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="اسم الإدارة" /></div>
              <Button type="button" variant="outline" onClick={fillDept} className="gap-1 whitespace-nowrap">تعبئة موظفي القسم فقط</Button>
            </div>
          )}

          <div>
            <Label>الموظفون المشمولون ({selIds.length})</Label>
            <Button type="button" variant="secondary" onClick={openPicker} className="gap-1 w-full justify-start mt-1">
              <Users size={15} /> {selIds.length > 0 ? `تعديل المختارين (${selIds.length})` : "اختيار الموظفين من القائمة"}
            </Button>
            {form.employee_names && (
              <div className="mt-2 text-xs text-slate-700 bg-violet-50 border border-violet-100 rounded-lg p-2 max-h-28 overflow-y-auto" dir="rtl">
                {form.employee_names}
              </div>
            )}
            {selIds.length === 0 && (
              <div className="mt-1 text-xs text-amber-600">لم يتم تحديد أي موظف — ستكون الخطة بلا مشمولين.</div>
            )}
          </div>

          <div><Label>مشاكل النقص</Label><Textarea rows={3} value={form.deficiency} onChange={(e) => set("deficiency", e.target.value)} placeholder="صف الفجوات والمهارات المفقودة..." /></div>
          <div><Label>الهدف بعد الخطة</Label><Textarea rows={2} value={form.goal} onChange={(e) => set("goal", e.target.value)} placeholder="ماذا سيحقق الموظف بعد إكمال الخطة" /></div>
          <div><Label>آلية التنفيذ</Label><Textarea rows={2} value={form.mechanism} onChange={(e) => set("mechanism", e.target.value)} placeholder="كيف ستُنفذ الخطة (دورات، تدريب على رأس العمل، مدرّب...)" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>التكلفة (ريال)</Label><Input type="number" value={form.cost} onChange={(e) => set("cost", e.target.value)} /></div>
            <div><Label>تاريخ البداية</Label><Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} /></div>
            <div><Label>تاريخ النهاية</Label><Input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} /></div>
          </div>
          <div><Label>الوصف والشرح</Label><Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ"}</Button>
        </DialogFooter>
      </DialogContent>

      <EmployeePickerDialog
        open={pickerOpen}
        onClose={setPickerOpen}
        employees={employees}
        initial={pickerInitial}
        onConfirm={onPickConfirm}
      />
    </Dialog>
  );
}