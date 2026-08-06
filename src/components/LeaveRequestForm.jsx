import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
import { Loader2 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export default function LeaveRequestForm({ open, onClose, onSaved, employees, currentUserEmployee }) {
  const [form, setForm] = useState({
    employee_id: "", leave_type: "annual",
    start_date: "", end_date: "", reason: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        employee_id: currentUserEmployee?.id || employees?.[0]?.id || "",
        leave_type: "annual", start_date: "", end_date: "", reason: "",
      });
    }
  }, [open, currentUserEmployee, employees]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const days = form.start_date && form.end_date
    ? differenceInDays(parseISO(form.end_date), parseISO(form.start_date)) + 1 : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (days <= 0) return;
    setSaving(true);
    try {
      const emp = employees?.find((x) => x.id === form.employee_id);
      await base44.entities.LeaveRequest.create({
        ...form,
        employee_name: emp ? `${emp.employee_number} - ${emp.position}` : "",
        days_count: days,
        status: "pending",
      });
      onSaved?.();
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>طلب إجازة جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">الموظف</Label>
            <Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)} disabled={!!currentUserEmployee}>
              <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
              <SelectContent>
                {(employees || []).map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.employee_number} - {emp.position} - {emp.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">نوع الإجازة</Label>
              <Select value={form.leave_type} onValueChange={(v) => set("leave_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">إجازة سنوية</SelectItem>
                  <SelectItem value="sick">إجازة مرضية</SelectItem>
                  <SelectItem value="emergency">إجازة طارئة</SelectItem>
                  <SelectItem value="unpaid">إجازة بدون راتب</SelectItem>
                  <SelectItem value="maternity">إجازة أمومة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">عدد الأيام</Label>
              <Input value={days > 0 ? days : ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">تاريخ البداية</Label>
              <Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">تاريخ النهاية</Label>
              <Input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">السبب</Label>
            <Textarea value={form.reason} onChange={(e) => set("reason", e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
            <Button type="submit" disabled={saving || days <= 0}>
              {saving && <Loader2 size={16} className="animate-spin ml-2" />}
              تقديم الطلب
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}