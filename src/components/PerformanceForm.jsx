import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { todayISO } from "@/lib/hr";

const empty = {
  employee_id: "", review_period: "annual", period_year: new Date().getFullYear(),
  review_type: "annual", goals: "", goals_rating: 0, competencies_rating: 0,
  values_rating: 0, overall_rating: 0, strengths: "", improvements: "",
  recommendation: "none", target_grade: "", promotion_ready: false,
  review_date: todayISO(), next_review_date: "", status: "draft", notes: "",
};

export default function PerformanceForm({ open, employees, editing, user, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm({ ...empty, ...editing });
    else setForm({ ...empty });
  }, [editing, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const emp = employees.find((x) => x.id === form.employee_id) || {};
    const overall =
      form.overall_rating ||
      Math.round(((Number(form.goals_rating) + Number(form.competencies_rating) + Number(form.values_rating)) / 3) * 100) / 100;
    const payload = {
      ...form,
      period_year: Number(form.period_year),
      goals_rating: Number(form.goals_rating),
      competencies_rating: Number(form.competencies_rating),
      values_rating: Number(form.values_rating),
      overall_rating: overall,
      employee_name: emp.employee_number ? `${emp.employee_number} - ${emp.position}` : emp.position,
      department: emp.department || "",
      current_grade: emp.job_grade || "",
      reviewer_id: user?.id || "",
      reviewer_name: user?.full_name || "المدير",
    };
    try {
      if (editing?.id) {
        await base44.entities.Performance.update(editing.id, payload);
      } else {
        await base44.entities.Performance.create(payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل تقييم الأداء" : "تقييم أداء جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="الموظف">
              <Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)}>
                <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.employee_number} - {e.position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="نوع المراجعة">
              <Select value={form.review_type} onValueChange={(v) => set("review_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">سنوي</SelectItem>
                  <SelectItem value="midyear">نصف سنوي</SelectItem>
                  <SelectItem value="probation">فترة التجربة</SelectItem>
                  <SelectItem value="goal_setting">تحديد الأهداف</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="فترة التقييم">
              <Select value={form.review_period} onValueChange={(v) => set("review_period", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">سنوي</SelectItem>
                  <SelectItem value="midyear">نصف سنوي</SelectItem>
                  <SelectItem value="probation">تجربة</SelectItem>
                  <SelectItem value="Q1">الربع الأول</SelectItem>
                  <SelectItem value="Q2">الربع الثاني</SelectItem>
                  <SelectItem value="Q3">الربع الثالث</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="السنة">
              <Input type="number" value={form.period_year} onChange={(e) => set("period_year", e.target.value)} />
            </Field>
          </div>

          <Field label="الأهداف والمخرجات">
            <Textarea value={form.goals} onChange={(e) => set("goals", e.target.value)} rows={3} />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <RatingField label="تقييم الأهداف" value={form.goals_rating} onChange={(v) => set("goals_rating", v)} />
            <RatingField label="تقييم الكفاءات" value={form.competencies_rating} onChange={(v) => set("competencies_rating", v)} />
            <RatingField label="تقييم القيم" value={form.values_rating} onChange={(v) => set("values_rating", v)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="نقاط القوة">
              <Textarea value={form.strengths} onChange={(e) => set("strengths", e.target.value)} rows={2} />
            </Field>
            <Field label="فرص التحسين">
              <Textarea value={form.improvements} onChange={(e) => set("improvements", e.target.value)} rows={2} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="التوصية">
              <Select value={form.recommendation} onValueChange={(v) => set("recommendation", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون</SelectItem>
                  <SelectItem value="maintain">إبقاء على الوضع</SelectItem>
                  <SelectItem value="promote">ترقية</SelectItem>
                  <SelectItem value="bonus">حافز</SelectItem>
                  <SelectItem value="warn">إنذار</SelectItem>
                  <SelectItem value="terminate">إنهاء</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="الدرجة المستهدفة (للمسار الوظيفي)">
              <Input value={form.target_grade} onChange={(e) => set("target_grade", e.target.value)} placeholder="مثال: مدير قسم" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="تاريخ التقييم">
              <Input type="date" value={form.review_date} onChange={(e) => set("review_date", e.target.value)} />
            </Field>
            <Field label="التقييم القادم">
              <Input type="date" value={form.next_review_date} onChange={(e) => set("next_review_date", e.target.value)} />
            </Field>
            <Field label="الحالة">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="submitted">مُرسلة</SelectItem>
                  <SelectItem value="acknowledged">معتمدة من الموظف</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.promotion_ready} onCheckedChange={(v) => set("promotion_ready", v)} />
            جاهز للترقية
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={saving || !form.employee_id}>
              {saving ? "جارٍ الحفظ..." : "حفظ التقييم"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function RatingField({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label} ({value}/5)</Label>
      <Input
        type="number" min={0} max={5} step={0.5}
        value={value} onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}