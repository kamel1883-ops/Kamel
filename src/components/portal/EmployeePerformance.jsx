import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const ratingCls = (r) =>
  r >= 4.5 ? "text-emerald-600 bg-emerald-50"
  : r >= 3.5 ? "text-blue-600 bg-blue-50"
  : r >= 2.5 ? "text-amber-600 bg-amber-50"
  : "text-rose-600 bg-rose-50";

export default function EmployeePerformance({ reviews }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const recLabel = isAr ? {
    none: { label: "بدون", cls: "bg-slate-100 text-slate-600" },
    maintain: { label: "إبقاء على الوضع", cls: "bg-blue-50 text-blue-600" },
    promote: { label: "ترقية", cls: "bg-emerald-50 text-emerald-600" },
    bonus: { label: "حافز", cls: "bg-violet-50 text-violet-600" },
    warn: { label: "إنذار", cls: "bg-amber-50 text-amber-600" },
    terminate: { label: "إنهاء", cls: "bg-rose-50 text-rose-600" },
  } : {
    none: { label: "None", cls: "bg-slate-100 text-slate-600" },
    maintain: { label: "Maintain", cls: "bg-blue-50 text-blue-600" },
    promote: { label: "Promote", cls: "bg-emerald-50 text-emerald-600" },
    bonus: { label: "Bonus", cls: "bg-violet-50 text-violet-600" },
    warn: { label: "Warn", cls: "bg-amber-50 text-amber-600" },
    terminate: { label: "Terminate", cls: "bg-rose-50 text-rose-600" },
  };
  const typeLabel = isAr
    ? { annual: "سنوي", midyear: "نصف سنوي", probation: "فترة التجربة", goal_setting: "تحديد الأهداف" }
    : { annual: "Annual", midyear: "Mid-year", probation: "Probation", goal_setting: "Goal setting" };
  const t = isAr ? {
    title: "تقييمات الأداء", empty: "لا توجد تقييمات أداء معتمدة حتى الآن.",
    period: (y, p) => `${y} · ${typeLabel[p] || p}`,
    overall: "التقييم الكلي", rec: "التوصية",
    strengths: "نقاط القوة", improvements: "فرص التحسين", reviewDate: "تاريخ التقييم",
    completed: "مكتملة", acknowledged: "معتمدة",
  } : {
    title: "Performance Reviews", empty: "No approved performance reviews yet.",
    period: (y, p) => `${y} · ${typeLabel[p] || p}`,
    overall: "Overall rating", rec: "Recommendation",
    strengths: "Strengths", improvements: "Improvements", reviewDate: "Review date",
    completed: "Completed", acknowledged: "Acknowledged",
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Star size={16} className="text-violet-600" /> {t.title}
      </h3>
      {(!reviews || reviews.length === 0) ? (
        <div className="text-center text-muted-foreground text-sm py-6">{t.empty}</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const rec = recLabel[r.recommendation] || recLabel.none;
            const st = r.status === "acknowledged" ? t.acknowledged : t.completed;
            const overall = Number(r.overall_rating) || 0;
            return (
              <div key={r.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{t.period(r.period_year, r.review_type)}</div>
                    {r.review_date && (
                      <div className="text-xs text-muted-foreground mt-0.5">{t.reviewDate}: {r.review_date}</div>
                    )}
                  </div>
                  {overall > 0 && (
                    <span className={cn("shrink-0 text-xs font-bold px-2 py-1 rounded-full", ratingCls(overall))}>
                      {Math.round(overall * 10) / 10} / 5
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className={cn("text-xs px-2 py-1 rounded-full font-medium", rec.cls)}>
                    {t.rec}: {rec.label}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600">{st}</span>
                </div>
                {r.strengths && (
                  <div className="mt-3 text-sm">
                    <div className="text-xs font-medium text-muted-foreground mb-1">{t.strengths}</div>
                    <div className="leading-relaxed whitespace-pre-wrap">{r.strengths}</div>
                  </div>
                )}
                {r.improvements && (
                  <div className="mt-2 text-sm">
                    <div className="text-xs font-medium text-muted-foreground mb-1">{t.improvements}</div>
                    <div className="leading-relaxed whitespace-pre-wrap">{r.improvements}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}