import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import StrategyOverview from "@/components/strategy/StrategyOverview";
import StrategyObjectives from "@/components/strategy/StrategyObjectives";
import StrategyKpis from "@/components/strategy/StrategyKpis";
import GrowthTargets from "@/components/strategy/GrowthTargets";
import MarketingPlan from "@/components/strategy/MarketingPlan";

export default function StrategicPlan() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [tab, setTab] = useState("overview");

  const TABS = [
    { id: "overview", ar: "الخطة الاستراتيجية", en: "Strategic plan" },
    { id: "objectives", ar: "الأهداف المرتبطة", en: "Linked objectives" },
    { id: "kpis", ar: "مؤشرات الأداء", en: "KPIs" },
    { id: "growth", ar: "مستهدف العملاء والإيراد", en: "Client & revenue targets" },
    { id: "marketing", ar: "التوصيات التسويقية", en: "Marketing recommendations" },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader
        title={isAr ? "الخطة الاستراتيجية للعمل" : "Business strategic plan"}
        subtitle={isAr
          ? "خطة عمل متكاملة لإدارة منصة جدارة — رؤية ورسالة، أهداف استراتيجية وتشغيلية، مؤشرات قياس، مستهدف عملاء وإيراد، وتوصيات تسويقية"
          : "A complete plan to run Jadara — vision, strategic and operational objectives, KPIs, client & revenue targets, and marketing recommendations"}
        action={
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer size={17} /> {isAr ? "طباعة" : "Print"}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium border transition",
              tab === t.id ? "bg-[#0B2545] text-white border-[#0B2545]" : "bg-white text-muted-foreground border-border hover:border-amber-300"
            )}
          >
            {isAr ? t.ar : t.en}
          </button>
        ))}
      </div>

      {tab === "overview" && <StrategyOverview isAr={isAr} />}
      {tab === "objectives" && <StrategyObjectives isAr={isAr} />}
      {tab === "kpis" && <StrategyKpis isAr={isAr} />}
      {tab === "growth" && <GrowthTargets isAr={isAr} />}
      {tab === "marketing" && <MarketingPlan isAr={isAr} />}
    </div>
  );
}