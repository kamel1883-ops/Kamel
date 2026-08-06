import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const empty = {
  employee_number: "", national_id: "", nationality: "", gender: "male",
  birth_date: "", phone: "", address: "", emergency_contact: "",
  department: "", position: "", job_grade: "", hire_date: "",
  contract_type: "full_time", status: "active",
  base_salary: 0, housing_allowance: 0, transport_allowance: 0, other_allowances: 0,
  avatar_url: "",
};

export default function EmployeeForm({ open, onClose, onSaved, employee }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(employee ? { ...empty, ...employee } : empty);
  }, [employee, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        base_salary: Number(form.base_salary) || 0,
        housing_allowance: Number(form.housing_allowance) || 0,
        transport_allowance: Number(form.transport_allowance) || 0,
        other_allowances: Number(form.other_allowances) || 0,
      };
      if (employee) {
        await base44.entities.Employee.update(employee.id, payload);
      } else {
        await base44.entities.Employee.create(payload);
      }
      onSaved?.();
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="الرقم الوظيفي"><Input value={form.employee_number} onChange={(e) => set("employee_number", e.target.value)} required /></Field>
            <Field label="الهوية الوطنية"><Input value={form.national_id} onChange={(e) => set("national_id", e.target.value)} /></Field>
            <Field label="الجنسية"><Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} /></Field>
            <Field label="الجنس">
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="تاريخ الميلاد"><Input type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} /></Field>
            <Field label="رقم الجوال"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="الإدارة"><Input value={form.department} onChange={(e) => set("department", e.target.value)} required /></Field>
            <Field label="المسمى الوظيفي"><Input value={form.position} onChange={(e) => set("position", e.target.value)} required /></Field>
            <Field label="الدرجة الوظيفية"><Input value={form.job_grade} onChange={(e) => set("job_grade", e.target.value)} /></Field>
            <Field label="تاريخ التعيين"><Input type="date" value={form.hire_date} onChange={(e) => set("hire_date", e.target.value)} required /></Field>
            <Field label="نوع العقد">
              <Select value={form.contract_type} onValueChange={(v) => set("contract_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">دوام كامل</SelectItem>
                  <SelectItem value="part_time">دوام جزئي</SelectItem>
                  <SelectItem value="contract">عقد</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="الحالة الوظيفية">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">على رأس العمل</SelectItem>
                  <SelectItem value="on_leave">في إجازة</SelectItem>
                  <SelectItem value="terminated">منهي</SelectItem>
                  <SelectItem value="resigned">مستقيل</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="الراتب الأساسي (ريال)"><Input type="number" value={form.base_salary} onChange={(e) => set("base_salary", e.target.value)} required /></Field>
            <Field label="بدل السكن"><Input type="number" value={form.housing_allowance} onChange={(e) => set("housing_allowance", e.target.value)} /></Field>
            <Field label="بدل المواصلات"><Input type="number" value={form.transport_allowance} onChange={(e) => set("transport_allowance", e.target.value)} /></Field>
            <Field label="بدلات أخرى"><Input type="number" value={form.other_allowances} onChange={(e) => set("other_allowances", e.target.value)} /></Field>
          </div>
          <Field label="العنوان"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="جهة اتصال الطوارئ"><Input value={form.emergency_contact} onChange={(e) => set("emergency_contact", e.target.value)} /></Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin ml-2" />}
              حفظ
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