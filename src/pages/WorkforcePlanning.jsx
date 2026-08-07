import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ClipboardList, Target, Wallet, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function WorkforcePlanning() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const HORIZONS = isAr
    ? [{ value: "annual", label: "سنوي" }, { value: "multi_year", label: "متعدد السنوات" }, { value: "rolling", label: "متدحرج (Rolling)" }]
    : [{ value: "annual", label: "Annual" }, { value: "multi_year", label: "Multi-year" }, { value: "rolling", label: "Rolling" }];
  const STATUSES = isAr ? {
    draft: { label: "مسودة", cls: "bg-slate-100 text-slate-700 border-slate-200" },
    in_review: { label: "قيد المراجعة", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    approved: { label: "معتمدة", cls: "bg-violet-100 text-violet-700 border-violet-200" },
    in_progress: { label: "قيد التنفيذ", cls: "bg-blue-100 text-blue-700 border-blue-200" },
    completed: { label: "مكتملة", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  } : {
    draft: { label: "Draft", cls: "bg-slate-100 text-slate-700 border-slate-200" },
    in_review: { label: "In review", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    approved: { label: "Approved", cls: "bg-violet-100 text-violet-700 border-violet-200" },
    in_progress: { label: "In progress", cls: "bg-blue-100 text-blue-700 border-blue-200" },
    completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  };
  const statusLabel = (v) => STATUSES[v]?.label || v;
  const t = isAr ? {
    title: "تخطيط القوة العاملة", subtitle: "خطط القوة العاملة بأفق سنوي أو متعدد السنوات: الأهداف، الأعداد الحالية والمستهدفة، فجوات التوظيف، الميزانية، التدريب، المبادرات ومؤشرات الأداء.",
    add: "خطة جديدة", sTarget: "الأعداد المستهدفة", sCurrent: "الأعداد الحالية", sBudget: "إجمالي الميزانية (ر.س)",
    loading: "جارٍ التحميل...", empty: "لا توجد خطط بعد. ابدأ بإنشاء خطة قوة عاملة لسنة قادمة.",
    objective: "الهدف", current: "الحالي", target: "المستهدف", gap: "الفجوة",
    recruit: (n) => `تعيينات مطلوبة: ${n}`, training: (n) => `برامج التدريب: ${n}`, budget: (n) => `الميزانية: ${Number(n).toLocaleString()} ر.س`, owner: (n) => `مالك الخطة: ${n}`,
    initiatives: "المبادرات", kpis: "مؤشرات الأداء", edit: "تعديل",
    editT: "تعديل خطة القوة العاملة", newT: "خطة قوة عاملة جديدة", lTitle: "عنوان الخطة *", titlePh: "مثال: خطة القوة العاملة 2027",
    lYear: "سنة الخطة *", lHorizon: "أفق التخطيط", lDept: "الإدارة / الجهة", lOwner: "المسؤول عن الخطة", lObj: "الهدف", lObjPh: "هدف خطة القوة العاملة",
    lCurrent: "العدد الحالي", lTarget: "العدد المستهدف", lRecruit: "عدد التعيينات المطلوبة", lTraining: "برامج التدريب", lBudget: "الميزانية (ر.س)",
    lStatus: "الحالة", lStart: "تاريخ البداية", lEnd: "تاريخ النهاية", lInit: "المبادرات", lKpis: "مؤشرات الأداء (KPIs)", lNotes: "ملاحظات",
    cancel: "إلغاء", save: "حفظ التعديلات", create: "إنشاء الخطة",
  } : {
    title: "Workforce planning", subtitle: "Annual or multi-year workforce plans: objectives, current/target headcount, hiring gaps, budget, training, initiatives and KPIs.",
    add: "New plan", sTarget: "Target headcount", sCurrent: "Current headcount", sBudget: "Total budget (SAR)",
    loading: "Loading...", empty: "No plans yet. Create a workforce plan for an upcoming year.",
    objective: "Objective", current: "Current", target: "Target", gap: "Gap",
    recruit: (n) => `Required hires: ${n}`, training: (n) => `Training programs: ${n}`, budget: (n) => `Budget: ${Number(n).toLocaleString()} SAR`, owner: (n) => `Plan owner: ${n}`,
    initiatives: "Initiatives", kpis: "KPIs", edit: "Edit",
    editT: "Edit workforce plan", newT: "New workforce plan", lTitle: "Plan title *", titlePh: "e.g. Workforce Plan 2027",
    lYear: "Plan year *", lHorizon: "Planning horizon", lDept: "Department / entity", lOwner: "Plan owner", lObj: "Objective", lObjPh: "Workforce plan objective",
    lCurrent: "Current headcount", lTarget: "Target headcount", lRecruit: "Required hires", lTraining: "Training programs", lBudget: "Budget (SAR)",
    lStatus: "Status", lStart: "Start date", lEnd: "End date", lInit: "Initiatives", lKpis: "KPIs", lNotes: "Notes",
    cancel: "Cancel", save: "Save changes", create: "Create plan",
  };

  const currentYear = new Date().getFullYear();
  const empty = { title: "", plan_year: currentYear, planning_horizon: "annual", department: "", objective: "", current_headcount: 0, target_headcount: 0, recruitment_count: 0, training_count: 0, budget: 0, initiatives: "", kpis: "", owner_name: "", start_date: "", end_date: "", status: "draft", notes: "" };

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.WorkforcePlan.list("-plan_year", 200);
    setPlans(list); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setEditing(null); setForm(empty); };
  const openNew = () => { reset(); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...empty, ...p }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, plan_year: Number(form.plan_year) || currentYear, current_headcount: Number(form.current_headcount) || 0, target_headcount: Number(form.target_headcount) || 0, recruitment_count: Number(form.recruitment_count) || 0, training_count: Number(form.training_count) || 0, budget: Number(form.budget) || 0 };
    if (editing) await base44.entities.WorkforcePlan.update(editing.id, payload);
    else await base44.entities.WorkforcePlan.create(payload);
    setOpen(false); reset(); load();
  };
  const remove = async (id) => { await base44.entities.WorkforcePlan.delete(id); await load(); };

  const totalTarget = plans.reduce((s, p) => s + (p.target_headcount || 0), 0);
  const totalCurrent = plans.reduce((s, p) => s + (p.current_headcount || 0), 0);
  const totalBudget = plans.reduce((s, p) => s + (p.budget || 0), 0);

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} action={<Button onClick={openNew} className="gap-2"><Plus size={16} /> {t.add}</Button>} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Stat label={t.sTarget} value={totalTarget} icon={Users} />
        <Stat label={t.sCurrent} value={totalCurrent} icon={Target} />
        <Stat label={t.sBudget} value={totalBudget.toLocaleString()} icon={Wallet} />
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
      ) : plans.length === 0 ? (
        <div className="bg-white border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground">{t.empty}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {plans.map((p) => {
            const gap = (p.target_headcount || 0) - (p.current_headcount || 0);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center"><ClipboardList size={18} className="text-violet-600" /></div>
                      <h3 className="font-semibold truncate">{p.title}</h3>
                    </div>
                    <div className="text-xs text-muted-foreground">{p.plan_year} • {HORIZONS.find((h) => h.value === p.planning_horizon)?.label || p.planning_horizon}{p.department ? ` • ${p.department}` : ""}</div>
                  </div>
                  <span className={`text-xs border rounded-full px-2.5 py-1 shrink-0 ${STATUSES[p.status]?.cls || ""}`}>{statusLabel(p.status)}</span>
                </div>
                {p.objective && (<p className="text-sm text-muted-foreground leading-relaxed mb-3"><span className="font-medium text-foreground">{t.objective}: </span>{p.objective}</p>)}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div className="bg-slate-50 rounded-lg p-2"><div className="font-bold text-base">{p.current_headcount || 0}</div><div className="text-muted-foreground">{t.current}</div></div>
                  <div className="bg-slate-50 rounded-lg p-2"><div className="font-bold text-base">{p.target_headcount || 0}</div><div className="text-muted-foreground">{t.target}</div></div>
                  <div className={`rounded-lg p-2 ${gap > 0 ? "bg-amber-50" : "bg-emerald-50"}`}><div className={`font-bold text-base ${gap > 0 ? "text-amber-700" : "text-emerald-700"}`}>{gap > 0 ? `+${gap}` : gap}</div><div className="text-muted-foreground">{t.gap}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                  {p.recruitment_count ? <div>{t.recruit(p.recruitment_count)}</div> : null}
                  {p.training_count ? <div>{t.training(p.training_count)}</div> : null}
                  {p.budget ? <div>{t.budget(p.budget)}</div> : null}
                  {p.owner_name ? <div>{t.owner(p.owner_name)}</div> : null}
                </div>
                {p.initiatives && (<div className="text-xs text-muted-foreground bg-slate-50 rounded-lg p-2 mb-1"><span className="font-medium text-foreground">{t.initiatives}: </span>{p.initiatives}</div>)}
                {p.kpis && (<div className="text-xs text-muted-foreground bg-slate-50 rounded-lg p-2"><span className="font-medium text-foreground">{t.kpis}: </span>{p.kpis}</div>)}
                <div className="flex justify-end gap-1 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="h-8 gap-1"><Pencil size={14} /> {t.edit}</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="h-8 text-rose-500"><Trash2 size={14} /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t.editT : t.newT}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2"><Label>{t.lTitle}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder={t.titlePh} /></div>
              <div className="space-y-1.5"><Label>{t.lYear}</Label><Input type="number" value={form.plan_year} onChange={(e) => setForm({ ...form, plan_year: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label>{t.lHorizon}</Label><Select value={form.planning_horizon} onValueChange={(v) => setForm({ ...form, planning_horizon: v })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{HORIZONS.map((h) => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label>{t.lDept}</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>{t.lOwner}</Label><Input value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>{t.lObj}</Label><Textarea rows={2} value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} placeholder={t.lObjPh} /></div>
              <div className="space-y-1.5"><Label>{t.lCurrent}</Label><Input type="number" min={0} value={form.current_headcount} onChange={(e) => setForm({ ...form, current_headcount: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>{t.lTarget}</Label><Input type="number" min={0} value={form.target_headcount} onChange={(e) => setForm({ ...form, target_headcount: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>{t.lRecruit}</Label><Input type="number" min={0} value={form.recruitment_count} onChange={(e) => setForm({ ...form, recruitment_count: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>{t.lTraining}</Label><Input type="number" min={0} value={form.training_count} onChange={(e) => setForm({ ...form, training_count: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>{t.lBudget}</Label><Input type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>{t.lStatus}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUSES).map(([v, s]) => <SelectItem key={v} value={v}>{s.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label>{t.lStart}</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>{t.lEnd}</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>{t.lInit}</Label><Textarea rows={2} value={form.initiatives} onChange={(e) => setForm({ ...form, initiatives: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>{t.lKpis}</Label><Textarea rows={2} value={form.kpis} onChange={(e) => setForm({ ...form, kpis: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>{t.lNotes}</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t.cancel}</Button>
              <Button type="submit">{editing ? t.save : t.create}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center"><Icon size={20} className="text-violet-600" /></div>
      <div><div className="text-xl font-bold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
    </div>
  );
}