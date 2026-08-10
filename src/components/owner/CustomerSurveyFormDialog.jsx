import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";

const DEFAULT_QUESTIONS_AR = [
  "ما مدى سهولة استخدام برنامج جدارة؟ (1 = صعب جدًا، 5 = سهل جدًا)",
  "هل يغطي البرنامج جميع المميزات التي تحتاجها منشأتك؟ (1 = لا يغطي، 5 = يغطي بالكامل)",
  "كيف تقيم دعم الجدارة الفني في تذليل الصعوبات التي تواجهكم؟ (1 = ضعيف، 5 = ممتاز)",
];
const DEFAULT_QUESTIONS_EN = [
  "How easy is Jadara to use? (1 = very hard, 5 = very easy)",
  "Does the platform cover all features your organization needs? (1 = no, 5 = fully)",
  "How do you rate Jadara's technical support when issues arise? (1 = poor, 5 = excellent)",
];

export default function CustomerSurveyFormDialog({ open, onClose, onSaved, survey, isAr }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setErr("");
      if (survey) {
        setTitle(survey.title || "");
        setDescription(survey.description || "");
        let qs = [];
        try { qs = JSON.parse(survey.questions || "[]"); } catch { qs = []; }
        setQuestions(qs.map(q => q.text || ""));
      } else {
        setTitle(isAr ? "تقييم تجربتك مع جدارة" : "Your experience with Jadara");
        setDescription(isAr ? "نسعى لتطوير خدمتنا لكم. استبيان قصير - أقل من دقيقة." : "Help us improve. A quick survey - under a minute.");
        setQuestions(isAr ? [...DEFAULT_QUESTIONS_AR] : [...DEFAULT_QUESTIONS_EN]);
      }
    }
  }, [open, survey]);

  const addQ = () => {
    if (questions.length >= 5) return;
    setQuestions([...questions, ""]);
  };
  const removeQ = (i) => setQuestions(questions.filter((_, idx) => idx !== i));
  const setQ = (i, v) => setQuestions(questions.map((q, idx) => (idx === i ? v : q)));

  const submit = async () => {
    setErr("");
    if (!title.trim()) { setErr(isAr ? "أدخل عنوان الاستبيان" : "Enter title"); return; }
    const clean = questions.map(q => q.trim()).filter(Boolean);
    if (clean.length === 0) { setErr(isAr ? "أضف سؤالاً واحداً على الأقل" : "Add at least one question"); return; }
    if (clean.length > 5) { setErr(isAr ? "الحد الأقصى 5 أسئلة" : "Max 5 questions"); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        questions: JSON.stringify(clean.map(t => ({ text: t }))),
      };
      if (survey) {
        await base44.entities.CustomerSurvey.update(survey.id, payload);
      } else {
        await base44.entities.CustomerSurvey.create({ ...payload, status: "active" });
      }
      onSaved?.();
      onClose();
    } catch (e) {
      setErr(e?.message || (isAr ? "تعذّر الحفظ" : "Failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{survey ? (isAr ? "تعديل الاستبيان" : "Edit survey") : (isAr ? "استبيان تجربة عميل جديد" : "New customer survey")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isAr ? "العنوان" : "Title"}</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isAr ? "المقدمة / الوصف" : "Intro"}</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={500} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">{isAr ? `الأسئلة (${questions.length}/5)` : `Questions (${questions.length}/5)`}</Label>
              <Button size="sm" variant="outline" onClick={addQ} disabled={questions.length >= 5} className="gap-1 h-7 text-xs">
                <Plus size={13} /> {isAr ? "إضافة سؤال" : "Add"}
              </Button>
            </div>
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground mt-2.5 shrink-0">Q{i + 1}</span>
                <Textarea value={q} onChange={e => setQ(i, e.target.value)} rows={1} className="text-sm" />
                {questions.length > 1 && (
                  <Button size="icon" variant="ghost" onClick={() => removeQ(i)} className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive">
                    <Trash2 size={15} />
                  </Button>
                )}
              </div>
            ))}
            <div className="text-[11px] text-muted-foreground">{isAr ? "كل سؤال يُجاب بتقييم من 1 إلى 5. الحد الأقصى 5 أسئلة لإبقاء الاستبيان قصيراً." : "Each question is rated 1-5. Max 5 questions to keep it short."}</div>
          </div>
          {err && <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-2.5">{err}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{isAr ? "إلغاء" : "Cancel"}</Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null} {isAr ? "حفظ ونشر" : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}