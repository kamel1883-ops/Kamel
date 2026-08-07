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

const empty = {
  employee_id: "", trip_type: "internal", destination: "", purpose: "",
  start_date: "", end_date: "", transport_mode: "car",
  transport_cost: 0, accommodation_cost: 0, per_diem: 0,
  other_costs: 0, advance_amount: 0, notes: ""
};

export default function BusinessTripForm({ open, onClose, onSaved, employees, editing, currentUserEmployee }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setForm(editing ? { ...empty, ...editing } : { ...empty, employee_id: currentUserEmployee?.id || employees?.[0]?.id || "" });
      setErr("");
    }
  }, [open, editing, employees]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const days = form.start_date && form.end_date
    ? differenceInDays(parseISO(form.end_date), parseISO(form.start_date)) + 1 : 0;
  const perDiemTotal = (Number(form.per_diem) || 0) * (days > 0 ? days : 0);
  const total = (Number(form.transport_cost) || 0) + (Number(form.accommodation_cost) || 0)
    + perDiemTotal + (Number(form.other_costs) || 0);
  const emp = employees?.find((x) => x.id === form.employee_id);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.employee_id) { setErr("اختر الموظف"); return; }
    if (days <= 0) { setErr("تحقق من تواريخ الرحلة"); return; }
    setSaving(true); setErr("");
    try {
      const payload = {
        ...form,
        employee_name: emp ? `${emp.employee_number} - ${emp.position}` : "",
        employee_user_id: emp?.user_id || currentUserEmployee?.user_id || "",
        transport_cost: Number(form.transport_cost) || 0,
        accommodation_cost: Number(form.accommodation_cost) || 0,
        per_diem: Number(form.per_diem) || 0,
        other_costs: Number(form.other_costs) || 0,
        advance_amount: Number(form.advance_amount) || 0,
        days_count: days,
        per_diem_total: perDiemTotal,
        total_cost: total,
      };
      if (editing) await base44.entities.BusinessTrip.update(editing.id, payload);
      else await base44.entities.BusinessTrip.create({ ...payload, status: editing ? editing.status : "pending" });
      onSaved?.();
      onClose?.();
    } catch (error) {
      setErr(error?.message || "تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل رحلة العمل" : "رحلة عمل / انتداب جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">الموظف</Label>
              <Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)} disabled={!!currentUserEmployee || !!editing}>
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
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">نوع الرحلة</Label>
              <Select value={form.trip_type} onValueChange={(v) => set("trip_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">داخلية</SelectItem>
                  <SelectItem value="external">خارجية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">الوجهة</Label>
              <Input value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="المدينة / الدولة" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">وسيلة التنقل</Label>
              <Select value={form.transport_mode} onValueChange={(v) => set("transport_mode", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plane">طيران</SelectItem>
                  <SelectItem value="car">سيارة</SelectItem>
                  <SelectItem value="bus">حافلة</SelectItem>
                  <SelectItem value="train">قطار</SelectItem>
                  <SelectItem value="none">بدون</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">عدد الأيام</Label>
              <Input value={days > 0 ? days : ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">بدل الانتداب اليومي</Label>
              <Input type="number" min="0" value={form.per_diem} onChange={(e) => set("per_diem", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">تكلفة التنقل</Label>
              <Input type="number" min="0" value={form.transport_cost} onChange={(e) => set("transport_cost", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">تكلفة الإقامة</Label>
              <Input type="number" min="0" value={form.accommodation_cost} onChange={(e) => set("accommodation_cost", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">تكاليف أخرى</Label>
              <Input type="number" min="0" value={form.other_costs} onChange={(e) => set("other_costs", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">سلفة على الحساب</Label>
              <Input type="number" min="0" value={form.advance_amount} onChange={(e) => set("advance_amount", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground">الغرض من الرحلة</Label>
              <Input value={form.purpose} onChange={(e) => set("purpose", e.target.value)} placeholder="مهمة الرحلة" />
            </div>
          </div>

          <div className="rounded-xl bg-muted/60 p-4 flex flex-wrap justify-between gap-3 text-sm">
            <span className="text-muted-foreground">إجمالي بدل الانتداب: <b className="text-foreground">{perDiemTotal.toLocaleString()}</b></span>
            <span className="text-muted-foreground">إجمالي التكلفة: <b className="text-foreground">{total.toLocaleString()}</b></span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">ملاحظات</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
          </div>

          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">{err}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
            <Button type="submit" disabled={saving || days <= 0}>
              {saving && <Loader2 size={16} className="animate-spin ml-2" />}
              {editing ? "حفظ التعديلات" : "إنشاء الرحلة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}