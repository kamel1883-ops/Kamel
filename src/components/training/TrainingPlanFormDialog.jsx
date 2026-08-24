import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useI18n } from "@/lib/i18n";
import { Users } from "lucide-react";
import EmployeePickerDialog from "./EmployeePickerDialog";

const parseIds = (s) => {
  try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
};

export default function TrainingPlanFormDialog({ open, onOpenChange, onSaved, plan, employees }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const { toast } = useToast();
  const t = isAr ? {
    edit: "تعديل خطة تدريبية", add: "خطة تدريبية جديدة",
    name: "اسم الخطة *", namePh: "مثال: تطوير مهارات التواصل",
    scope: "نطاق التطبيق", scopeEmp: "موظفون محددون", scopeDept: "جهة/قسم كامل",
    status: "الحالة", draft: "مسودة", inProgress: "قيد التنفيذ", completed: "مكتملة", cancelled: "ملغاة",
    dept: "الجهة/القسم", deptPh: "اسم الإدارة", fillDept: "تعبئة موظفي القسم فقط",
    included: "الموظفون المشمولون", editSel: "تعديل المختارين", pick: "اختيار الموظفين من القائمة",
    noneMsg: "لم يتم تحديد أي موظف — ستكون الخطة بلا مشمولين.",
    deficiency: "مشاكل النقص", deficiencyPh: "صف الفجوات والمهارات المفقودة...",
    goal: "الهدف بعد الخطة", goalPh: "ماذا سيحقق الموظف بعد إكمال الخطة",
    mechanism: "آلية التنفيذ", mechanismPh: "كيف ستُنفذ الخطة (دورات، تدريب على رأس العمل، مدرّب...)",
    cost: "التكلفة (ريال)", start: "تاريخ البداية", end: "تاريخ النهاية",
    desc: "الوصف والشرح",
    cancel: "إلغاء", save: "حفظ", saving: "جارٍ الحفظ...",
    needTitle: "يرجى إدخال اسم الخطة", needDept: "أدخل اسم القسم أولاً",
    filledN: "تم تعبئة {n} موظف من القسم", updated: "تم تحديث الخطة", created: "تم إنشاء الخطة", saveErr: "تعذر الحفظ",
    namesSep: "، ",
  } : {
    edit: "Edit training plan", add: "New training plan",
    name: "Plan name *", namePh: "e.g. Developing communication skills",
    scope: "Scope", scopeEmp: "Selected employees", scopeDept: "Whole department",
    status: "Status", draft: "Draft", inProgress: "In progress", completed: "Completed", cancelled: "Cancelled",
    dept: "Department", deptPh: "Department name", fillDept: "Fill department employees only",
    included: "Included employees", editSel: "Edit selected", pick: "Select employees from the list",
    noneMsg: "No employee selected — the plan will have no participants.",
    deficiency: "Skill gaps", deficiencyPh: "Describe the gaps and missing skills...",
    goal: "Goal after the plan", goalPh: "What the employee will achieve after completing the plan",
    mechanism: "Execution mechanism", mechanismPh: "How the plan will be executed (courses, on-the-job training, trainer...)",
    cost: "Cost (SAR)", start: "Start date", end: "End date",
    desc: "Description & details",
    cancel: "Cancel", save: "Save", saving: "Saving...",
    needTitle: "Please enter the plan name", needDept: "Enter the department name first",
    filledN: "Filled {n} employees from the department", updated: "Plan updated", created: "Plan created", saveErr: "Could not save",
    namesSep: ", ",
  };
  const tt = (key, vars) => key.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : `{${k}}`));

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
    const names = emps.filter((e) => ids.includes(e.id)).map((e) => e.full_name).join(t.namesSep);
    set("employee_ids", JSON.stringify(ids));
    set("employee_names", names);
    set("employee_id", ids[0] || "");
    set("employee_name", emps.find((e) => e.id === ids[0])?.full_name || "");
  };

  const fillDept = () => {
    if (!form.department) { toast({ title: t.needDept, variant: "destructive" }); return; }
    const ids = (employees || []).filter((e) => e.department && e.department === form.department).map((e) => e.id);
    onPickConfirm(ids);
    toast({ title: tt(t.filledN, { n: ids.length }) });
  };

  const handleSave = async () => {
    if (!form.title) { toast({ title: t.needTitle, variant: "destructive" }); return; }
    const ids = parseIds(form.employee_ids);
    setSaving(true);
    try {
      const payload = { ...form, cost: Number(form.cost) || 0, employee_ids: JSON.stringify(ids) };
      if (form.scope !== "department") {
        payload.department = form.department || (employees || []).find((e) => e.id === ids[0])?.department || "";
      }
      if (isEdit) await base44.entities.TrainingPlan.update(plan.id, payload);
      else await base44.entities.TrainingPlan.create(payload);
      toast({ title: isEdit ? t.updated : t.created });
      onSaved?.();
      onOpenChange(false);
    } catch (e) { toast({ title: t.saveErr, description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader><DialogTitle>{isEdit ? t.edit : t.add}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div><Label>{t.name}</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={t.namePh} /></div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t.scope}</Label>
              <Select value={form.scope} onValueChange={(v) => set("scope", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">{t.scopeEmp}</SelectItem>
                  <SelectItem value="department">{t.scopeDept}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t.status}</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t.draft}</SelectItem>
                  <SelectItem value="in_progress">{t.inProgress}</SelectItem>
                  <SelectItem value="completed">{t.completed}</SelectItem>
                  <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.scope === "department" && (
            <div className="flex gap-2 items-end">
              <div className="flex-1"><Label>{t.dept}</Label><Input value={form.department} onChange={(e) => set("department", e.target.value)} placeholder={t.deptPh} /></div>
              <Button type="button" variant="outline" onClick={fillDept} className="gap-1 whitespace-nowrap">{t.fillDept}</Button>
            </div>
          )}

          <div>
            <Label>{t.included} ({selIds.length})</Label>
            <Button type="button" variant="secondary" onClick={openPicker} className="gap-1 w-full justify-start mt-1">
              <Users size={15} /> {selIds.length > 0 ? `${t.editSel} (${selIds.length})` : t.pick}
            </Button>
            {form.employee_names && (
              <div className="mt-2 text-xs text-slate-700 bg-violet-50 border border-violet-100 rounded-lg p-2 max-h-28 overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
                {form.employee_names}
              </div>
            )}
            {selIds.length === 0 && (
              <div className="mt-1 text-xs text-amber-600">{t.noneMsg}</div>
            )}
          </div>

          <div><Label>{t.deficiency}</Label><Textarea rows={3} value={form.deficiency} onChange={(e) => set("deficiency", e.target.value)} placeholder={t.deficiencyPh} /></div>
          <div><Label>{t.goal}</Label><Textarea rows={2} value={form.goal} onChange={(e) => set("goal", e.target.value)} placeholder={t.goalPh} /></div>
          <div><Label>{t.mechanism}</Label><Textarea rows={2} value={form.mechanism} onChange={(e) => set("mechanism", e.target.value)} placeholder={t.mechanismPh} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>{t.cost}</Label><Input type="number" value={form.cost} onChange={(e) => set("cost", e.target.value)} /></div>
            <div><Label>{t.start}</Label><Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} lang={isAr ? "ar" : "en"} /></div>
            <div><Label>{t.end}</Label><Input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} lang={isAr ? "ar" : "en"} /></div>
          </div>
          <div><Label>{t.desc}</Label><Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? t.saving : t.save}</Button>
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