import React from "react";
import { Check, Sparkles, ChevronLeft } from "lucide-react";
import { PRICING_TIERS_AR, PRICING_TIERS_EN, FULL_FEATURES_AR, FULL_FEATURES_EN } from "@/lib/pricing";

// بطاقات الباقات في صفحة الدفع — كل باقة تعرض نفس قائمة المميزات الكاملة (متوفرة في كل باقة بدون استثناء).
// تختلف الباقات فقط في: اسم الشريحة، نطاق الموظفين، السعر السنوي، وزر الشراء.
// البطاقات تتمدّد للأسفل لتسع كل المميزات.
export default function PricingTiers({ selectedId, onBuy, lang = "ar" }) {
  const isAr = lang === "ar";
  const tiers = isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN;
  const feats = isAr ? FULL_FEATURES_AR : FULL_FEATURES_EN;
  const currency = isAr ? "ريال" : "SAR";
  const featuresTitle = isAr ? "تشمل الباقة كل المميزات:" : "Every feature included:";
  const head = isAr ? (
    <>اختر الباقة المناسبة <span className="bg-gradient-to-l from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">لمؤسستك</span></>
  ) : (
    <>Choose the plan that fits <span className="bg-gradient-to-l from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">your organization</span></>
  );
  const sub = isAr
    ? "كل باقة تشمل جميع ميزات المنصة كاملة — الفرق فقط في شريحة عدد الموظفين والسعر السنوي. اضغط زر الشراء لتأكيد الباقة."
    : "Every plan includes the full platform feature set — only the headcount tier and annual price differ. Click buy to confirm your plan.";

  return (
    <div className="mb-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          {isAr ? "الباقات والأسعار" : "Plans & Pricing"}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-2" style={{ fontFamily: "var(--font-display)" }}>{head}</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">{sub}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 items-start">
        {tiers.map((t) => {
          const active = selectedId === t.id;
          return (
            <div
              key={t.id}
              className={`flex flex-col rounded-3xl bg-white border p-6 transition shadow-sm ${active ? "border-violet-500 ring-2 ring-violet-300 shadow-lg" : "border-border hover:border-violet-300 hover:shadow-md"}`}
            >
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 bg-gradient-to-l from-violet-600 to-fuchsia-600 text-white">
                  <Sparkles size={12} /> {t.tier}
                </span>
              </div>

              <div className="mt-4 text-center">
                <div className="flex items-end justify-center gap-1.5">
                  <span className="text-3xl font-extrabold bg-gradient-to-l from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{t.yearly.toLocaleString()}{t.custom ? "+" : ""}</span>
                  <span className="text-sm font-medium text-muted-foreground mb-1">{currency}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{isAr ? "/ سنوياً" : "/ year"}</div>
              </div>

              <div className="mt-3 rounded-xl bg-violet-50/70 border border-violet-100 px-3 py-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{isAr ? "إجمالي السنة الأولى" : "Year 1 total"}</span>
                  <span className="font-extrabold text-violet-700">
                    {t.custom ? (isAr ? "تأثير خاص" : "Custom") : `${t.year1.toLocaleString()} ${currency}`}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="text-xs text-muted-foreground">{isAr ? "نطاق الموظفين" : "Headcount"}</div>
                <div className="font-bold text-foreground">{t.range}</div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">{t.note}</p>

              {/* المميزات الكاملة — نفسها في كل باقة */}
              <div className="mt-4 pt-4 border-t border-border flex-1">
                <div className="text-xs font-bold text-foreground mb-3">{featuresTitle}</div>
                <ul className="grid grid-cols-1 gap-1.5">
                  {feats.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px]">
                      <span className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-violet-100 shrink-0">
                        <Check size={11} className="text-violet-600" />
                      </span>
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onBuy?.(t)}
                className={`mt-5 w-full rounded-2xl py-3.5 font-bold transition shadow-md inline-flex items-center justify-center gap-1 ${active ? "bg-gradient-to-l from-violet-700 to-fuchsia-700 text-white shadow-violet-500/30" : "bg-gradient-to-l from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-violet-500/20"}`}
              >
                {active ? (isAr ? "الباقة المختارة — أكمل البيانات" : "Selected — complete details") : (isAr ? "شراء هذه الباقة" : "Buy this plan")}
                {!active && <ChevronLeft size={15} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}