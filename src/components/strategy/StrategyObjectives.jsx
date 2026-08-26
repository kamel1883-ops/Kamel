import React from "react";
import { Target, User } from "lucide-react";
import { PILLARS, OBJECTIVES } from "@/lib/strategyPlan";

export default function StrategyObjectives({ isAr }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {isAr
          ? "كل هدف تشغيلي مرتبط مباشرة بأحد الأهداف الاستراتيجية الأربع، ومعه المستهدف الرقمي والمسؤول عنه."
          : "Every operational objective is linked to one of the four strategic pillars, with its numeric target and owner."}
      </p>
      {PILLARS.map((pl, i) => {
        const items = OBJECTIVES.filter((o) => o.pillar === pl.id);
        return (
          <div key={pl.id} className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="bg-[#0B2545] text-white px-5 py-3 flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-white/10 text-amber-300 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div>
                <div className="font-semibold text-sm">{isAr ? pl.ar : pl.en}</div>
                <div className="text-[11px] text-white/60">{isAr ? pl.ar_desc : pl.en_desc}</div>
              </div>
            </div>
            <div className="divide-y divide-border">
              {items.map((o, k) => (
                <div key={k} className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <Target size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <span className="text-sm">{isAr ? o.ar : o.en}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 font-medium">
                      {isAr ? o.target.ar : o.target.en}
                    </span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <User size={12} /> {isAr ? o.owner.ar : o.owner.en}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}