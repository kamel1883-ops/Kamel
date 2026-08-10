import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Star } from "lucide-react";

const SENTIMENT_AR = {
  positive: { label: "إيجابي", cls: "bg-emerald-50 text-emerald-600" },
  neutral: { label: "محايد", cls: "bg-slate-100 text-slate-600" },
  negative: { label: "سلبي", cls: "bg-rose-50 text-rose-600" },
};
const SENTIMENT_EN = {
  positive: { label: "Positive", cls: "bg-emerald-50 text-emerald-600" },
  neutral: { label: "Neutral", cls: "bg-slate-100 text-slate-600" },
  negative: { label: "Negative", cls: "bg-rose-50 text-rose-600" },
};

function RatingStars({ avg }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={16} className={n <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
      ))}
      <span className="text-sm font-bold mr-1">{avg.toFixed(1)}</span>
    </div>
  );
}

export default function CustomerSurveyReport({ open, onClose, survey, isAr }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!open || !survey) return;
    setLoading(true);
    (async () => {
      try {
        const r = await base44.entities.CustomerSurveyResponse.filter({ survey_id: survey.id });
        setResponses(r || []);
        let qs = [];
        try { qs = JSON.parse(survey.questions || "[]"); } catch {}
        setQuestions(qs);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, survey]);

  const total = responses.length;
  const overallAvg = total ? Math.round((responses.reduce((s, r) => s + (r.avg_rating || 0), 0) / total) * 10) / 10 : 0;
  const smap = isAr ? SENTIMENT_AR : SENTIMENT_EN;
  const posCount = responses.filter(r => r.sentiment === "positive").length;
  const neuCount = responses.filter(r => r.sentiment === "neutral").length;
  const negCount = responses.filter(r => r.sentiment === "negative").length;

  // per-question distribution
  const perQ = questions.map((q, qi) => {
    const dist = [0, 0, 0, 0, 0];
    let sum = 0, cnt = 0;
    responses.forEach(r => {
      let ans = [];
      try { ans = JSON.parse(r.answers || "[]"); } catch {}
      const a = ans.find(x => x.questionIndex === qi);
      if (a && a.rating >= 1 && a.rating <= 5) { dist[a.rating - 1] += 1; sum += a.rating; cnt += 1; }
    });
    const avg = cnt ? Math.round((sum / cnt) * 10) / 10 : 0;
    const maxd = Math.max(1, ...dist);
    return { text: q.text, dist, avg, maxd, cnt };
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isAr ? "تقرير الاستبيان" : "Survey report"} — {survey?.title}</DialogTitle></DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="animate-spin" /> <span className="mr-2">{isAr ? "جارٍ التحميل..." : "Loading..."}</span></div>
        ) : total === 0 ? (
          <div className="py-12 text-center text-muted-foreground">{isAr ? "لا توجد ردود بعد على هذا الاستبيان." : "No responses yet."}</div>
        ) : (
          <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-slate-50 p-3">
                <div className="text-xs text-muted-foreground">{isAr ? "إجمالي الردود" : "Responses"}</div>
                <div className="text-2xl font-bold">{total}</div>
              </div>
              <div className="rounded-xl border border-border bg-slate-50 p-3">
                <div className="text-xs text-muted-foreground">{isAr ? "متوسط التقييم" : "Avg rating"}</div>
                <div className="mt-1"><RatingStars avg={overallAvg} /></div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-xs text-emerald-600">{isAr ? "إيجابي" : "Positive"}</div>
                <div className="text-xl font-bold text-emerald-700">{Math.round(posCount / total * 100)}% <span className="text-xs font-normal">({posCount})</span></div>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <div className="text-xs text-rose-600">{isAr ? "سلبي" : "Negative"}</div>
                <div className="text-xl font-bold text-rose-700">{Math.round(negCount / total * 100)}% <span className="text-xs font-normal">({negCount})</span></div>
              </div>
            </div>

            {/* Per question */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">{isAr ? "تفصيل الأسئلة" : "Question breakdown"}</div>
              {perQ.map((q, i) => (
                <div key={i} className="rounded-xl border border-border bg-white p-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-sm font-medium">{i + 1}. {q.text}</div>
                    <div className="shrink-0"><RatingStars avg={q.avg} /></div>
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

            {/* Responses table */}
            <div className="space-y-2">
              <div className="text-sm font-semibold">{isAr ? "الردود الفردية" : "Individual responses"}</div>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-muted-foreground text-xs">
                      <tr>
                        <th className="text-right font-medium px-3 py-2">{isAr ? "المنشأة" : "Company"}</th>
                        <th className="text-right font-medium px-3 py-2">{isAr ? "التاريخ" : "Date"}</th>
                        <th className="text-right font-medium px-3 py-2">{isAr ? "المتوسط" : "Avg"}</th>
                        <th className="text-right font-medium px-3 py-2">{isAr ? "الانطباع" : "Sentiment"}</th>
                        <th className="text-right font-medium px-3 py-2">{isAr ? "ملاحظة" : "Comment"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {responses.map((r) => {
                        const s = smap[r.sentiment] || smap.neutral;
                        return (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-medium truncate max-w-[160px]">{r.tenant_name || "—"}</td>
                            <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.submitted_date || "—"}</td>
                            <td className="px-3 py-2 whitespace-nowrap"><RatingStars avg={r.avg_rating} /></td>
                            <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span></td>
                            <td className="px-3 py-2 text-muted-foreground text-xs max-w-[200px] truncate" title={r.comment || ""}>{r.comment || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}