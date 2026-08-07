import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";
import { VIOLATION_CATEGORIES, WARNING_LEVELS, suggestLevel, categoryById, levelById } from "@/lib/laborPolicy";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function WarningForm({ open, onClose, onSaved, employees }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "إنشاء إنذار", emp: "الموظف", empPh: "اختر الموظف", cat: "نوع المخالفة", catPh: "اختر نوع المخالفة",
    article: "المرجع النظامي", level: "درجة الإنذار", suggested: "مقترح آلي", incident: "تاريخ الواقعة",
    session: "تاريخ جلسة التحقيق", invest: "ملخص التحقيق/الجلسة", investPh: "اذكر ما تم في الجلسة وإثبات المخالفة...",
    desc: "نص الإنذار", descPh: "نص الإنذار الموجه للموظف...", save: "إرسال الإنذار للبوابة", saving: "جارٍ الإرسال...",
    needEmp: "اختر الموظف أولاً.", cons: "التوجير", existingCount: "عدد إنذارات سابقة بنفس النوع",
    info: "بعد إرسال الإنذار يُعتبر نافذاً ويظهر فوراً في بوابة الموظف دون الحاجة لموافقة.",
  } : {
    title: "Create warning", emp: "Employee", empPh: "Select employee", cat: "Violation type", catPh: "Select violation",
    article: "Legal reference", level: "Warning level", suggested: "auto-suggested", incident: "Incident date",
    session: "Investigation session date", invest: "Investigation summary", investPh: "Describe the session and proof of the violation...",
    desc: "Warning text", descPh: "Warning text addressed to the employee...", save: "Send warning to portal", saving: "Sending...",
    needEmp: "Select an employee first.", cons: "Consequence", existingCount: "Previous warnings of same type",
    info: "Once sent, the warning is effective and appears immediately in the employee portal without approval.",
  };

  const [form, setForm] = useState({ employee_id: "", violation_category: "", warning_level: "first", incident_date: "", session_date: "", investigation_summary: "", description: "" });
  const [existingCount, setExistingCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) {
      setForm({ employee_id: "", violation_category: "", warning_level: "first", incident_date: "", session_date: "", investigation_summary: "", description: "" });
      setExistingCount(0); setErr("");
    }
  }, [open]);

  const emp = employees.find((e) => e.id === form.employee_id) || null;
  const cat = categoryById(form.violation_category, lang);

  // عدّ الإنذارات السابقة للموظف بنفس نوع المخالفة لاقتراح الدرجة
  useEffect(() => {
    if (!form.employee_id || !form.violation_category) { setExistingCount(0); return; }
    let on = true;
    (async () => {
      try {
        const all = await base44.entities.Warning.filter({ employee_id: form.employee_id, violation_category: form.violation_category }, "-created_date", 100);
        if (on) setExistingCount(all.length);
      } catch { if (on) setExistingCount(0); }
    })();
    return () => { on = false; };
  }, [form.employee_id, form.violation_category]);

  useEffect(() => {
    if (cat) setForm((f) => ({ ...f, warning_level: suggestLevel(existingCount, cat) }));
  }, [existingCount, cat]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.employee_id) { setErr(t.needEmp); return; }
    setSaving(true);
    try {
      const payload = {
        employee_id: emp.id,
        employee_user_id: emp.user_id || "",
        employee_name: emp.employee_number ? `${emp.employee_number}` : "",
        department: emp.department || "",
        violation_category: form.violation_category,
        article_reference: cat ? (isAr ? cat.articleAr : cat.articleEn) : "",
        warning_level: form.warning_level,
        incident_date: form.incident_date || "",
        session_date: form.session_date || "",
        investigation_summary: form.investigation_summary || "",
        description: form.description || "",
        status: "sent",
      };
      // اسم الموظف الأفضل
      payload.employee_name = [emp.position, emp.department].filter(Boolean).join(" - ");
      await base44.entities.Warning.create(payload);
      onSaved && onSaved();
      onClose();
    } catch (ex) {
      setErr(ex?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><AlertTriangle size={18} className="text-rose-500" /> {t.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t.emp}</Label>
              <Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)}>
                <SelectTrigger><SelectValue placeholder={t.empPh} /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.employee_number} — {e.position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.cat}</Label>
              <Select value={form.violation_category} onValueChange={(v) => set("violation_category", v)}>
                <SelectTrigger><SelectValue placeholder={t.catPh} /></SelectTrigger>
                <SelectContent>
                  {VIOLATION_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{isAr ? c.ar : c.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {cat && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm space-y-1">
              <div><b className="text-amber-800">{t.article}: </b><span className="text-foreground">{cat.article}</span></div>
              <div><b className="text-amber-800">{t.cons}: </b><span className="text-foreground">{cat.consequence}</span></div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>{t.level} {existingCount > 0 ? `(${t.existingCount}: ${existingCount})` : ` (${t.suggested})`}</Label>
              <Select value={form.warning_level} onValueChange={(v) => set("warning_level", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WARNING_LEVELS.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{isAr ? l.ar : l.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.incident}</Label>
              <Input type="date" value={form.incident_date} onChange={(e) => set("incident_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.session}</Label>
              <Input type="date" value={form.session_date} onChange={(e) => set("session_date", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t.invest}</Label>
            <Textarea rows={3} value={form.investigation_summary} onChange={(e) => set("investigation_summary", e.target.value)} placeholder={t.investPh} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.desc}</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={t.descPh} />
          </div>

          <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-muted-foreground leading-relaxed">{t.info}</div>
          {err && <div className="text-sm text-rose-600">{err}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>إلغاء / Cancel</Button>
            <Button type="submit" disabled={saving} className="gap-2">{saving && <Loader2 size={16} className="animate-spin" />}{saving ? t.saving : t.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}