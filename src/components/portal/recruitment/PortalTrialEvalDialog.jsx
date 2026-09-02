import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const RATINGS = [
  ["competence_rating", "الكفاءة", "Competence"],
  ["behavior_rating", "السلوك", "Behavior"],
  ["knowledge_rating", "المعرفة", "Knowledge"],
  ["professional_field_rating", "المجال المهني", "Professional field"],
  ["experience_rating", "الخبرة", "Experience"],
];

// تقييم فترة التجربة (٩٠ يوماً) للمعيّن — بوابة الموظف المُفوّض بالتوظيف
export default function PortalTrialEvalDialog({ open, onOpenChange, applicant, existing, onSave, isAr = true }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!open) return;
    setForm({
      evaluation_date: existing?.evaluation_date || new Date().toISOString().slice(0, 10),
      competence_rating: existing?.competence_rating || 0,
      behavior_rating: existing?.behavior_rating || 0,
      knowledge_rating: existing?.knowledge_rating || 0,
      professional_field_rating: existing?.professional_field_rating || 0,
      experience_rating: existing?.experience_rating || 0,
      strengths: existing?.strengths || "", improvements: existing?.improvements || "",
      recommendation: existing?.recommendation || "confirm", notes: existing?.notes || "",
    });
  }, [open, existing]);

  const t = isAr ? {
    title: "تقييم فترة التجربة", date: "تاريخ التقييم", strengths: "نقاط القوة", improve: "فرص التحسين",
    rec: "التوصية", confirm: "تثبيت — موظف ثابت", dismiss: "إنهاء خلال التجربة (مادة 53)", extend: "تمديد فترة التجربة",
    notes: "ملاحظات", cancel: "إلغاء", save: "حفظ التقييم",
  } : {
    title: "Probation evaluation", date: "Evaluation date", strengths: "Strengths", improve: "Improvements",
    rec: "Recommendation", confirm: "Confirm — permanent", dismiss: "Dismiss during probation (Art. 53)", extend: "Extend probation",
    notes: "Notes", cancel: "Cancel", save: "Save evaluation",
  };

  const submit = async () => {
    setSaving(true);
    try {
      await onSave({
        ...form,
        applicant_id: applicant?.id, job_id: applicant?.job_id, job_title: applicant?.job_title,
        employee_name: applicant?.full_name,
      }, existing?.id || "");
      onOpenChange(false);
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader><DialogTitle>{t.title} — {applicant?.full_name}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">{t.date}</Label><Input type="date" value={form.evaluation_date || ""} onChange={(e) => set("evaluation_date", e.target.value)} /></div>
          {RATINGS.map(([k, ar, en]) => (
            <div key={k}>
              <Label className="text-xs">{isAr ? ar : en} (1-5)</Label>
              <Input type="number" min="0" max="5" value={form[k] ?? 0} onChange={(e) => set(k, e.target.value)} />
            </div>
          ))}
          <div><Label className="text-xs">{t.rec}</Label>
            <Select value={form.recommendation || "confirm"} onValueChange={(v) => set("recommendation", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="confirm">{t.confirm}</SelectItem>
                <SelectItem value="dismiss_probation">{t.dismiss}</SelectItem>
                <SelectItem value="extend">{t.extend}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label className="text-xs">{t.strengths}</Label><Textarea rows={2} value={form.strengths || ""} onChange={(e) => set("strengths", e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">{t.improve}</Label><Textarea rows={2} value={form.improvements || ""} onChange={(e) => set("improvements", e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">{t.notes}</Label><Textarea rows={2} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
          <Button onClick={submit} disabled={saving}>{saving && <Loader2 size={14} className="animate-spin" />}{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}