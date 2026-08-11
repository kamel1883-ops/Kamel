import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ClipboardList, Plus, Loader2, RefreshCw, Copy, Edit, Trash2, BarChart3,
  Star, Send, Check, Lightbulb, TrendingUp, TrendingDown, MessageSquare,
} from "lucide-react";

const DEFAULT_Q_AR = [
  "ما مدى سهولة استخدام برنامج جدارة؟ (1 = صعب جدًا، 5 = سهل جدًا)",
  "هل يغطي البرنامج جميع المميزات التي تحتاجها منشأتك؟ (1 = لا يغطي، 5 = يغطي بالكامل)",
  "كيف تقيم دعم الجدارة الفني في تذليل الصعوبات التي تواجهكم؟ (1 = ضعيف، 5 = ممتاز)",
];

export default function SurveysManager({ session }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "استبيانات تجربة العميل",
    welcome: "أنشئ استبياناً قصيراً (حتى 5 أسئلة)، شاركه مع عملائك، وتابع الردود والمؤشرات وفرص التحسين.",
    sSurveys: "الاستبيانات", sActive: "نشطة", sClosed: "مغلقة", sResponses: "إجمالي الردود", sAvg: "متوسط التقييم العام",
    newBtn: "استبيان جديد",
    loading: "جارٍ التحميل…", fail: "تعذّر التحميل. أعد المحاولة.", retry: "إعادة المحاولة",
    empty: "لا توجد استبيانات بعد — أنشئ أول استبيان لقياس تجربة عملائك.",
    thTitle: "الاستبيان", thStatus: "الحالة", thResponses: "الردود", thActions: "إجراءات",
    share: "مشاركة", report: "التقرير", edit: "تعديل", del: "حذف", closeBtn: "إغلاق", openBtn: "إعادة فتح", copied: "تم نسخ الرابط",
    statusActive: "نشط", statusDraft: "مسودة", statusClosed: "مغلق",
  } : {
    title: "Customer Experience Surveys",
    welcome: "Create a short survey (up to 5 questions), share with clients, and track responses, indicators and improvement opportunities.",
    sSurveys: "Surveys", sActive: "Active", sClosed: "Closed", sResponses: "Total responses", sAvg: "Overall avg rating",
    newBtn: "New survey",
    loading: "Loading…", fail: "Failed to load. Retry.", retry: "Retry",
    empty: "No surveys yet — create one to measure your clients' experience.",
    thTitle: "Survey", thStatus: "Status", thResponses: "Responses", thActions: "Actions",
    share: "Share", report: "Report", edit: "Edit", del: "Delete", closeBtn: "Close", openBtn: "Reopen", copied: "Link copied",
    statusActive: "Active", statusDraft: "Draft", statusClosed: "Closed",
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [report, setReport] = useState(null);

  const call = useCallback(async (action, extra = {}) => {
    const p = base44.functions.invoke("portalData", { token: session.token, employee_id: session.employee_id, action, ...extra });
    const res = await Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 18000))]);
    const d = res?.data || res;
    if (!d?.ok) throw new Error(d?.error || "fail");
    return d;
  }, [session?.token, session?.employee_id]);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await call("owner_survey_list"); setData(d); setErr(""); }
    catch (e) { setErr(String(e?.message || e)); }
    finally { setLoading(false); }
  }, [call]);

  const didMount = useRef(false);
  useEffect(() => { if (didMount.current) return; didMount.current = true; load(); }, [load]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const saveSurvey = async (payload) => {
    setBusyId("form");
    try { await call("owner_survey_save", payload); flash(isAr ? "تم الحفظ بنجاح." : "Saved."); setFormOpen(false); setEditing(null); await load(); }
    catch (e) { throw e; }
    finally { setBusyId(null); }
  };
  const setStatus = async (s, newStatus) => { setBusyId(s.id); try { await call("owner_survey_save", { id: s.id, title: s.title, description: s.description, questions: s.questions, status: newStatus }); await load(); } catch (e) { alert(e?.message); } finally { setBusyId(null); } };
  const del = async (s) => { if (!confirm(isAr ? "حذف الاستبيان وكل ردوده؟" : "Delete survey and all responses?")) return; setBusyId(s.id); try { await call("owner_survey_delete", { id: s.id }); await load(); } catch (e) { alert(e?.message); } finally { setBusyId(null); } };
  const copyLink = (s) => { const link = `${window.location.origin}/c/${s.id}`; navigator.clipboard?.writeText(link); flash(t.copied); };
  const waShare = (s) => { const link = `${window.location.origin}/c/${s.id}`; const msg = isAr ? `تقييم تجربتك مع جدارة — يستغرق أقل من دقيقة:\n${link}` : `Rate your experience with Jadara — under a minute:\n${link}`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank"); };

  const surveys = data?.surveys || [];
  const rcount = data?.responses_count || {};
  const allResp = data?.responses || [];
  const stats = useMemo(() => {
    let total = allResp.length, sum = 0;
    for (const r of allResp) sum += r.avg_rating || 0;
    return { total, avg: total ? Math.round((sum / total) * 10) / 10 : 0, active: surveys.filter(s => s.status === "active").length, closed: surveys.filter(s => s.status === "closed").length };
  }, [surveys, allResp]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl overflow-hidden border border-violet-200/60 bg-gradient-to-br from-[#0b1120] via-[#15183a] to-[#3b1d6e] text-white p-7">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <ClipboardList className="text-amber-300" size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold mt-1.5">{t.title}</h2>
            <p className="text-white/70 text-sm mt-1 leading-relaxed">{t.welcome}</p>
          </div>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-amber-400 hover:bg-amber-300 text-slate-900 gap-1.5 shrink-0">
            <Plus size={16} /> {t.newBtn}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={ClipboardList} label={t.sSurveys} value={surveys.length} tint="violet" />
        <Stat icon={TrendingUp} label={t.sActive} value={stats.active} tint="emerald" />
        <Stat icon={MessageSquare} label={t.sResponses} value={stats.total} tint="indigo" />
        <Stat icon={Star} label={t.sAvg} value={stats.avg ? `${stats.avg.toFixed(1)} / 5` : "—"} tint="amber" />
      </div>

      {loading && !data ? (
        <div className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
          <div className="h-11 border-b border-border bg-slate-50" />
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 border-b border-border bg-white" />)}
        </div>
      ) : err ? (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm flex items-center justify-between gap-3 flex-wrap">
          <span>{t.fail} ({err})</span>
          <Button size="sm" variant="outline" onClick={load} className="shrink-0 gap-1.5 h-8"><RefreshCw size={13} /> {t.retry}</Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-start font-medium px-4 py-3">{t.thTitle}</th>
                  <th className="text-start font-medium px-4 py-3">{t.thStatus}</th>
                  <th className="text-start font-medium px-4 py-3">{t.thResponses}</th>
                  <th className="text-start font-medium px-4 py-3">{t.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {surveys.map((s) => {
                  const cnt = rcount[s.id] || 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium truncate">{s.title}</div>
                        {s.description && <div className="text-xs text-muted-foreground truncate max-w-[360px]">{s.description}</div>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} t={t} /></td>
                      <td className="px-4 py-3 font-medium">{cnt}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => setReport(s)} className="gap-1.5 h-8"><BarChart3 size={14} /> {t.report}</Button>
                          <Button size="sm" variant="outline" onClick={() => copyLink(s)} className="gap-1.5 h-8"><Copy size={13} /> {t.share}</Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditing(s); setFormOpen(true); }} className="gap-1.5 h-8"><Edit size={13} /> {t.edit}</Button>
                          {s.status === "active"
                            ? <Button size="sm" variant="ghost" onClick={() => setStatus(s, "closed")} disabled={busyId === s.id} className="h-8 text-slate-500">{t.closeBtn}</Button>
                            : <Button size="sm" variant="ghost" onClick={() => setStatus(s, "active")} disabled={busyId === s.id} className="h-8 text-emerald-600">{t.openBtn}</Button>}
                          <Button size="sm" variant="ghost" onClick={() => waShare(s)} className="gap-1.5 h-8 text-emerald-600"><Send size={13} /> WA</Button>
                          <Button size="sm" variant="ghost" onClick={() => del(s)} disabled={busyId === s.id} className="h-8 text-rose-600"><Trash2 size={13} /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {surveys.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">{t.empty}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 inset-x-0 flex justify-center z-50">
          <div className="bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2"><Check size={15} /> {toast}</div>
        </div>
      )}

      {formOpen && <SurveyFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} survey={editing} isAr={isAr} saving={busyId === "form"} onSave={saveSurvey} />}
      {report && <SurveyReportDialog open={!!report} onClose={() => setReport(null)} survey={report} isAr={isAr} call={call} />}
    </div>
  );
}

const TINTS = { violet: "bg-violet-100 text-violet-600", emerald: "bg-emerald-100 text-emerald-600", indigo: "bg-indigo-100 text-indigo-600", amber: "bg-amber-100 text-amber-600" };
function Stat({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-3.5 flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", TINTS[tint])}><Icon size={18} /></div>
      <div className="min-w-0"><div className="text-xs text-muted-foreground truncate">{label}</div><div className="text-lg font-bold truncate">{value}</div></div>
    </div>
  );
}
function StatusBadge({ status, t }) {
  const map = status === "active" ? { l: t.statusActive, c: "bg-emerald-50 text-emerald-700 border-emerald-200" }
    : status === "closed" ? { l: t.statusClosed, c: "bg-rose-50 text-rose-700 border-rose-200" }
    : { l: t.statusDraft, c: "bg-slate-100 text-slate-600 border-slate-200" };
  return <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", map.c)}>{map.l}</span>;
}

// ——— نموذج إنشاء/تعديل الاستبيان ———
function SurveyFormDialog({ open, onClose, survey, isAr, saving, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!open) return;
    setErr("");
    if (survey) {
      setTitle(survey.title || "");
      setDescription(survey.description || "");
      let qs = []; try { qs = JSON.parse(survey.questions || "[]"); } catch {}
      setQuestions(qs.map(q => q.text || ""));
    } else {
      setTitle(isAr ? "تقييم تجربتك مع جدارة" : "Your experience with Jadara");
      setDescription(isAr ? "نسعى لتطوير خدمتنا لكم. استبيان قصير - أقل من دقيقة." : "Help us improve. A quick survey - under a minute.");
      setQuestions(isAr ? [...DEFAULT_Q_AR] : DEFAULT_Q_AR.map((q) => q));
    }
  }, [open, survey]);
  const addQ = () => { if (questions.length >= 5) return; setQuestions([...questions, ""]); };
  const removeQ = (i) => setQuestions(questions.filter((_, idx) => idx !== i));
  const setQ = (i, v) => setQuestions(questions.map((q, idx) => (idx === i ? v : q)));
  const submit = async () => {
    setErr("");
    if (!title.trim()) { setErr(isAr ? "أدخل عنوان الاستبيان" : "Enter title"); return; }
    const clean = questions.map(q => q.trim()).filter(Boolean);
    if (clean.length === 0) { setErr(isAr ? "أضف سؤالاً واحداً على الأقل" : "Add at least one question"); return; }
    if (clean.length > 5) { setErr(isAr ? "الحد الأقصى 5 أسئلة" : "Max 5 questions"); return; }
    try {
      await onSave({
        id: survey?.id || "",
        title: title.trim(),
        description: description.trim(),
        questions: JSON.stringify(clean.map(text => ({ text }))),
        status: survey?.status || "active",
      });
    } catch (e) { setErr(e?.message || (isAr ? "تعذّر الحفظ" : "Failed")); }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{survey ? (isAr ? "تعديل الاستبيان" : "Edit survey") : (isAr ? "استبيان جديد" : "New survey")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{isAr ? "العنوان" : "Title"}</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="h-10" /></div>
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{isAr ? "المقدمة" : "Intro"}</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={500} /></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">{isAr ? `الأسئلة (${questions.length}/5)` : `Questions (${questions.length}/5)`}</Label>
              <Button size="sm" variant="outline" onClick={addQ} disabled={questions.length >= 5} className="gap-1 h-7 text-xs"><Plus size={13} /> {isAr ? "إضافة سؤال" : "Add"}</Button>
            </div>
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground mt-2.5 shrink-0">Q{i + 1}</span>
                <Textarea value={q} onChange={e => setQ(i, e.target.value)} rows={1} className="text-sm" />
                {questions.length > 1 && <Button size="icon" variant="ghost" onClick={() => removeQ(i)} className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"><Trash2 size={15} /></Button>}
              </div>
            ))}
            <div className="text-[11px] text-muted-foreground">{isAr ? "كل سؤال يُجاب بتقييم من 1 إلى 5. الحد الأقصى 5 أسئلة." : "Each question rated 1-5. Max 5 questions."}</div>
          </div>
          {err && <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-2.5">{err}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{isAr ? "إلغاء" : "Cancel"}</Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">{saving ? <Loader2 size={16} className="animate-spin" /> : null} {isAr ? "حفظ ونشر" : "Publish"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ——— تقرير الاستبيان: مؤشرات + فرص تحسين ———
function SurveyReportDialog({ open, onClose, survey, isAr, call }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    if (!open || !survey) return;
    setLoading(true);
    (async () => {
      try {
        const d = await call("owner_survey_responses", { survey_id: survey.id });
        setResponses(d.responses || []);
        let qs = []; try { qs = JSON.parse(survey.questions || "[]"); } catch {}
        setQuestions(qs);
      } finally { setLoading(false); }
    })();
  }, [open, survey]);
  const total = responses.length;
  const sum = responses.reduce((s, r) => s + (r.avg_rating || 0), 0);
  const overallAvg = total ? Math.round((sum / total) * 10) / 10 : 0;
  const pos = responses.filter(r => r.sentiment === "positive").length;
  const neu = responses.filter(r => r.sentiment === "neutral").length;
  const neg = responses.filter(r => r.sentiment === "negative").length;
  const perQ = questions.map((q, qi) => {
    const dist = [0, 0, 0, 0, 0]; let s = 0, c = 0;
    responses.forEach(r => {
      let ans = []; try { ans = JSON.parse(r.answers || "[]"); } catch {}
      const a = ans.find(x => x.questionIndex === qi);
      if (a && a.rating >= 1 && a.rating <= 5) { dist[a.rating - 1]++; s += a.rating; c++; }
    });
    const avg = c ? Math.round((s / c) * 10) / 10 : 0;
    const maxd = Math.max(1, ...dist);
    return { text: q.text, dist, avg, maxd, cnt: c };
  });
  const opportunities = perQ.filter(q => q.cnt > 0 && q.avg < 3.5).sort((a, b) => a.avg - b.avg);
  const comments = responses.filter(r => (r.comment || "").trim() && r.sentiment !== "positive");
  const S = isAr ? { positive: "إيجابي", neutral: "محايد", negative: "سلبي" } : { positive: "Positive", neutral: "Neutral", negative: "Negative" };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isAr ? "تقرير الاستبيان" : "Survey report"} — {survey?.title}</DialogTitle></DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="animate-spin" /> <span className="mr-2">{isAr ? "جارٍ التحميل…" : "Loading…"}</span></div>
        ) : total === 0 ? (
          <div className="py-12 text-center text-muted-foreground">{isAr ? "لا توجد ردود بعد على هذا الاستبيان. شارك الرابط مع عملائك." : "No responses yet. Share the link with your clients."}</div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Mini label={isAr ? "إجمالي الردود" : "Responses"} value={total} />
              <Mini label={isAr ? "متوسط التقييم" : "Avg rating"} value={`${overallAvg.toFixed(1)} / 5`} star />
              <Mini label={isAr ? "إيجابي" : "Positive"} value={`${Math.round(pos / total * 100)}%`} cls="text-emerald-700" />
              <Mini label={isAr ? "سلبي" : "Negative"} value={`${Math.round(neg / total * 100)}%`} cls="text-rose-700" />
            </div>

            {opportunities.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="flex items-center gap-2 mb-2 font-semibold text-amber-800"><Lightbulb size={16} /> {isAr ? "فرص التحسين" : "Improvement opportunities"}</div>
                <ul className="space-y-1.5 text-sm">
                  {opportunities.map((q, i) => (
                    <li key={i} className="flex items-start gap-2"><TrendingDown size={14} className="mt-0.5 text-amber-600 shrink-0" /><span><span className="font-medium">{q.text}</span> — {isAr ? "متوسط" : "avg"} <b>{q.avg.toFixed(1)}</b> {isAr ? "(تحتاج تحسين)" : "(needs improvement)"}</span></li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-sm font-semibold">{isAr ? "تفصيل الأسئلة" : "Question breakdown"}</div>
              {perQ.map((q, i) => (
                <div key={i} className="rounded-xl border border-border bg-white p-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-sm font-medium">{i + 1}. {q.text}</div>
                    <div className="shrink-0 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(n => <Star key={n} size={15} className={n <= Math.round(q.avg) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />)}
                      <span className="text-xs font-bold ms-1">{q.avg.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 h-16">
                    {q.dist.map((c, n) => (
                      <div key={n} className="flex-1 flex flex-col items-center justify-end gap-1">
                        <div className="text-[10px] text-muted-foreground">{c}</div>
                        <div className="w-full rounded-t-md bg-violet-400" style={{ height: `${(c / q.maxd) * 100}%`, minHeight: c ? 4 : 0 }} />
                        <div className="text-[10px] text-muted-foreground">{n + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {comments.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold">{isAr ? "ملاحظات للمراجعة" : "Comments to review"}</div>
                <div className="space-y-2">
                  {comments.map((r) => (
                    <div key={r.id} className="rounded-xl border border-border bg-slate-50 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium">{r.tenant_name || "—"}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", r.sentiment === "negative" ? "bg-rose-100 text-rose-600" : "bg-slate-200 text-slate-600")}>{S[r.sentiment]}</span>
                      </div>
                      <div className="text-muted-foreground leading-relaxed">{r.comment}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
function Mini({ label, value, star, cls }) {
  return (
    <div className="rounded-xl border border-border bg-slate-50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-xl font-bold mt-0.5 flex items-center gap-1", cls)}>{star && <Star size={15} className="fill-amber-400 text-amber-400" />}{value}</div>
    </div>
  );
}