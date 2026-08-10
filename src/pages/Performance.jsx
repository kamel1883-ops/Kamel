import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import PerformanceForm from "@/components/PerformanceForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Star, Target, TrendingUp, Award, ArrowUpRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayISO } from "@/lib/hr";
import { useI18n } from "@/lib/i18n";

export default function Performance() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const recLabel = isAr ? {
    none: { label: "بدون", cls: "bg-slate-100 text-slate-600" }, maintain: { label: "إبقاء", cls: "bg-blue-50 text-blue-600" },
    promote: { label: "ترقية", cls: "bg-emerald-50 text-emerald-600" }, bonus: { label: "حافز", cls: "bg-violet-50 text-violet-600" },
    warn: { label: "إنذار", cls: "bg-amber-50 text-amber-600" }, terminate: { label: "إنهاء", cls: "bg-rose-50 text-rose-600" },
  } : {
    none: { label: "None", cls: "bg-slate-100 text-slate-600" }, maintain: { label: "Maintain", cls: "bg-blue-50 text-blue-600" },
    promote: { label: "Promote", cls: "bg-emerald-50 text-emerald-600" }, bonus: { label: "Bonus", cls: "bg-violet-50 text-violet-600" },
    warn: { label: "Warn", cls: "bg-amber-50 text-amber-600" }, terminate: { label: "Terminate", cls: "bg-rose-50 text-rose-600" },
  };
  const statusLabel = isAr ? {
    draft: { label: "مسودة", cls: "bg-slate-100 text-slate-600" }, submitted: { label: "مُرسلة", cls: "bg-blue-50 text-blue-600" },
    acknowledged: { label: "معتمدة", cls: "bg-violet-50 text-violet-600" }, completed: { label: "مكتملة", cls: "bg-emerald-50 text-emerald-600" },
  } : {
    draft: { label: "Draft", cls: "bg-slate-100 text-slate-600" }, submitted: { label: "Submitted", cls: "bg-blue-50 text-blue-600" },
    acknowledged: { label: "Acknowledged", cls: "bg-violet-50 text-violet-600" }, completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-600" },
  };
  const ratingCls = (r) => r >= 4.5 ? "text-emerald-600 bg-emerald-50" : r >= 3.5 ? "text-blue-600 bg-blue-50" : r >= 2.5 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50";
  const t = isAr ? {
    title: "الأداء والمسارات الوظيفية", subtitle: "تقييم الأداء الدوري وإدارة المسارات الوظيفية والترقيات", add: "تقييم جديد",
    tabReviews: "تقييمات الأداء", tabPaths: "المسارات الوظيفية",
    loading: "جارٍ التحميل...", empty: "لا توجد تقييمات بعد — ابدأ بإنشاء تقييم أداء جديد",
    ready: "جاهز للترقية", noGrade: "غير محدد", perYear: (y, p) => `${y} / ${p}`,
    ladderH: "سلم الدرجات الوظيفية", gradeEmpty: "لا توجد بيانات درجات وظيفية", empCount: (n) => `${n} موظف`,
    promoH: "مرشحو الترقية", promoEmpty: "لا يوجد مرشحون للترقية حالياً",
    reopen: "إعادة التقييم", reopenAsk: "سيُعاد فتح هذا التقييم كمسودة لإعادة التقييم. متابعة؟",
  } : {
    title: "Performance & career paths", subtitle: "Periodic performance reviews and career path management", add: "New review",
    tabReviews: "Performance reviews", tabPaths: "Career paths",
    loading: "Loading...", empty: "No reviews yet — create a new performance review",
    ready: "Promotion ready", noGrade: "Unspecified", perYear: (y, p) => `${y} / ${p}`,
    ladderH: "Job grade ladder", gradeEmpty: "No job grade data", empCount: (n) => `${n} employees`,
    promoH: "Promotion candidates", promoEmpty: "No promotion candidates currently",
    reopen: "Re-evaluate", reopenAsk: "This review will be reopened as a draft for re-evaluation. Continue?",
  };

  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const [r, e] = await Promise.all([
      base44.entities.Performance.list("-created_date", 500),
      base44.entities.Employee.list("-created_date", 500),
    ]);
    setReviews(r); setEmployees(e);
    try { setUser(await base44.auth.me()); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => { await base44.entities.Performance.delete(id); load(); };
  const reopen = async (r) => {
    if (!window.confirm(t.reopenAsk)) return;
    await base44.entities.Performance.update(r.id, { status: "draft" });
    load();
  };

  const gradeLadder = (() => {
    const map = {};
    for (const e of employees) {
      if (e.status !== "active" && e.status !== "on_leave") continue;
      const g = e.job_grade || t.noGrade;
      if (!map[g]) map[g] = [];
      map[g].push(e);
    }
    return Object.entries(map).map(([grade, emps]) => ({ grade, emps })).sort((a, b) => b.emps.length - a.emps.length);
  })();

  const promotionCandidates = reviews.filter((r) => r.promotion_ready || r.recommendation === "promote").filter((r, i, arr) => arr.findIndex((x) => x.employee_id === r.employee_id) === i);

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} action={<Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2"><Plus size={18} /> {t.add}</Button>} />

      <Tabs defaultValue="reviews" className="mt-2">
        <TabsList>
          <TabsTrigger value="reviews">{t.tabReviews}</TabsTrigger>
          <TabsTrigger value="paths">{t.tabPaths}</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
          ) : reviews.length === 0 ? (
            <div className="p-14 text-center bg-white rounded-2xl border border-border"><Star size={40} className="mx-auto text-slate-300 mb-3" /><p className="text-muted-foreground">{t.empty}</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((r) => {
                const rec = recLabel[r.recommendation] || recLabel.none;
                const st = statusLabel[r.status] || statusLabel.draft;
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-border p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{r.employee_name}</div>
                        <div className="text-xs text-muted-foreground">{r.department} • {t.perYear(r.period_year, r.review_period)}</div>
                      </div>
                      {r.overall_rating > 0 && (<span className={cn("shrink-0 text-xs font-bold px-2 py-1 rounded-full", ratingCls(r.overall_rating))}>{Math.round(r.overall_rating * 10) / 10} / 5</span>)}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", rec.cls)}>{rec.label}</span>
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", st.cls)}>{st.label}</span>
                      {r.promotion_ready && (<span className="text-xs px-2 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600 flex items-center gap-1"><ArrowUpRight size={12} /> {t.ready}</span>)}
                    </div>
                    {(r.target_grade || r.current_grade) && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Target size={14} />{r.current_grade || "—"} ← <span className="font-medium text-foreground">{r.target_grade || "—"}</span></div>
                    )}
                    {r.review_type === "goal_setting"
                      ? (r.personal_goals || r.behaviors || r.tasks_coverage) && <p className="text-xs text-muted-foreground line-clamp-2">{r.personal_goals || r.behaviors || r.tasks_coverage}</p>
                      : r.goals && <p className="text-xs text-muted-foreground line-clamp-2">{r.goals}</p>}
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-xs text-muted-foreground">{r.review_date || ""}</span>
                      <div className="flex gap-1">
                        {(r.status === "acknowledged" || r.status === "completed") && (
                          <button onClick={() => reopen(r)} title={t.reopen} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" aria-label={t.reopen}><RotateCcw size={15} /></button>
                        )}
                        <button onClick={() => { setEditing(r); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={15} /></button>
                        <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paths">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><TrendingUp size={16} /> {t.ladderH}</h3>
              {gradeLadder.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground bg-white rounded-2xl border border-border text-sm">{t.gradeEmpty}</div>
              ) : gradeLadder.map(({ grade, emps }) => (
                <div key={grade} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">{grade}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{t.empCount(emps.length)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {emps.map((e) => (<span key={e.id} className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-border">{e.employee_number} - {e.position}</span>))}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Award size={16} /> {t.promoH}</h3>
              {promotionCandidates.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground bg-white rounded-2xl border border-border text-sm">{t.promoEmpty}</div>
              ) : promotionCandidates.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{r.employee_name}</div>
                    <div className="text-xs text-muted-foreground">{r.department}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Target size={12} /> {r.current_grade || "—"} → {r.target_grade || "—"}</div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className={cn("text-sm font-bold", ratingCls(r.overall_rating))}>{Math.round(r.overall_rating * 10) / 10}/5</div>
                    <div className="text-xs text-muted-foreground">{r.period_year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <PerformanceForm open={showForm} employees={employees} editing={editing} user={user} onClose={() => setShowForm(false)} onSaved={load} />
    </div>
  );
}