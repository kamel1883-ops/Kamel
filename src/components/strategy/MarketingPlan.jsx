import React from "react";
import { Megaphone, TrendingUp } from "lucide-react";
import { CHANNELS } from "@/lib/strategyPlan";

export default function MarketingPlan({ isAr }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {isAr
          ? "قنوات التسويق الموصى بها لمنصة جدارة — لكل قناة الفكرة التنفيذية ومؤشر النجاح الخاص بها."
          : "Recommended marketing channels for Jadara — each with its execution idea and success metric."}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CHANNELS.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Megaphone size={17} className="text-amber-600" />
              </div>
              <h3 className="font-semibold text-sm">{isAr ? c.ar : c.en}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{isAr ? c.ar_desc : c.en_desc}</p>
            <div className="mt-3 inline-flex items-start gap-1.5 text-xs rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2">
              <TrendingUp size={13} className="mt-0.5 shrink-0" />
              <span>{isAr ? c.ar_kpi : c.en_kpi}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}