import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function TrainingPlanFormDialog({ open, onOpenChange, onSaved, plan, employees }) {
  const { toast } = useToast();
  const isEdit = !!plan;
  const empty = { title: "", scope: "employee", employee_id: "", employee_name: "", department: "", deficiency: "", goal: "", mechanism: "", cost: 0, start_date: "", end_date: "", status: "draft", description: "" };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) setForm({ ...empty, ...plan });
    else setForm(empty);
  }, [plan, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title) { toast({ title: "يرجى إدخال اسم الخطة", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, cost: Number(form.cost) || 0 };
      if (form.scope === "employee") {
        const emp = (employees || []).find((e) => e.id === form.employee_id);
        if (emp) { payload.employee_name = emp.full_name; payload.department = emp.department || ""; }
      } else {
        payload.employee_id = ""; payload.employee_name = "";
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
                  <SelectItem value="employee">موظف محدد</SelectItem>
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
          {form.scope === "employee" ? (
            <div><Label>الموظف المستهدف</Label>
              <Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)}>
                <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
                <SelectContent>
                  {(employees || []).map((e) => (<SelectItem key={e.id} value={e.id}>{e.full_name} — {e.department || ""}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div><Label>الجهة/القسم</Label><Input value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="اسم الإدارة" /></div>
          )}
          <div><Label>مشاكل النقص لدى الموظف</Label><Textarea rows={3} value={form.deficiency} onChange={(e) => set("deficiency", e.target.value)} placeholder="صف الفجوات والمهارات المفقودة..." /></div>
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
    </Dialog>
  );
}