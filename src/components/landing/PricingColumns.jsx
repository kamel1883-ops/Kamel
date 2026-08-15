import React from "react";
import {
  Sparkles, Gift, Check, Calendar, CreditCard, Users, ChevronLeft,
} from "lucide-react";
import { PRICING_TIERS_AR, PRICING_TIERS_EN } from "@/lib/pricing";

// مميزات تراكمية مختصرة لكل شريحة (3-4 نقاط لكل بطاقة).
const FEATS_AR = {
  micro: ["إدارة الموظفين وسجلاتهم", "الحضور والانصراف (GPS)", "إدارة الإجازات والموافقات", "الرواتب والتأمينات (GOSI)"],
  small: ["إدارة الأداء", "الهيكل التنظيمي", "بوابة الموظف الذاتية"],
  medium: ["رحلات العمل والانتداب", "التخطيط التعاقبي", "تحليلات الموارد البشرية"],
  growth: ["تراخيص المنشأة الحكومية", "إدارة الأسطول والمركبات", "تكاملات حكومية ذكية"],
  enterprise: ["دعم فني مخصص", "ربط API خاص", "مدير حساب مخصص"],
};
const FEATS_EN = {
  micro: ["Employee records", "Attendance (GPS)", "Leaves & approvals", "Payroll & GOSI"],
  small: ["Performance", "Org structure", "Employee self-service"],
  medium: ["Business trips", "Succession planning", "HR analytics"],
  growth: ["Gov. licenses", "Fleet & vehicles", "Smart integrations"],
  enterprise: ["Dedicated support", "Private API", "Account manager"],
};

// قسم الباقات: 6 أعمدة (بطاقة تجربة مجانية + 5 بطاقات شرائح) في صف واحد.
export default function PricingColumns({ isAr = true, onStartTrial, onBuyTier }) {
  const tiers = isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN;
  const feats = isAr ? FEATS_AR : FEATS_EN;
  const currency = isAr ? "ر.س" : "SAR";
  const perYear = isAr ? "/ سنوياً" : "/year";

  const trialPills = isAr
    ? ["تجربة كاملة 30 يوماً", "بدون بيانات دفع", "جميع مزايا جدارة", "دعم فني مخصص"]
    : ["Full 30-day trial", "No payment", "All features", "Dedicated support"];

  return (
    <section id="pricing" className="max-w-[1500px] mx-auto px-4 lg:px-10 py-14">
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
            {isAr ? "تجربة مجانية أو حل مؤسسي متكامل — 5 شرائح حسب عدد موظفيك، مع مميزات وزر شراء لكل شريحة." : "Free trial or a full enterprise solution — 5 tiers by headcount, each with features and a buy button."}
          </p>
        </div>

        {/* 6 أعمدة: تجربة مجانية + 5 شرائح */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-8 items-stretch">
          {/* العمود 1: التجربة المجانية */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col">
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
            <ul className="grid grid-cols-1 gap-1.5 mt-3 flex-1">
              {trialPills.map((p) => (
                <li key={p} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1.5 text-[11px]">
                  <Check size={11} className="text-emerald-600 shrink-0" />
                  <span className="text-[#374151] truncate">{p}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-[#6B7280]">
              <span className="inline-flex items-center gap-1"><Calendar size={11} className="text-violet-500" /> {isAr ? "30 يوماً" : "30d"}</span>
              <span className="inline-flex items-center gap-1"><CreditCard size={11} className="text-violet-500" /> {isAr ? "بدون بطاقة" : "No card"}</span>
              <span className="inline-flex items-center gap-1"><Users size={11} className="text-violet-500" /> {isAr ? "فريق كامل" : "Team"}</span>
            </div>
            <button
              type="button"
              onClick={onStartTrial}
              className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white bg-gradient-to-l from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-md shadow-fuchsia-500/30 transition"
            >
              {isAr ? "ابدأ التجربة" : "Start free"}
            </button>
          </div>

          {/* الأعمدة 2-6: شرائح الاشتراك */}
          {tiers.map((t) => (
            <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col">
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
                <div className="text-xs font-bold text-[#111827] leading-tight">{t.range}</div>
              </div>
              <ul className="grid grid-cols-1 gap-1.5 mt-3 flex-1">
                {(feats[t.id] || []).map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-3.5 h-3.5 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Check size={9} className="text-violet-600" />
                    </span>
                    <span className="text-[#374151]">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onBuyTier?.(t)}
                className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white bg-gradient-to-l from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-md shadow-fuchsia-500/30 transition inline-flex items-center justify-center gap-1"
              >
                {isAr ? "شراء الباقة" : "Buy plan"} <ChevronLeft size={14} />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-[#9CA3AF] mt-5">
          {isAr ? "جميع الأسعار سنوية شاملة الضريبة. تُحدّد الشريحة وفق عدد الموظفين." : "All prices annual, tax-inclusive. Tier determined by headcount."}
        </p>
      </div>
    </section>
  );
}