import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle } from "lucide-react";
import { WARNING_LEVELS, categoryById, levelById } from "@/lib/laborPolicy";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function EmployeeWarnings({ employee, warnings: propWarnings }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "الإنذارات",
    subtitle: "الإنذارات الصادرة بحقك وفق سياسة العمل — تُرسل مباشرة بعد التحقيق ولا تتطلب موافقتك.",
    no: "لا توجد إنذارات.",
  } : {
    title: "Warnings",
    subtitle: "Warnings issued to you per labor policy — sent directly after investigation and do not require your approval.",
    no: "No warnings.",
  };

  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propWarnings) { setWarnings(propWarnings); setLoading(false); return; }
    if (!employee?.id) { setLoading(false); return; }
    let on = true;
    (async () => {
      try {
        const w = await base44.entities.Warning.filter({ employee_id: employee.id }, "-created_date", 200);
        if (on) setWarnings(w);
      } catch { if (on) setWarnings([]); }
      if (on) setLoading(false);
    })();
    return () => { on = false; };
  }, [employee?.id, propWarnings]);

  const counts = WARNING_LEVELS.map((l) => ({ ...l, n: warnings.filter((w) => w.warning_level === l.id).length }));

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">{t.title}</h3>
          <p className="text-xs text-muted-foreground">{t.subtitle}</p>
        </div>
        <span className="text-2xl font-bold text-rose-600">{warnings.length}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {counts.map((c) => (
          <span key={c.id} className={cn("text-xs px-3 py-1.5 rounded-full border font-medium", c.cls)}>
            {(isAr ? c.ar : c.en)}: {c.n}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="p-6 text-center text-muted-foreground text-sm">—</div>
      ) : warnings.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
          <AlertTriangle size={16} /> {t.no}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {warnings.map((w) => {
            const c = categoryById(w.violation_category, lang);
            const lv = levelById(w.warning_level, lang);
            return (
              <div key={w.id} className="py-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-medium text-sm">{c?.label || w.violation_category}</div>
                    <div className="text-xs text-muted-foreground mt-1">{w.incident_date || ""} {w.session_date ? `· ${isAr ? "الجلسة" : "Session"}: ${w.session_date}` : ""}</div>
                    {w.description && <p className="text-xs text-foreground mt-1.5 leading-relaxed line-clamp-3">{w.description}</p>}
                    {c?.article && <p className="text-xs text-muted-foreground mt-1">{c.article}</p>}
                  </div>
                  <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium shrink-0", lv.cls)}>{lv.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}