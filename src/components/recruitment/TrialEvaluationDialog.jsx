import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function TrialEvaluationDialog({ open, onOpenChange, onSaved, applicant, job }) {
  const { toast } = useToast();
  const empty = {
    job_id: "", job_title: "", applicant_id: "", employee_name: "", department: "",
    evaluation_date: new Date().toISOString().slice(0, 10),
    performance_rating: 3, punctuality_rating: 3, adaptability_rating: 3,
    strengths: "", improvements: "", recommendation: "confirm", status: "completed", notes: "",
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    if (applicant) {
      setForm((f) => ({ ...f, job_id: job?.id || "", job_title: job?.title || "", applicant_id: applicant.id, employee_name: applicant.full_name, department: job?.department || "" }));
      base44.entities.TrialEvaluation.filter({ applicant_id: applicant.id }, "-created_date", 1)
        .then((r) => { if (r && r.length) { setExisting(r[0]); setForm((f) => ({ ...f, ...r[0] })); } else setExisting(null); })
        .catch(() => setExisting(null));
    }
  }, [applicant?.id, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const overall = Math.round(((Number(form.performance_rating) + Number(form.punctuality_rating) + Number(form.adaptability_rating)) / 3) * 10) / 10;
      const payload = { ...form, performance_rating: Number(form.performance_rating), punctuality_rating: Number(form.punctuality_rating), adaptability_rating: Number(form.adaptability_rating), overall_rating: overall };
      if (existing) await base44.entities.TrialEvaluation.update(existing.id, payload);
      else await base44.entities.TrialEvaluation.create(payload);
      toast({ title: "تم حفظ التقييم" });
      onSaved?.();
      onOpenChange(false);
    } catch (e) { toast({ title: "تعذر الحفظ", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>تقييم التجربة — {applicant?.full_name}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div><Label>اسم الموظف</Label><Input value={form.employee_name} onChange={(e) => set("employee_name", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>تاريخ التقييم</Label><Input type="date" value={form.evaluation_date} onChange={(e) => set("evaluation_date", e.target.value)} /></div>
            <div><Label>التوصية</Label>
              <Select value={form.recommendation} onValueChange={(v) => set("recommendation", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirm">تثبيت التعيين</SelectItem>
                  <SelectItem value="extend">تمديد فترة التجربة</SelectItem>
                  <SelectItem value="terminate">إنهاء التعيين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>الأداء (1-5)</Label><Input type="number" min="1" max="5" value={form.performance_rating} onChange={(e) => set("performance_rating", e.target.value)} /></div>
            <div><Label>الالتزام (1-5)</Label><Input type="number" min="1" max="5" value={form.punctuality_rating} onChange={(e) => set("punctuality_rating", e.target.value)} /></div>
            <div><Label>التكيّف (1-5)</Label><Input type="number" min="1" max="5" value={form.adaptability_rating} onChange={(e) => set("adaptability_rating", e.target.value)} /></div>
          </div>
          <div><Label>نقاط القوة</Label><Textarea rows={2} value={form.strengths} onChange={(e) => set("strengths", e.target.value)} /></div>
          <div><Label>فرص التحسين</Label><Textarea rows={2} value={form.improvements} onChange={(e) => set("improvements", e.target.value)} /></div>
          <div><Label>ملاحظات</Label><Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={save} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ التقييم"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}