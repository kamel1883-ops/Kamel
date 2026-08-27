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

// الخطة الاستراتيجية بالعربية فقط — خارج النظام تماماً (مستند خاص بالمالك).
// تظهر التبويبات على الشاشة للتصفّح، وعند الطباعة يُطبع كل قسم في صفحة مستقلة
// دون أن يتداخل موضوع بين صفحتين — تماماً كآلية البروشور.
const SECTIONS = [
  { id: "finance", label: "الوضع المالي الفعلي", Comp: ActualFinance },
  { id: "overview", label: "الخطة الاستراتيجية", Comp: StrategyOverview, props: { isAr: true } },
  { id: "objectives", label: "الأهداف المرتبطة", Comp: StrategyObjectives, props: { isAr: true } },
  { id: "kpis", label: "مؤشرات الأداء", Comp: StrategyKpis, props: { isAr: true } },
  { id: "growth", label: "مستهدف العملاء والإيراد", Comp: GrowthTargets, props: { isAr: true } },
  { id: "marketing", label: "التوصيات التسويقية", Comp: MarketingPlan, props: { isAr: true } },
];

export default function StrategicPlan() {
  const [tab, setTab] = useState("finance");

  return (
    <div dir="rtl" className="print-strategy min-h-screen bg-background p-4 sm:p-6 lg:p-9">
      <PageHeader
        title="الخطة الاستراتيجية للعمل"
        subtitle="خطة مبنية على أرقامك الفعلية من العمليات المالية في بوابة المالك: الإيرادات، المصروفات التشغيلية، وعمولة الشركاء 7%"
        action={
          <Button variant="outline" onClick={() => window.print()} className="gap-2 no-print">
            <Printer size={17} /> طباعة
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6 no-print">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium border transition",
              tab === s.id ? "bg-[#0B2545] text-white border-[#0B2545]" : "bg-white text-muted-foreground border-border hover:border-amber-300"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* كل قسم في صفحة مستقلة عند الطباعة؛ على الشاشة يظهر القسم النشط فقط */}
      {SECTIONS.map((s) => {
        const Comp = s.Comp;
        return (
          <section
            key={s.id}
            className={cn(
              "bg-white rounded-2xl border border-border p-5 sm:p-7",
              tab === s.id ? "block print-page" : "hidden print-page"
            )}
          >
            <h2 className="text-lg font-bold text-[#0B2545] mb-4 pb-2 border-b border-amber-200 print-title">
              {s.label}
            </h2>
            <div className="print-body">
              <Comp {...(s.props || {})} />
            </div>
          </section>
        );
      })}
    </div>
  );
}