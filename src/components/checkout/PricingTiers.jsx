import React from "react";
import { Check, Sparkles } from "lucide-react";
import { PRICING_TIERS_AR, PRICING_TIERS_EN } from "@/lib/pricing";

// ميزات تراكمية حسب الشريحة — كل شريحة تشمل ميزات ما قبلها + إضافات.
const FEATURES_AR = {
  micro: ["إدارة الموظفين وسجلاتهم", "الحضور والانصراف (بصمة GPS)", "إدارة الإجازات والموافقات", "إدارة الرواتب", "التأمينات (GOSI)", "نهاية الخدمة"],
  small: ["إدارة الأداء", "الهيكل التنظيمي", "بوابة الموظف الذاتية (7 لغات)"],
  medium: ["رحلات العمل والانتداب", "التخطيط التعاقبي", "تحليلات الموارد البشرية"],
  growth: ["تراخيص المنشأة الحكومية", "إدارة الأسطول والمركبات", "تكاملات حكومية ذكية"],
  enterprise: ["دعم فني مخصص", "ربط API خاص للأنظمة", "مدير حساب مخصص", "تدريب شامل للفريق"],
};
const FEATURES_EN = {
  micro: ["Employee records", "Attendance (GPS check-in)", "Leaves & approvals", "Payroll", "GOSI", "End of service"],
  small: ["Performance management", "Org structure", "Employee self-service (7 langs)"],
  medium: ["Business trips", "Succession planning", "HR analytics"],
  growth: ["Government licenses", "Fleet & vehicles", "Smart integrations"],
  enterprise: ["Dedicated support", "Private API integration", "Account manager", "Full team training"],
};

function cumulativeFeatures(id, lang) {
  const src = lang === "ar" ? FEATURES_AR : FEATURES_EN;
  const order = ["micro", "small", "medium", "growth", "enterprise"];
  const idx = order.indexOf(id);
  const feats = [];
  for (let i = 0; i <= idx; i++) feats.push(...(src[order[i]] || []));
  return feats;
}

export default function PricingTiers({ selectedId, onBuy, lang = "ar" }) {
  const isAr = lang === "ar";
  const tiers = isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN;
  const head = isAr ? (
    <>اختر الباقة المناسبة <span className="bg-gradient-to-l from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">لمؤسستك</span></>
  ) : (
    <>Choose the plan that fits <span className="bg-gradient-to-l from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">your organization</span></>
  );
  const sub = isAr
    ? "كل باقة مصممة لشريحة عدد موظفين محددة بسعر سنوي ومميزات متكاملة — اضغط للشراء لاختيار باقتك وإكمال بيانات منشأتك."
    : "Each plan is tailored to a specific headcount range with an annual price and full features — click to buy your plan and complete your company details.";
  const buyLabel = isAr ? "اضغط للشراء" : "Buy now";
  const perYear = isAr ? "ريال / سنوياً" : "SAR / year";
  const featuresTitle = isAr ? "تشمل الباقة:" : "Includes:";
  const currency = isAr ? "ريال" : "SAR";

  return (
    <div className="mt-2 mb-6">
      {/* ترويسة القسم */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          {isAr ? "الباقات والأسعار" : "Plans & Pricing"}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-2" style={{ fontFamily: "var(--font-display)" }}>{head}</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">{sub}</p>
      </div>

      {/* بطاقات الباقات — كل باقة في عمود مستقل */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {tiers.map((t) => {
          const feats = cumulativeFeatures(t.id, lang);
          const active = selectedId === t.id;
          return (
            <div
              key={t.id}
              className={`flex flex-col rounded-3xl bg-white border p-6 transition shadow-sm ${active ? "border-violet-500 ring-2 ring-violet-300 shadow-lg" : "border-border hover:border-violet-300 hover:shadow-md"}`}
            >
              {/* شارة الشريحة */}
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 bg-gradient-to-l from-violet-600 to-fuchsia-600 text-white">
                  <Sparkles size={12} /> {t.tier}
                </span>
              </div>

              {/* السعر */}
              <div className="mt-4 text-center">
                <div className="flex items-end justify-center gap-1.5">
                  <span className="text-3xl font-extrabold bg-gradient-to-l from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{t.yearly.toLocaleString()}</span>
                  <span className="text-sm font-medium text-muted-foreground mb-1">{currency}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{perYear}</div>
              </div>

              {/* نطاق الموظفين */}
              <div className="mt-4 text-center">
                <div className="text-xs text-muted-foreground">{isAr ? "نطاق الموظفين" : "Headcount"}</div>
                <div className="font-bold text-foreground">{t.range}</div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed min-h-[2.5rem]">{t.note}</p>

              {/* المميزات */}
              <div className="mt-4 pt-4 border-t border-border flex-1">
                <div className="text-xs font-bold text-foreground mb-3">{featuresTitle}</div>
                <ul className="grid grid-cols-1 gap-2">
                  {feats.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-violet-100 shrink-0">
                        <Check size={11} className="text-violet-600" />
                      </span>
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* زر الشراء */}
              <button
                type="button"
                onClick={() => onBuy?.(t)}
                className={`mt-5 w-full rounded-2xl py-3.5 font-bold transition shadow-md ${active ? "bg-gradient-to-l from-violet-700 to-fuchsia-700 shadow-violet-500/30" : "bg-gradient-to-l from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-violet-500/20"}`}
              >
                <span className="text-white">{active ? (isAr ? "الباقة المختارة — أكمل البيانات" : "Selected — complete details") : buyLabel}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}