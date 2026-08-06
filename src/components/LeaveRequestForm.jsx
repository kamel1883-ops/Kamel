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
    start_date: "", end_date: "", reason: "", is_full_clearance: false,
  });
  const [medicalFile, setMedicalFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        employee_id: currentUserEmployee?.id || employees?.[0]?.id || "",
        leave_type: "annual", start_date: "", end_date: "", reason: "", is_full_clearance: false,
      });
      setMedicalFile(null);
      setErr("");
    }
  }, [open, currentUserEmployee, employees]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isSick = form.leave_type === "sick";

  const days = form.start_date && form.end_date
    ? differenceInDays(parseISO(form.end_date), parseISO(form.start_date)) + 1 : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (days <= 0) return;
    if (isSick && !medicalFile) {
      setErr("إرفاق التقرير الطبي إلزامي للإجازة المرضية.");
      return;
    }
    setErr("");
    setSaving(true);
    try {
      const emp = employees?.find((x) => x.id === form.employee_id);
      let medical_url = "";
      if (isSick && medicalFile) {
        const up = await base44.integrations.Core.UploadFile({ file: medicalFile });
        medical_url = up.file_url;
      }
      await base44.entities.LeaveRequest.create({
        ...form,
        employee_user_id: emp?.user_id || "",
        employee_name: emp ? `${emp.employee_number} - ${emp.position}` : "",
        days_count: days,
        is_full_clearance: form.is_full_clearance,
        medical_report_url: medical_url,
        status: "pending_manager",
        manager_status: "pending",
        hr_status: "pending",
        finance_status: "pending",
      });
      onSaved?.();
      onClose?.();
    } catch (error) {
      setErr(error?.message || "تعذر تقديم الطلب");
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

          {isSick && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                التقرير الطبي <span className="text-rose-500">*</span>
                <span className="text-rose-500 text-xs mr-1">(إلزامي)</span>
              </Label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setMedicalFile(e.target.files?.[0] || null)}
                required
              />
              <p className="text-xs text-muted-foreground">يجب إرفاق صورة من التقرير الطبي للإجازة المرضية.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">السبب</Label>
            <Textarea value={form.reason} onChange={(e) => set("reason", e.target.value)} rows={3} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_full_clearance}
              onChange={(e) => set("is_full_clearance", e.target.checked)}
              className="w-4 h-4"
            />
            إجازة كاملة (تصفية + تذاكر) — تتطلب تصفية مالية ودفع تعويض التذكرة
          </label>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">{err}</div>}
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