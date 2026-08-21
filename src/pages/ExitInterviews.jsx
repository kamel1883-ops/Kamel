import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoorOpen, Plus, Pencil, Trash2, TrendingDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { exitReasonsBreakdown } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const REASONS = ["salary","benefits","work_environment","management","career_growth","work_life_balance","relocation","personal","company_culture","other"];
const EXIT_TYPES = ["resignation","employer_termination","end_of_contract","dismissal_for_cause","retirement","other"];
const REJOIN = ["yes","no","maybe"];

export default function ExitInterviews() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "مقابلات المغادرة والاستبقاء", subtitle: "تحليل أسباب ترك العمل لخفض معدل الدوران", add: "مقابلة جديدة",
    empty: "لا توجد مقابلات مسجلة", del: "حذف المقابلة؟", loading: "جارٍ التحميل...",
    emp: "الموظف", type: "نوع المغادرة", lastDay: "آخر يوم عمل", date: "تاريخ المقابلة", interviewer: "اسم المقابِل",
    reason: "السبب الرئيسي", details: "تفاصيل الأسباب", rec: "هل توصي بالعمل (1-5)",
    sat: "رضا عن الرواتب", satBen: "رضا عن المزايا", satEnv: "رضا عن بيئة العمل", satMng: "رضا عن الإدارة",
    rejoin: "هل يعود للعمل", feedback: "ملاحظات للتحسين", notes: "ملاحظات", save: "حفظ", cancel: "إلغاء",
    newT: "مقابلة مغادرة", editT: "تعديل المقابلة",
    reasonsH: "توزيع أسباب المغادرة", satH: "متوسط الرضا عند المغادرة",
  } : {
    title: "Exit Interviews & Retention", subtitle: "Analyze reasons for leaving to reduce turnover", add: "New interview",
    empty: "No interviews recorded", del: "Delete this interview?", loading: "Loading...",
    emp: "Employee", type: "Exit type", lastDay: "Last working day", date: "Interview date", interviewer: "Interviewer",
    reason: "Primary reason", details: "Reason details", rec: "Would recommend (1-5)",
    sat: "Salary satisfaction", satBen: "Benefits satisfaction", satEnv: "Work environment", satMng: "Management",
    rejoin: "Would rejoin", feedback: "Constructive feedback", notes: "Notes", save: "Save", cancel: "Cancel",
    newT: "Exit interview", editT: "Edit interview",
    reasonsH: "Exit reasons distribution", satH: "Average satisfaction at exit",
  };
  const rL = (k) => isAr ? ({ salary:"الراتب", benefits:"المزايا", work_environment:"بيئة العمل", management:"الإدارة", career_growth:"النمو الوظيفي", work_life_balance:"التوازن", relocation:"انتقال", personal:"شخصي", company_culture:"الثقافة", other:"أخرى" }[k] || k) : ({ salary:"Salary", benefits:"Benefits", work_environment:"Work environment", management:"Management", career_growth:"Career growth", work_life_balance:"Work-life balance", relocation:"Relocation", personal:"Personal", company_culture:"Company culture", other:"Other" }[k] || k);
  const xL = (k) => isAr ? ({ resignation:"استقالة", employer_termination:"إنهاء من صاحب العمل", end_of_contract:"انتهاء العقد", dismissal_for_cause:"فصل تأديبي", retirement:"تقاعد", other:"أخرى" }[k] || k) : ({ resignation:"Resignation", employer_termination:"Termination", end_of_contract:"End of contract", dismissal_for_cause:"Dismissal", retirement:"Retirement", other:"Other" }[k] || k);
  const jL = (k) => isAr ? ({ yes:"نعم", no:"لا", maybe:"ربما" }[k]) : ({ yes:"Yes", no:"No", maybe:"Maybe" }[k]);

  const empty = { employee_id: "", employee_name: "", department: "", position: "", exit_type: "resignation", last_working_date: "", interview_date: new Date().toISOString().slice(0,10), interviewer_name: "", primary_reason: "salary", reason_details: "", satisfaction_salary: 3, satisfaction_benefits: 3, satisfaction_environment: 3, satisfaction_management: 3, would_recommend: 3, would_rejoin: "no", constructive_feedback: "", status: "completed", notes: "" };
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [x, e] = await Promise.all([
      base44.entities.ExitInterview.list("-interview_date", 500),
      base44.entities.Employee.list("-created_date", 500),
    ]);
    setItems(x); setEmployees(e); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onEmployee = (id) => {
    const e = employees.find((x) => x.id === id);
    setForm((f) => ({ ...f, employee_id: id, employee_name: e ? e.full_name : "", department: e?.department || "", position: e?.position || "" }));
  };
  const startAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (x) => { setEditing(x); setForm({ ...empty, ...x }); setOpen(true); };
  const save = async (e) => {
    e.preventDefault();
    if (editing) await base44.entities.ExitInterview.update(editing.id, form);
    else await base44.entities.ExitInterview.create(form);
    setOpen(false); load();
  };
  const remove = async (x) => { if (!confirm(t.del)) return; await base44.entities.ExitInterview.delete(x.id); load(); };

  const reasons = exitReasonsBreakdown(employees, items);
  const max = Math.max(1, ...reasons.map((r) => r.value));
  const avg = (key) => {
    const arr = items.filter((x) => x[key]).map((x) => Number(x[key]));
    return arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : "—";
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} action={<Button onClick={startAdd} className="gap-2"><Plus size={18} /> {t.add}</Button>} />
      {loading ? <div className="p-10 text-center text-muted-foreground">{t.loading}</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {items.length === 0 && <div className="p-14 text-center bg-white rounded-2xl border border-border"><DoorOpen size={40} className="mx-auto text-slate-300 mb-3" /><p className="text-muted-foreground">{t.empty}</p></div>}
            {items.map((x) => (
              <div key={x.id} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold truncate">{x.employee_name || t.emp}</div>
                    {(() => { const ee = employees.find((q) => q.id === x.employee_id); return ee?.national_id ? <div className="text-xs text-muted-foreground tabular-nums" dir="ltr">{ee.national_id}</div> : null; })()}
                    <div className="text-xs text-muted-foreground mt-0.5">{xL(x.exit_type)} · {rL(x.primary_reason)} · {x.interview_date}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEdit(x)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><Pencil size={15} /></button>
                    <button onClick={() => remove(x)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <span className="px-2 py-1 rounded-lg bg-slate-100">{t.rejoin}: {jL(x.would_rejoin)}</span>
                  <span className="px-2 py-1 rounded-lg bg-slate-100">{t.rec}: {x.would_recommend}/5</span>
                  {x.department && <span className="px-2 py-1 rounded-lg bg-slate-100">{x.department}</span>}
                </div>
                {x.constructive_feedback && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{x.constructive_feedback}</p>}
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingDown size={16} className="text-rose-500" /> {t.reasonsH}</h3>
              <div className="space-y-2">
                {reasons.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
                {reasons.map((r) => (
                  <div key={r.name} className="flex items-center gap-2">
                    <span className="text-xs w-28 shrink-0 truncate">{rL(r.name)}</span>
                    <div className="flex-1 h-5 bg-slate-100 rounded-lg overflow-hidden"><div className="h-full bg-rose-400" style={{ width: `${(r.value / max) * 100}%` }} /></div>
                    <span className="text-xs font-bold w-6 text-end">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold mb-3">{t.satH}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Cell label={t.sat} v={avg("satisfaction_salary")} />
                <Cell label={t.satBen} v={avg("satisfaction_benefits")} />
                <Cell label={t.satEnv} v={avg("satisfaction_environment")} />
                <Cell label={t.satMng} v={avg("satisfaction_management")} />
                <Cell label={t.rec} v={avg("would_recommend")} />
                <Cell label={isAr ? "إجمالي" : "Overall"} v={(() => { const arr = items.map((x) => (Number(x.satisfaction_salary)+Number(x.satisfaction_benefits)+Number(x.satisfaction_environment)+Number(x.satisfaction_management))/4); return arr.length?(arr.reduce((s,v)=>s+v,0)/arr.length).toFixed(1):"—"; })()} />
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-3">
            <h3 className="font-semibold">{editing ? t.editT : t.newT}</h3>
            <div className="grid grid-cols-2 gap-3">
              <In label={t.emp}>
                <Select value={form.employee_id} onValueChange={onEmployee}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name} — {e.national_id || "—"}</SelectItem>)}</SelectContent>
                </Select>
              </In>
              <In label={t.type}>
                <Select value={form.exit_type} onValueChange={(v) => set("exit_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXIT_TYPES.map((x) => <SelectItem key={x} value={x}>{xL(x)}</SelectItem>)}</SelectContent>
                </Select>
              </In>
              <In label={t.lastDay}><Input type="date" value={form.last_working_date} onChange={(e) => set("last_working_date", e.target.value)} /></In>
              <In label={t.date}><Input type="date" value={form.interview_date} onChange={(e) => set("interview_date", e.target.value)} required /></In>
              <In label={t.interviewer}><Input value={form.interviewer_name} onChange={(e) => set("interviewer_name", e.target.value)} /></In>
              <In label={t.reason}>
                <Select value={form.primary_reason} onValueChange={(v) => set("primary_reason", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{REASONS.map((x) => <SelectItem key={x} value={x}>{rL(x)}</SelectItem>)}</SelectContent>
                </Select>
              </In>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[[t.sat,"satisfaction_salary"],[t.satBen,"satisfaction_benefits"],[t.satEnv,"satisfaction_environment"],[t.satMng,"satisfaction_management"],[t.rec,"would_recommend"]].map(([lab,key]) => (
                <In key={key} label={`${lab} (${form[key]}/5)`}>
                  <input type="range" min={1} max={5} value={form[key]} onChange={(e) => set(key, Number(e.target.value))} className="w-full accent-violet-600" />
                </In>
              ))}
              <In label={t.rejoin}>
                <Select value={form.would_rejoin} onValueChange={(v) => set("would_rejoin", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{REJOIN.map((x) => <SelectItem key={x} value={x}>{jL(x)}</SelectItem>)}</SelectContent>
                </Select>
              </In>
            </div>
            <In label={t.details}><Textarea rows={2} value={form.reason_details} onChange={(e) => set("reason_details", e.target.value)} /></In>
            <In label={t.feedback}><Textarea rows={3} value={form.constructive_feedback} onChange={(e) => set("constructive_feedback", e.target.value)} /></In>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t.cancel}</Button>
              <Button type="submit">{t.save}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Cell({ label, v }) { return <div className="rounded-xl bg-slate-50 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="text-lg font-bold mt-0.5">{v}/5</div></div>; }
function In({ label, children }) { return <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{label}</label>{children}</div>; }