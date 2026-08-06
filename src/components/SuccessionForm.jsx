import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { todayISO } from "@/lib/hr";

const empty = {
  position_title: "", department: "", current_holder_id: "", current_holder_name: "",
  position_status: "active", successor_id: "", successor_name: "",
  readiness_level: "development_needed", development_plan: "", development_deadline: "",
  risk_of_loss: "medium", impact_of_loss: "medium", last_updated: todayISO(), notes: "",
};

export default function SuccessionForm({ open, employees, editing, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm({ ...empty, ...editing });
    else setForm({ ...empty });
  }, [editing, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const empName = (id) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.employee_number} - ${e.position}` : "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      current_holder_name: empName(form.current_holder_id) || form.current_holder_name,
      successor_name: empName(form.successor_id) || form.successor_name,
      last_updated: todayISO(),
    };
    try {
      if (editing?.id) {
        await base44.entities.SuccessionPlan.update(editing.id, payload);
      } else {
        await base44.entities.SuccessionPlan.create(payload);
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
          <DialogTitle>{editing ? "تعديل خطة تعاقب" : "خطة تعاقب جديدة"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="المسمى الوظيفي (المنصب الحرج)">
              <Input value={form.position_title} onChange={(e) => set("position_title", e.target.value)} required />
            </Field>
            <Field label="الإدارة">
              <Input value={form.department} onChange={(e) => set("department", e.target.value)} />
            </Field>
            <Field label="الشاغل الحالي">
              <Select value={form.current_holder_id} onValueChange={(v) => set("current_holder_id", v)}>
                <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.employee_number} - {e.position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="حالة المركز">
              <Select value={form.position_status} onValueChange={(v) => set("position_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">مستقر</SelectItem>
                  <SelectItem value="at_rick">عرضة للمغادرة</SelectItem>
                  <SelectItem value="leaving">في طريقه للمغادرة</SelectItem>
                  <SelectItem value="vacant">شاغر</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="المرشح البديل">
              <Select value={form.successor_id} onValueChange={(v) => set("successor_id", v)}>
                <SelectTrigger><SelectValue placeholder="اختر المرشح" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.employee_number} - {e.position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="مستوى الجاهزية">
              <Select value={form.readiness_level} onValueChange={(v) => set("readiness_level", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready_now">جاهز الآن</SelectItem>
                  <SelectItem value="ready_1_2_years">جاهز خلال 1-2 سنة</SelectItem>
                  <SelectItem value="ready_3_5_years">جاهز خلال 3-5 سنوات</SelectItem>
                  <SelectItem value="development_needed">يحتاج تطوير</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="خطر المغادرة">
              <Select value={form.risk_of_loss} onValueChange={(v) => set("risk_of_loss", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">مرتفع</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="أثر المغادرة">
              <Select value={form.impact_of_loss} onValueChange={(v) => set("impact_of_loss", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">مرتفع</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="خطة التطوير للمرشح البديل">
            <Textarea value={form.development_plan} onChange={(e) => set("development_plan", e.target.value)} rows={3} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="موعد إنجاز التطوير">
              <Input type="date" value={form.development_deadline} onChange={(e) => set("development_deadline", e.target.value)} />
            </Field>
            <Field label="ملاحظات">
              <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={saving || !form.position_title}>
              {saving ? "جارٍ الحفظ..." : "حفظ الخطة"}
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