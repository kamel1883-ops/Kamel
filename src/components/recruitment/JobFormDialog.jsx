import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";

export default function JobFormDialog({ open, onOpenChange, onSaved, job }) {
  const { toast } = useToast();
  const isEdit = !!job;
  const empty = { title: "", profession: "", job_type: "full_time", grade: "", salary: 0, nationality_req: "any", qualifications: "", tasks: "", vacancy_count: 1, department: "", status: "open", description: "" };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { if (job) setForm({ ...empty, ...job }); else setForm(empty); }, [job, open]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.title) { toast({ title: "أدخل المسمى الوظيفي أولاً", variant: "destructive" }); return; }
    setGenerating(true);
    try {
      const prompt = `أنت خبير موارد بشرية. اكتب وصفاً وظيفياً كاملاً واحترافياً باللغة العربية للوظيفة التالية:\nالمسمى: ${form.title}\nالمهنة: ${form.profession}\nالدرجة: ${form.grade}\nنوع الوظيفة: ${form.job_type}\nالراتب: ${form.salary}\nالمطلوب: ${form.nationality_req}\nالمؤهلات: ${form.qualifications}\nالمهام: ${form.tasks}\nيتضمن: ملخص الوظيفة، المسؤوليات والمهام التفصيلية، المؤهلات والمهارات المطلوبة، الشروط والضوابط.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      set("description", typeof res === "string" ? res : JSON.stringify(res));
      toast({ title: "تم توليد الوصف الوظيفي" });
    } catch (e) { toast({ title: "تعذر التوليد", description: e.message, variant: "destructive" }); }
    finally { setGenerating(false); }
  };

  const save = async () => {
    if (!form.title) { toast({ title: "يرجى إدخال المسمى الوظيفي", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, salary: Number(form.salary) || 0, vacancy_count: Number(form.vacancy_count) || 1 };
      if (isEdit) await base44.entities.Job.update(job.id, payload);
      else await base44.entities.Job.create(payload);
      toast({ title: isEdit ? "تم تحديث الوظيفة" : "تم إنشاء الوظيفة" });
      onSaved?.();
      onOpenChange(false);
    } catch (e) { toast({ title: "تعذر الحفظ", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "تعديل وظيفة" : "وظيفة جديدة"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div><Label>المسمى الوظيفي *</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>المهنة</Label><Input value={form.profession} onChange={(e) => set("profession", e.target.value)} /></div>
            <div><Label>الدرجة الوظيفية</Label><Input value={form.grade} onChange={(e) => set("grade", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>نوع الوظيفة</Label>
              <Select value={form.job_type} onValueChange={(v) => set("job_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">دوام كامل</SelectItem>
                  <SelectItem value="part_time">دوام جزئي</SelectItem>
                  <SelectItem value="contract">عقد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>المطلوب</Label>
              <Select value={form.nationality_req} onValueChange={(v) => set("nationality_req", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">الجميع</SelectItem>
                  <SelectItem value="saudi">سعودي</SelectItem>
                  <SelectItem value="resident">مقيم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>الراتب (ريال)</Label><Input type="number" value={form.salary} onChange={(e) => set("salary", e.target.value)} /></div>
            <div><Label>عدد الشواغر</Label><Input type="number" value={form.vacancy_count} onChange={(e) => set("vacancy_count", e.target.value)} /></div>
            <div><Label>الإدارة</Label><Input value={form.department} onChange={(e) => set("department", e.target.value)} /></div>
          </div>
          <div><Label>المؤهلات المطلوبة</Label><Textarea rows={2} value={form.qualifications} onChange={(e) => set("qualifications", e.target.value)} /></div>
          <div><Label>المهام والمسؤوليات</Label><Textarea rows={2} value={form.tasks} onChange={(e) => set("tasks", e.target.value)} /></div>
          <div className="flex items-center justify-between">
            <Label>الوصف الوظيفي (Job Description)</Label>
            <Button size="sm" variant="outline" onClick={generate} disabled={generating}><Sparkles size={14} />{generating ? "توليد..." : "توليد بالذكاء الاصطناعي"}</Button>
          </div>
          <Textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="الوصف الوظيفي — يمكنك توليده تلقائياً أو كتابته يدوياً" />
          <div><Label>الحالة</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="open">شاغرة</SelectItem><SelectItem value="closed">مغلقة</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={save} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}