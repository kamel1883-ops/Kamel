import React from "react";
import {
  Sparkles, Gift, Check, Calendar, CreditCard, Users, ChevronLeft,
} from "lucide-react";
import { PRICING_TIERS_AR, PRICING_TIERS_EN, FULL_FEATURES_AR, FULL_FEATURES_EN } from "@/lib/pricing";

// قسم الباقات: 6 أعمدة (بطاقة تجربة مجانية + 5 بطاقات شرائح) في صف واحد.
// كل بطقة تعرض نفس قائمة المميزات الكاملة (متوفرة في كل باقة بدون استثناء) — البطاقات تتمدّد للأسفل لتسع كل المميزات.
export default function PricingColumns({ isAr = true, onStartTrial, onBuyTier }) {
  const tiers = isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN;
  const feats = isAr ? FULL_FEATURES_AR : FULL_FEATURES_EN;
  const currency = isAr ? "ر.س" : "SAR";
  const perYear = isAr ? "/ سنوياً" : "/year";
  const includes = isAr ? "تشمل كل المميزات:" : "All features:";

  return (
    <section id="pricing" className="max-w-[1600px] mx-auto px-4 lg:px-10 py-14">
      <div className="bg-[#F9FAFB] rounded-[2rem] p-6 sm:p-10 text-[#111827] shadow-xl shadow-black/20">
        {/* ترويسة */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            {isAr ? "الباقات والأسعار" : "Plans & Pricing"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 mb-2" style={{ fontFamily: "var(--font-display)" }}>
            {isAr ? <>اختر الباقة المناسبة <span className="bg-gradient-to-l from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">لمؤسستك</span></> : <>Choose the plan that fits <span className="bg-gradient-to-l from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">your organization</span></>}
          </h2>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            {isAr ? "كل باقة تشمل جميع ميزات المنصة كاملة — الفرق في شريحة عدد الموظفين والسعر السنوي فقط." : "Every plan includes the full feature set — only the headcount tier and annual price differ."}
          </p>
        </div>

        {/* 6 أعمدة: تجربة مجانية + 5 شرائح — كل بطاقة تتمدّد للأسفل لتسع كل المميزات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-8 items-start">
          {/* العمود 1: التجربة المجانية */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 bg-gradient-to-l from-fuchsia-600 to-violet-600 text-white">
                <Gift size={12} /> {isAr ? "مجاناً" : "Free"}
              </span>
            </div>
            <div className="text-center mt-3">
              <div className="text-2xl font-extrabold bg-gradient-to-l from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">0</div>
              <div className="text-[11px] text-[#6B7280] mt-0.5">{isAr ? "ريال / 30 يوماً" : "SAR / 30 days"}</div>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-center">
              <Sparkles size={13} className="text-violet-400 shrink-0" />
              <h3 className="text-sm font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {isAr ? "تجربة مجانية 30 يوماً" : "30-day free trial"}
              </h3>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-[#6B7280]">
              <span className="inline-flex items-center gap-1"><Calendar size={11} className="text-violet-500" /> {isAr ? "30 يوماً" : "30d"}</span>
              <span className="inline-flex items-center gap-1"><CreditCard size={11} className="text-violet-500" /> {isAr ? "بدون بطاقة" : "No card"}</span>
              <span className="inline-flex items-center gap-1"><Users size={11} className="text-violet-500" /> {isAr ? "فريق كامل" : "Team"}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex-1">
              <div className="text-[11px] font-bold text-[#111827] mb-2">{includes}</div>
              <ul className="grid grid-cols-1 gap-1">
                {feats.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed">
                    <Check size={12} className="text-violet-600 mt-0.5 shrink-0" />
                    <span className="text-[#374151]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={onStartTrial}
              className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white bg-gradient-to-l from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-md shadow-fuchsia-500/30 transition"
            >
              {isAr ? "ابدأ التجربة" : "Start free"}
            </button>
          </div>

          {/* الأعمدة 2-6: شرائح الاشتراك */}
          {tiers.map((t) => (
            <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col">
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 bg-gradient-to-l from-fuchsia-600 to-violet-600 text-white">
                  <Sparkles size={12} /> {t.tier}
                </span>
              </div>
              <div className="text-center mt-3">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-2xl font-extrabold bg-gradient-to-l from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">{t.yearly.toLocaleString()}</span>
                  <span className="text-[11px] text-[#6B7280] mb-1">{currency}</span>
                </div>
                <div className="text-[11px] text-[#6B7280] mt-0.5">{perYear}</div>
              </div>
              <div className="text-center mt-2">
                <div className="text-[10px] text-[#9CA3AF]">{isAr ? "نطاق الموظفين" : "Headcount"}</div>
                <div className="text-[11px] font-bold text-[#111827] leading-tight">{t.range}</div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex-1">
                <div className="text-[11px] font-bold text-[#111827] mb-2">{includes}</div>
                <ul className="grid grid-cols-1 gap-1">
                  {feats.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] leading-tight">
                      <Check size={10} className="text-violet-600 mt-0.5 shrink-0" />
                      <span className="text-[#374151]">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onBuyTier?.(t)}
                className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white bg-gradient-to-l from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-md shadow-fuchsia-500/30 transition inline-flex items-center justify-center gap-1"
              >
                {isAr ? "شراء الباقة" : "Buy plan"} <ChevronLeft size={14} />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-[#9CA3AF] mt-5">
          {isAr ? "جميع الأسعار سنوية شاملة الضريبة. تُحدّد الشريحة وفق عدد الموظفين. كل باقة تشمل كل المميزات." : "All prices annual, tax-inclusive. Tier by headcount. Every plan includes all features."}
        </p>
      </div>
    </section>
  );
}