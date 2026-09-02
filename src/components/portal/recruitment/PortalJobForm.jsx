import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const EMPTY = {
  title: "", profession: "", job_type: "full_time", grade: "", salary: "",
  nationality_req: "any", qualifications: "", tasks: "", description: "",
  vacancy_count: 1, department: "", status: "open",
};

// نموذج إنشاء/تعديل وظيفة شاغرة — بوابة الموظف المُفوّض بالتوظيف
export default function PortalJobForm({ open, onOpenChange, job, onSave, isAr = true }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) setForm(job ? { ...EMPTY, ...job } : EMPTY);
  }, [open, job]);

  const t = isAr ? {
    newT: "وظيفة جديدة", editT: "تعديل الوظيفة", title: "المسمى الوظيفي *", prof: "المهنة",
    type: "نوع الوظيفة", full: "دوام كامل", part: "دوام جزئي", contract: "عقد محدد",
    grade: "الدرجة الوظيفية", salary: "الراتب (ريال)", req: "المطلوب", any: "الجميع", saudi: "سعودي", res: "مقيم",
    vac: "عدد الشواغر", dept: "الإدارة", status: "الحالة", open: "شاغرة — معلنة", closed: "مغلقة",
    quals: "المؤهلات المطلوبة", tasks: "المهام والمسؤوليات", desc: "الوصف الوظيفي",
    cancel: "إلغاء", save: "حفظ ونشر",
  } : {
    newT: "New job", editT: "Edit job", title: "Job title *", prof: "Profession",
    type: "Type", full: "Full-time", part: "Part-time", contract: "Contract",
    grade: "Grade", salary: "Salary (SAR)", req: "Requirement", any: "Any", saudi: "Saudi", res: "Resident",
    vac: "Vacancies", dept: "Department", status: "Status", open: "Open — published", closed: "Closed",
    quals: "Qualifications", tasks: "Tasks & responsibilities", desc: "Job description",
    cancel: "Cancel", save: "Save & publish",
  };

  const submit = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await onSave(form, job?.id || "");
      onOpenChange(false);
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader><DialogTitle>{job ? t.editT : t.newT}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">{t.title}</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div><Label className="text-xs">{t.prof}</Label><Input value={form.profession} onChange={(e) => set("profession", e.target.value)} /></div>
          <div><Label className="text-xs">{t.dept}</Label><Input value={form.department} onChange={(e) => set("department", e.target.value)} /></div>
          <div><Label className="text-xs">{t.type}</Label>
            <Select value={form.job_type} onValueChange={(v) => set("job_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">{t.full}</SelectItem>
                <SelectItem value="part_time">{t.part}</SelectItem>
                <SelectItem value="contract">{t.contract}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">{t.req}</Label>
            <Select value={form.nationality_req} onValueChange={(v) => set("nationality_req", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t.any}</SelectItem>
                <SelectItem value="saudi">{t.saudi}</SelectItem>
                <SelectItem value="resident">{t.res}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">{t.grade}</Label><Input value={form.grade} onChange={(e) => set("grade", e.target.value)} /></div>
          <div><Label className="text-xs">{t.salary}</Label><Input type="number" value={form.salary} onChange={(e) => set("salary", e.target.value)} /></div>
          <div><Label className="text-xs">{t.vac}</Label><Input type="number" value={form.vacancy_count} onChange={(e) => set("vacancy_count", e.target.value)} /></div>
          <div><Label className="text-xs">{t.status}</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">{t.open}</SelectItem>
                <SelectItem value="closed">{t.closed}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label className="text-xs">{t.quals}</Label><Textarea rows={2} value={form.qualifications} onChange={(e) => set("qualifications", e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">{t.tasks}</Label><Textarea rows={3} value={form.tasks} onChange={(e) => set("tasks", e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">{t.desc}</Label><Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
          <Button onClick={submit} disabled={saving || !form.title}>{saving && <Loader2 size={14} className="animate-spin" />}{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}