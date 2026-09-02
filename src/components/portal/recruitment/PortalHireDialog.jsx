import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// إكمال توظيف المتقدم: تُستكمل بياناته الوظيفية ثم يُنشأ سجل موظف فعلي
export default function PortalHireDialog({ open, onOpenChange, applicant, job, onHire, isAr = true }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!open) return;
    setForm({
      employee_number: "", national_id: "", is_saudi: false,
      department: job?.department || "", position: job?.title || applicant?.job_title || "",
      hire_date: new Date().toISOString().slice(0, 10),
      base_salary: job?.salary || "", housing_allowance: 0, transport_allowance: 0, other_allowances: 0,
      salary_payment_method: "mudad",
    });
  }, [open, job, applicant]);

  const t = isAr ? {
    title: "إكمال التوظيف", num: "الرقم الوظيفي (تلقائي إن تُرك فارغاً)", nid: "الهوية/الإقامة",
    saudi: "الجنسية", isSaudi: "سعودي", nonSaudi: "مقيم", dept: "الإدارة *", pos: "المسمى الوظيفي *",
    date: "تاريخ المباشرة *", base: "الراتب الأساسي *", housing: "بدل السكن", transport: "بدل المواصلات",
    other: "بدلات أخرى", method: "طريقة الصرف", mudad: "مدد", cash: "كاش",
    cancel: "إلغاء", ok: "تعيين وإنشاء ملف الموظف",
    note: "سيُنشأ سجل موظف كامل منسوب إليك، وتُغلق الوظيفة تلقائياً.",
  } : {
    title: "Complete hiring", num: "Employee number (auto if empty)", nid: "National ID",
    saudi: "Nationality", isSaudi: "Saudi", nonSaudi: "Resident", dept: "Department *", pos: "Position *",
    date: "Hire date *", base: "Base salary *", housing: "Housing", transport: "Transport",
    other: "Other allowances", method: "Payment method", mudad: "Mudad", cash: "Cash",
    cancel: "Cancel", ok: "Hire & create employee",
    note: "A full employee record will be created attributed to you, and the job closed.",
  };

  const submit = async () => {
    if (!form.department || !form.position || !form.hire_date) return;
    setSaving(true);
    try { await onHire(applicant, form); onOpenChange(false); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader><DialogTitle>{t.title} — {applicant?.full_name}</DialogTitle></DialogHeader>
        <div className="text-[11px] rounded-lg bg-violet-50 border border-violet-200 text-violet-800 px-3 py-1.5">{t.note}</div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">{t.num}</Label><Input value={form.employee_number || ""} onChange={(e) => set("employee_number", e.target.value)} /></div>
          <div><Label className="text-xs">{t.nid}</Label><Input value={form.national_id || ""} onChange={(e) => set("national_id", e.target.value)} /></div>
          <div><Label className="text-xs">{t.saudi}</Label>
            <Select value={form.is_saudi ? "yes" : "no"} onValueChange={(v) => set("is_saudi", v === "yes")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="yes">{t.isSaudi}</SelectItem><SelectItem value="no">{t.nonSaudi}</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">{t.method}</Label>
            <Select value={form.salary_payment_method || "mudad"} onValueChange={(v) => set("salary_payment_method", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="mudad">{t.mudad}</SelectItem><SelectItem value="cash">{t.cash}</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">{t.dept}</Label><Input value={form.department || ""} onChange={(e) => set("department", e.target.value)} /></div>
          <div><Label className="text-xs">{t.pos}</Label><Input value={form.position || ""} onChange={(e) => set("position", e.target.value)} /></div>
          <div><Label className="text-xs">{t.date}</Label><Input type="date" value={form.hire_date || ""} onChange={(e) => set("hire_date", e.target.value)} /></div>
          <div><Label className="text-xs">{t.base}</Label><Input type="number" value={form.base_salary || ""} onChange={(e) => set("base_salary", e.target.value)} /></div>
          <div><Label className="text-xs">{t.housing}</Label><Input type="number" value={form.housing_allowance || 0} onChange={(e) => set("housing_allowance", e.target.value)} /></div>
          <div><Label className="text-xs">{t.transport}</Label><Input type="number" value={form.transport_allowance || 0} onChange={(e) => set("transport_allowance", e.target.value)} /></div>
          <div><Label className="text-xs">{t.other}</Label><Input type="number" value={form.other_allowances || 0} onChange={(e) => set("other_allowances", e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
          <Button onClick={submit} disabled={saving}>{saving && <Loader2 size={14} className="animate-spin" />}{t.ok}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}