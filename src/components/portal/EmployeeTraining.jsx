import React from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalT } from "@/lib/portalI18n";

// قسم الخطط التدريبية والتطوير في بوابة الموظف — يعرض خطط الموظف الجارية/المكتملة
const STATUS_CLS = {
  draft: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-50 text-amber-600",
  completed: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-rose-50 text-rose-600",
};

export default function EmployeeTraining({ trainings }) {
  const t = usePortalT("training");

  const list = (trainings || []).filter((p) => p.status !== "cancelled" && p.status !== "draft");

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <GraduationCap size={16} className="text-violet-600" /> {t.title}
      </h3>
      {list.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm py-6">{t.empty}</div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="font-medium text-sm">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {(p.start_date || p.end_date) ? `${t.period}: ${p.start_date || "—"} ← ${p.end_date || "—"}` : ""}
                    {p.department ? ` · ${t.dept}: ${p.department}` : ""}
                  </div>
                </div>
                <span className={cn("shrink-0 text-xs px-2 py-1 rounded-full font-medium", STATUS_CLS[p.status] || STATUS_CLS.draft)}>
                  {t.status[p.status] || p.status}
                </span>
              </div>
              {p.goal && <div className="mt-2 text-sm"><span className="text-xs font-medium text-muted-foreground">{t.goal}: </span>{p.goal}</div>}
              {p.mechanism && <div className="mt-1 text-sm"><span className="text-xs font-medium text-muted-foreground">{t.mechanism}: </span>{p.mechanism}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}