import React from "react";
import { Eye, Flag, Crosshair, MapPin, Sparkles, ShieldAlert } from "lucide-react";
import { IDENTITY, EDGE, PILLARS, RISKS } from "@/lib/strategyPlan";

const Block = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-2xl border border-border p-5">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
        <Icon size={18} className="text-amber-600" />
      </div>
      <h3 className="font-semibold">{title}</h3>
    </div>
    <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

export default function StrategyOverview({ isAr }) {
  const p = (o) => (isAr ? o.ar : o.en);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Block icon={Eye} title={isAr ? "الرؤية" : "Vision"}>{p(IDENTITY.vision)}</Block>
        <Block icon={Flag} title={isAr ? "الرسالة" : "Mission"}>{p(IDENTITY.mission)}</Block>
        <Block icon={Crosshair} title={isAr ? "التمركز التنافسي" : "Positioning"}>{p(IDENTITY.positioning)}</Block>
        <Block icon={MapPin} title={isAr ? "السوق المستهدف" : "Target market"}>
          <p>{p(IDENTITY.market)}</p>
          <p className="mt-2 text-foreground/80"><span className="font-medium">{isAr ? "العميل المثالي: " : "Ideal client: "}</span>{p(IDENTITY.icp)}</p>
        </Block>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-amber-600" />
          <h3 className="font-semibold">{isAr ? "الميزة التنافسية" : "Competitive edge"}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {EDGE.map((e, i) => (
            <div key={i} className="flex gap-2 text-sm rounded-xl bg-slate-50 border border-border p-3">
              <span className="text-amber-600 font-bold">{i + 1}</span>
              <span>{p(e)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">{isAr ? "الركائز الاستراتيجية الأربع" : "The four strategic pillars"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PILLARS.map((pl, i) => (
            <div key={pl.id} className="bg-white rounded-2xl border border-border p-5">
              <div className="w-9 h-9 rounded-xl bg-[#0B2545] text-amber-300 flex items-center justify-center font-bold text-sm mb-3">{i + 1}</div>
              <div className="font-semibold text-sm">{isAr ? pl.ar : pl.en}</div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{isAr ? pl.ar_desc : pl.en_desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={18} className="text-rose-600" />
          <h3 className="font-semibold">{isAr ? "المخاطر ومعالجتها" : "Risks & mitigation"}</h3>
        </div>
        <div className="space-y-2">
          {RISKS.map((r, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <div className="text-sm font-medium">{p(r)}</div>
              <div className="text-xs text-muted-foreground mt-1">{isAr ? "المعالجة: " : "Mitigation: "}{p(r.mitig)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}