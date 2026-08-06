import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import PerformanceForm from "@/components/PerformanceForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus, Pencil, Trash2, Star, Target, TrendingUp, Award, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { todayISO } from "@/lib/hr";

const recLabel = {
  none: { label: "بدون", cls: "bg-slate-100 text-slate-600" },
  maintain: { label: "إبقاء", cls: "bg-blue-50 text-blue-600" },
  promote: { label: "ترقية", cls: "bg-emerald-50 text-emerald-600" },
  bonus: { label: "حافز", cls: "bg-violet-50 text-violet-600" },
  warn: { label: "إنذار", cls: "bg-amber-50 text-amber-600" },
  terminate: { label: "إنهاء", cls: "bg-rose-50 text-rose-600" },
};
const statusLabel = {
  draft: { label: "مسودة", cls: "bg-slate-100 text-slate-600" },
  submitted: { label: "مُرسلة", cls: "bg-blue-50 text-blue-600" },
  acknowledged: { label: "معتمدة", cls: "bg-violet-50 text-violet-600" },
  completed: { label: "مكتملة", cls: "bg-emerald-50 text-emerald-600" },
};
const ratingCls = (r) =>
  r >= 4.5 ? "text-emerald-600 bg-emerald-50" :
  r >= 3.5 ? "text-blue-600 bg-blue-50" :
  r >= 2.5 ? "text-amber-600 bg-amber-50" :
  "text-rose-600 bg-rose-50";

export default function Performance() {
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
    setReviews(r);
    setEmployees(e);
    try { setUser(await base44.auth.me()); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await base44.entities.Performance.delete(id);
    load();
  };

  // المسارات الوظيفية: تجميع الموظفين النشطين حسب الدرجة الوظيفية + ترشيحات الترقية
  const gradeLadder = (() => {
    const map = {};
    for (const e of employees) {
      if (e.status !== "active" && e.status !== "on_leave") continue;
      const g = e.job_grade || "غير محدد";
      if (!map[g]) map[g] = [];
      map[g].push(e);
    }
    return Object.entries(map).map(([grade, emps]) => ({ grade, emps })).sort((a, b) => b.emps.length - a.emps.length);
  })();

  const promotionCandidates = reviews
    .filter((r) => r.promotion_ready || r.recommendation === "promote")
    .filter((r, i, arr) => arr.findIndex((x) => x.employee_id === r.employee_id) === i);

  return (
    <div>
      <PageHeader
        title="الأداء والمسارات الوظيفية"
        subtitle="تقييم الأداء الدوري وإدارة المسارات الوظيفية والترقيات"
        action={
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
            <Plus size={18} /> تقييم جديد
          </Button>
        }
      />

      <Tabs defaultValue="reviews" className="mt-2">
        <TabsList>
          <TabsTrigger value="reviews">تقييمات الأداء</TabsTrigger>
          <TabsTrigger value="paths">المسارات الوظيفية</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>
          ) : reviews.length === 0 ? (
            <div className="p-14 text-center bg-white rounded-2xl border border-border">
              <Star size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-muted-foreground">لا توجد تقييمات بعد — ابدأ بإنشاء تقييم أداء جديد</p>
            </div>
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
                        <div className="text-xs text-muted-foreground">{r.department} • {r.period_year} / {r.review_period}</div>
                      </div>
                      {r.overall_rating > 0 && (
                        <span className={cn("shrink-0 text-xs font-bold px-2 py-1 rounded-full", ratingCls(r.overall_rating))}>
                          {Math.round(r.overall_rating * 10) / 10} / 5
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", rec.cls)}>{rec.label}</span>
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", st.cls)}>{st.label}</span>
                      {r.promotion_ready && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600 flex items-center gap-1">
                          <ArrowUpRight size={12} /> جاهز للترقية
                        </span>
                      )}
                    </div>
                    {(r.target_grade || r.current_grade) && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Target size={14} />
                        {r.current_grade || "—"} ← <span className="font-medium text-foreground">{r.target_grade || "—"}</span>
                      </div>
                    )}
                    {r.goals && <p className="text-xs text-muted-foreground line-clamp-2">{r.goals}</p>}
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-xs text-muted-foreground">{r.review_date || ""}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(r); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500">
                          <Trash2 size={15} />
                        </button>
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
              <h3 className="text-sm font-semibold flex items-center gap-2"><TrendingUp size={16} /> سلم الدرجات الوظيفية</h3>
              {gradeLadder.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground bg-white rounded-2xl border border-border text-sm">لا توجد بيانات درجات وظيفية</div>
              ) : gradeLadder.map(({ grade, emps }) => (
                <div key={grade} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">{grade}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{emps.length} موظف</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {emps.map((e) => (
                      <span key={e.id} className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-border">
                        {e.employee_number} - {e.position}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Award size={16} /> مرشحو الترقية</h3>
              {promotionCandidates.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground bg-white rounded-2xl border border-border text-sm">لا يوجد مرشحون للترقية حالياً</div>
              ) : promotionCandidates.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{r.employee_name}</div>
                    <div className="text-xs text-muted-foreground">{r.department}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Target size={12} /> {r.current_grade || "—"} → {r.target_grade || "—"}
                    </div>
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

      <PerformanceForm
        open={showForm}
        employees={employees}
        editing={editing}
        user={user}
        onClose={() => setShowForm(false)}
        onSaved={load}
      />
    </div>
  );
}