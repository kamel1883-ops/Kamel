import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import ActualFinance from "@/components/strategy/ActualFinance";
import StrategyOverview from "@/components/strategy/StrategyOverview";
import StrategyObjectives from "@/components/strategy/StrategyObjectives";
import StrategyKpis from "@/components/strategy/StrategyKpis";
import GrowthTargets from "@/components/strategy/GrowthTargets";
import MarketingPlan from "@/components/strategy/MarketingPlan";

// الخطة الاستراتيجية بالعربية فقط — مهيّأة للطباعة اليدوية من قِبل المالك.
const TABS = [
  { id: "finance", label: "الوضع المالي الفعلي" },
  { id: "overview", label: "الخطة الاستراتيجية" },
  { id: "objectives", label: "الأهداف المرتبطة" },
  { id: "kpis", label: "مؤشرات الأداء" },
  { id: "growth", label: "مستهدف العملاء والإيراد" },
  { id: "marketing", label: "التوصيات التسويقية" },
];

export default function StrategicPlan() {
  const [tab, setTab] = useState("finance");

  return (
    <div dir="rtl" className="print-report">
      <PageHeader
        title="الخطة الاستراتيجية للعمل"
        subtitle="خطة مبنية على أرقامك الفعلية من العمليات المالية في بوابة المالك: الإيرادات، المصروفات التشغيلية، وعمولة الشركاء 7%"
        action={
          <Button variant="outline" onClick={() => window.print()} className="gap-2 no-print">
            <Printer size={17} /> طباعة
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-5 no-print">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium border transition",
              tab === t.id ? "bg-[#0B2545] text-white border-[#0B2545]" : "bg-white text-muted-foreground border-border hover:border-amber-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "finance" && <ActualFinance />}
      {tab === "overview" && <StrategyOverview isAr />}
      {tab === "objectives" && <StrategyObjectives isAr />}
      {tab === "kpis" && <StrategyKpis isAr />}
      {tab === "growth" && <GrowthTargets isAr />}
      {tab === "marketing" && <MarketingPlan isAr />}
    </div>
  );
}