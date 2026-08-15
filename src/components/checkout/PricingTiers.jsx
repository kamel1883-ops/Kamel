import React from "react";
import { Check } from "lucide-react";
import { PRICING_TIERS_AR, PRICING_TIERS_EN } from "@/lib/pricing";

// ميزات تراكمية حسب الشريحة — كل شريحة تشمل ميزات ما قبلها + إضافات.
const FEATURES_AR = {
  micro: ["إدارة الموظفين وسجلاتهم","الحضور والانصراف (بصمة GPS)","إدارة الإجازات والموافقات","إدارة الرواتب","التأمينات (GOSI)","نهاية الخدمة"],
  small: ["إدارة الأداء","الهيكل التنظيمي","بوابة الموظف الذاتية (7 لغات)"],
  medium: ["رحلات العمل والانتداب","التخطيط التعاقبي","تحليلات الموارد البشرية"],
  growth: ["تراخيص المنشأة الحكومية","إدارة الأسطول والمركبات","تكاملات حكومية ذكية"],
  enterprise: ["دعم فني مخصص","ربط API خاص للأنظمة","مدير حساب مخصص","تدريب شامل للفريق"],
};
const FEATURES_EN = {
  micro: ["Employee records management","Attendance (GPS self check-in)","Leaves & approvals","Payroll","GOSI","End of service"],
  small: ["Performance management","Org structure","Employee self-service portal (7 langs)"],
  medium: ["Business trips","Succession planning","HR analytics"],
  growth: ["Government licenses","Fleet & vehicles","Smart government integrations"],
  enterprise: ["Dedicated technical support","Private API integration","Dedicated account manager","Full team training"],
};

function cumulativeFeatures(id, lang) {
  const src = lang === "ar" ? FEATURES_AR : FEATURES_EN;
  const order = ["micro","small","medium","growth","enterprise"];
  const idx = order.indexOf(id);
  const feats = [];
  for (let i = 0; i <= idx; i++) feats.push(...(src[order[i]] || []));
  return feats;
}

export default function PricingTiers({ selectedId, onBuy, lang = "ar" }) {
  const isAr = lang === "ar";
  const tiers = isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN;
  const head = isAr ? "اختر الباقة المناسبة لمؤسستك" : "Choose the plan that fits your organization";
  const sub = isAr ? "كل باقة تشمل نطاق موظفين محدد وسعراً سنوياً وميزات متكاملة — اضغط لشراء الباقة المناسبة." : "Each plan covers a specific headcount range, an annual price, and full features — click to buy.";
  const buyLabel = isAr ? "اضغط للشراء" : "Buy now";
  const perYear = isAr ? "ريال / سنوياً" : "SAR / year";
  const includes = isAr ? "تشمل" : "Includes";
  const currency = isAr ? "ريال" : "SAR";

  return (
    <div className="mt-2 mb-6">
      <div className="text-center mb-1">
        <span className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs rounded-full px-3 py-1">
          {isAr ? "الباقات والأسعار" : "Plans & Pricing"}
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold mt-3" style={{ fontFamily: "var(--font-display)" }}>{head}</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">{sub}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {tiers.map((t) => {
          const feats = cumulativeFeatures(t.id, lang);
          const active = selectedId === t.id;
          return (
            <div key={t.id} className={`flex flex-col rounded-2xl border p-5 transition bg-white ${active ? "border-violet-500 ring-2 ring-violet-300 shadow-lg" : "border-border shadow-sm hover:border-violet-300"}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold rounded-full px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200">{t.tier}</div>
                {active && <span className="text-[11px] font-bold text-violet-600">{isAr ? "الباقة المختارة" : "Selected"}</span>}
              </div>

              <div className="mt-3">
                <div className="text-2xl font-extrabold text-violet-700">{t.yearly.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">{currency}</span></div>
                <div className="text-xs text-muted-foreground mt-0.5">{perYear}</div>
              </div>

              <div className="mt-2 text-sm">
                <span className="text-xs text-muted-foreground">{isAr ? "نطاق الموظفين" : "Headcount"}</span>
                <div className="font-semibold text-foreground">{t.range}</div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-xs font-semibold text-muted-foreground mb-2">{includes}:</div>
                <ul className="space-y-1.5">
                  {feats.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check size={15} className="text-violet-600 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onBuy?.(t)}
                className="mt-4 w-full rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-md shadow-violet-500/20 transition"
              >
                {buyLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}