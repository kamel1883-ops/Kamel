import React from "react";
import { Gauge } from "lucide-react";
import { PILLARS, KPIS } from "@/lib/strategyPlan";

export default function StrategyKpis({ isAr }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.slice(0, 4).map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border p-5">
            <Gauge size={18} className="text-amber-600" />
            <div className="text-2xl font-bold mt-2" dir="ltr">{k.target}</div>
            <div className="text-[11px] text-muted-foreground">{isAr ? k.unit.ar : k.unit.en}</div>
            <div className="text-sm font-medium mt-1.5">{isAr ? k.ar : k.en}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">{isAr ? "مؤشرات قياس الأداء الكاملة (KPIs)" : "Full KPI set"}</h3>
          <p className="text-xs text-muted-foreground">{isAr ? "المؤشر — الهدف الاستراتيجي المرتبط — المستهدف — دورية القياس" : "Metric — linked pillar — target — measurement frequency"}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-start p-3">{isAr ? "المؤشر" : "Metric"}</th>
                <th className="text-start p-3">{isAr ? "الهدف الاستراتيجي" : "Pillar"}</th>
                <th className="text-start p-3">{isAr ? "المستهدف" : "Target"}</th>
                <th className="text-start p-3">{isAr ? "دورية القياس" : "Frequency"}</th>
              </tr>
            </thead>
            <tbody>
              {KPIS.map((k, i) => {
                const pl = PILLARS.find((p) => p.id === k.pillar);
                return (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 font-medium">{isAr ? k.ar : k.en}</td>
                    <td className="p-3 text-xs text-muted-foreground">{pl ? (isAr ? pl.ar : pl.en) : "—"}</td>
                    <td className="p-3">
                      <span className="font-bold" dir="ltr">{k.target}</span>{" "}
                      <span className="text-xs text-muted-foreground">{isAr ? k.unit.ar : k.unit.en}</span>
                    </td>
                    <td className="p-3 text-xs">{isAr ? k.freq.ar : k.freq.en}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}