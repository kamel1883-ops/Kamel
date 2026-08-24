import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useI18n } from "@/lib/i18n";
import { Loader2, Check, AlertTriangle, FileX2, BadgeCheck } from "lucide-react";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function TrialEvaluationDialog({ open, onOpenChange, onSaved, applicant, job }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const CRITERIA = isAr
    ? [
        { key: "competence_rating", label: "الكفاءة" },
        { key: "behavior_rating", label: "السلوك" },
        { key: "knowledge_rating", label: "المعرفة" },
        { key: "professional_field_rating", label: "المجال المهني" },
        { key: "experience_rating", label: "الخبرة" },
      ]
    : [
        { key: "competence_rating", label: "Competence" },
        { key: "behavior_rating", label: "Behavior" },
        { key: "knowledge_rating", label: "Knowledge" },
        { key: "professional_field_rating", label: "Professional field" },
        { key: "experience_rating", label: "Experience" },
      ];
  const t = isAr ? {
    title: (n) => `تقييم فترة التجربة — ${n}`,
    empName: "اسم الموظف", evalDate: "تاريخ التقييم",
    strengths: "نقاط القوة", improvements: "فرص التحسين",
    rec: "التوصية",
    confirm: "تثبيت الموظف (اجتاز فترة التجربة — إيجابي)",
    extend: "تمديد فترة التجربة",
    dismiss: "استبعاد الموظف (سلبي) — فسخ العلاقة بموجب المادة 53",
    dismissNote: "وفقاً للمادة 53: يجوز إنهاء العقد خلال فترة التجربة دون إخطار أو تعويض، مع دفع أجر العامل عن المدة المقضاة. بعد حفظ التقييم اضغط زر «تنفيذ الفسخ»، ثم انتقل لقسم نهاية الخدمة لتصفية مستحقاته (لا مكافأة لأنه لم يكمل سنة، ويُحسب رصيد إجازاته تناسبياً حسب الأشهر المعمولة).",
    notes: "ملاحظات",
    confirmed: "تم تثبيت الموظف كموظف ثابت وأُرسل إشعار للمسؤول باستكمال ملفه.",
    exec: "تنفيذ قرار الاستبعاد (مادة 53)",
    execHint: "اضغط لفسخ العلاقة التعاقدية وإنهاء الموظف، ثم ستنتقل تلقائياً لقسم نهاية الخدمة لاختيار الموظف واحتساب مستحقاته.",
    execBtn: "تنفيذ الفسخ بموجب المادة 53 ونقل لاحتساب نهاية الخدمة",
    notifConfirmTitle: "تثبيت موظف (اجتياز فترة التجربة)",
    notifConfirmBody: (n) => `تم تثبيت ${n} كموظف ثابت. الرجاء استكمال كافة بيانات ملفه لاعتماده ضمن كادر المنشأة.`,
    saved: "تم حفظ التقييم وتثبيت الموظف", savedDesc: "أُرسل إشعار للمسؤول باستكمال ملف الموظف",
    savedOnly: "تم حفظ التقييم", savedDismiss: "تم حفظ التقييم", savedDismissDesc: "نفّذ الفسخ بموجب المادة 53 ثم انتقل لاحتساب نهاية الخدمة",
    notifDismissTitle: "فسخ العلاقة التعاقدية (مادة 53)",
    notifDismissBody: (n) => `تم إنهاء ${n} أثناء فترة التجربة بموجب المادة 53. الرجاء مراجعة قسم نهاية الخدمة لاحتساب وتصفية مستحقاته.`,
    dismissFail: "تعذّر الفسخ", dismissFailDesc: "لم يُعثر على سجل الموظف المرتبط — تأكد أن التعيين أنشأ ملف الموظف",
    dismissAsk: (n) => `تنفيذ فسخ العلاقة التعاقدية مع ${n} بموجب المادة 53؟ سيتم إنهاء الموظف ونقلك لقسم نهاية الخدمة لاحتساب مستحقاته (لا مكافأة لأنه لم يكمل سنة، مع تصفية رصيد الإجازات وفقاً للأشهر المعمولة).`,
    dismissedOk: "تم الفسخ وإنهاء الموظف", dismissedOkDesc: "جارٍ الانتقال لقسم نهاية الخدمة",
    dismissFail2: "تعذّر تنفيذ الفسخ", saveFail: "تعذر الحفظ",
    cancel: "إلغاء", save: "حفظ التقييم", saving: "جارٍ الحفظ...",
  } : {
    title: (n) => `Trial evaluation — ${n}`,
    empName: "Employee name", evalDate: "Evaluation date",
    strengths: "Strengths", improvements: "Improvement areas",
    rec: "Recommendation",
    confirm: "Confirm employee (passed trial — positive)",
    extend: "Extend trial period",
    dismiss: "Dismiss (negative) — terminate the contract under Article 53",
    dismissNote: "Per Article 53: the contract may be terminated during the trial without notice or compensation, with the worker paid for the time served. After saving the evaluation, press \"Execute termination\", then go to End of Service to settle dues (no EOS award as the year was not completed; leave balance is prorated by months served).",
    notes: "Notes",
    confirmed: "The employee has been confirmed as permanent and an admin notification was sent to complete their file.",
    exec: "Execute dismissal (Article 53)",
    execHint: "Press to terminate the contract and the employee, then you will be redirected to End of Service to pick the employee and settle dues.",
    execBtn: "Execute termination under Article 53 and continue to EOS",
    notifConfirmTitle: "Employee confirmed (trial passed)",
    notifConfirmBody: (n) => `${n} has been confirmed as a permanent employee. Please complete their file to confirm them in the establishment's roster.`,
    saved: "Evaluation saved and employee confirmed", savedDesc: "An admin notification was sent to complete the employee file",
    savedOnly: "Evaluation saved", savedDismiss: "Evaluation saved", savedDismissDesc: "Execute the dismissal under Article 53 then continue to End of Service",
    notifDismissTitle: "Contract terminated (Article 53)",
    notifDismissBody: (n) => `${n} was terminated during the trial period under Article 53. Please review the End of Service section to compute and settle dues.`,
    dismissFail: "Termination failed", dismissFailDesc: "The linked employee record was not found — make sure the hire created the employee file",
    dismissAsk: (n) => `Terminate the contract with ${n} under Article 53? The employee will be terminated and you will be redirected to End of Service to settle dues (no EOS award as the year was not completed; leave balance prorated by months served).`,
    dismissedOk: "Terminated and employee ended", dismissedOkDesc: "Redirecting to End of Service",
    dismissFail2: "Termination failed", saveFail: "Save failed",
    cancel: "Cancel", save: "Save evaluation", saving: "Saving...",
  };
  const empty = {
    job_id: "", job_title: "", applicant_id: "", employee_name: "", department: "",
    evaluation_date: todayISO(),
    competence_rating: 3, behavior_rating: 3, knowledge_rating: 3, professional_field_rating: 3, experience_rating: 3,
    overall_rating: 3, strengths: "", improvements: "", recommendation: "confirm", status: "completed", notes: "",
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(null);
  const [pendingTerminate, setPendingTerminate] = useState(false);
  const [doneConfirm, setDoneConfirm] = useState(false);

  useEffect(() => {
    if (applicant) {
      setPendingTerminate(false);
      setDoneConfirm(false);
      setForm((f) => ({ ...f, job_id: job?.id || "", job_title: job?.title || "", applicant_id: applicant.id, employee_name: applicant.full_name, department: job?.department || "" }));
      base44.entities.TrialEvaluation.filter({ applicant_id: applicant.id }, "-created_date", 1)
        .then((r) => {
          if (r && r.length) {
            setExisting(r[0]);
            setForm({ ...empty, ...r[0] });
            if (r[0].recommendation === "confirm") setDoneConfirm(true);
            if (r[0].recommendation === "dismiss_probation" && !r[0]._terminated) setPendingTerminate(true);
          } else setExisting(null);
        })
        .catch(() => setExisting(null));
    }
  }, [applicant?.id, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const vals = CRITERIA.map((c) => Number(form[c.key]) || 0);
      const overall = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
      const payload = {
        ...form,
        competence_rating: Number(form.competence_rating),
        behavior_rating: Number(form.behavior_rating),
        knowledge_rating: Number(form.knowledge_rating),
        professional_field_rating: Number(form.professional_field_rating),
        experience_rating: Number(form.experience_rating),
        overall_rating: overall,
      };
      if (existing) await base44.entities.TrialEvaluation.update(existing.id, payload);
      else await base44.entities.TrialEvaluation.create(payload);

      if (form.recommendation === "confirm") {
        await base44.entities.Notification.create({
          title: t.notifConfirmTitle,
          body: t.notifConfirmBody(applicant?.full_name || ""),
          type: "confirmed", link: "/employees", is_read: false,
        });
        setDoneConfirm(true);
        toast({ title: t.saved, description: t.savedDesc });
      } else if (form.recommendation === "dismiss_probation") {
        setPendingTerminate(true);
        toast({ title: t.savedDismiss, description: t.savedDismissDesc });
      } else {
        toast({ title: t.savedOnly });
      }
      onSaved?.();
    } catch (e) { toast({ title: t.saveFail, description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const terminate = async () => {
    if (!applicant?.hired_employee_id) {
      toast({ title: t.dismissFail, description: t.dismissFailDesc, variant: "destructive" });
      return;
    }
    const ok = confirm(t.dismissAsk(applicant?.full_name || ""));
    if (!ok) return;
    setSaving(true);
    try {
      const today = todayISO();
      await base44.entities.Employee.update(applicant.hired_employee_id, {
        status: "terminated",
        termination_reason: "employer_termination",
        termination_date: today,
      });
      await base44.entities.Notification.create({
        title: t.notifDismissTitle,
        body: t.notifDismissBody(applicant?.full_name || ""),
        type: "dismissed", link: "/end-of-service", is_read: false,
      });
      toast({ title: t.dismissedOk, description: t.dismissedOkDesc });
      onSaved?.();
      onOpenChange(false);
      navigate(`/end-of-service?emp=${applicant.hired_employee_id}&reason=probation_dismissal&lwd=${today}`);
    } catch (e) { toast({ title: t.dismissFail2, description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t.title(applicant?.full_name || "")}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t.empName}</Label><Input value={form.employee_name} onChange={(e) => set("employee_name", e.target.value)} /></div>
            <div><Label>{t.evalDate}</Label><Input type="date" lang={isAr ? "ar" : "en"} value={form.evaluation_date} onChange={(e) => set("evaluation_date", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CRITERIA.map((c) => (
              <div key={c.key}><Label>{c.label} (1-5)</Label><Input type="number" min="1" max="5" value={form[c.key]} onChange={(e) => set(c.key, e.target.value)} /></div>
            ))}
          </div>
          <div><Label>{t.strengths}</Label><Textarea rows={2} value={form.strengths} onChange={(e) => set("strengths", e.target.value)} /></div>
          <div><Label>{t.improvements}</Label><Textarea rows={2} value={form.improvements} onChange={(e) => set("improvements", e.target.value)} /></div>
          <div><Label>{t.rec}</Label>
            <Select value={form.recommendation} onValueChange={(v) => { set("recommendation", v); setPendingTerminate(false); setDoneConfirm(false); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="confirm">{t.confirm}</SelectItem>
                <SelectItem value="extend">{t.extend}</SelectItem>
                <SelectItem value="dismiss_probation">{t.dismiss}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.recommendation === "dismiss_probation" && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{t.dismissNote}</span>
            </div>
          )}
          <div><Label>{t.notes}</Label><Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>

          {doneConfirm && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
              <BadgeCheck size={16} /> {t.confirmed}
            </div>
          )}
          {pendingTerminate && (
            <div className="border rounded-xl p-3 bg-rose-50/60 border-rose-200 space-y-2">
              <div className="text-sm font-medium text-rose-800">{t.exec}</div>
              <div className="text-xs text-muted-foreground">{t.execHint}</div>
              <Button variant="destructive" onClick={terminate} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <FileX2 size={16} />} {t.execBtn}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
          <Button onClick={save} disabled={saving}>{saving ? t.saving : t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}