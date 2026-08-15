import React from "react";
import {
  Sparkles, Gift, Check, Calendar, CreditCard, Users,
  Building2, Headphones, GraduationCap, Workflow, BarChart3, UserCircle,
} from "lucide-react";

// قسم الباقات كعمودين (بطاقتين جنباً إلى جنب) — تجربة مجانية + الباقة المؤسسية/السنوية.
// نموذج محدّد: عمودان (columns) وليس صفوف جدول.
export default function PricingColumns({ isAr = true, onStartTrial, onBuy }) {
  const trialPills = isAr
    ? ["تجربة كاملة لمدة 30 يوماً", "بدون إدخال بيانات دفع", "جميع مزايا نظام جدارة", "دعم فني مخصص"]
    : ["Full 30-day trial", "No payment details", "All Jadara features", "Dedicated support"];

  const trialTags = isAr
    ? [{ I: Calendar, t: "30 يوماً مجاناً" }, { I: CreditCard, t: "بدون بطاقة ائتمان" }, { I: Users, t: "فريق كامل" }]
    : [{ I: Calendar, t: "30 days free" }, { I: CreditCard, t: "No card needed" }, { I: Users, t: "Full team" }];

  const entFeatures = isAr
    ? [
        { I: Building2, t: "حلول مخصصة لمؤسستك" },
        { I: Headphones, t: "دعم فني متقدم على مدار الساعة" },
        { I: GraduationCap, t: "تدريب شامل للفريق" },
        { I: Workflow, t: "تكامل مع الأنظمة الحالية" },
        { I: BarChart3, t: "تقارير وتحليلات متقدمة" },
        { I: UserCircle, t: "مدير حساب مخصص" },
      ]
    : [
        { I: Building2, t: "Custom solutions" },
        { I: Headphones, t: "Advanced 24/7 support" },
        { I: GraduationCap, t: "Comprehensive training" },
        { I: Workflow, t: "Integrations with existing systems" },
        { I: BarChart3, t: "Advanced analytics" },
        { I: UserCircle, t: "Dedicated account manager" },
      ];

  return (
    <section id="pricing" className="max-w-[1280px] mx-auto px-6 lg:px-14 py-14">
      <div className="bg-[#F9FAFB] rounded-[2rem] p-7 sm:p-12 text-[#111827] shadow-xl shadow-black/20">
        {/* ترويسة */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            {isAr ? "الباقات والأسعار" : "Plans & Pricing"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {isAr ? <>اختر الباقة المناسبة <span className="bg-gradient-to-l from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">لمؤسستك</span></> : <>Choose the plan that fits <span className="bg-gradient-to-l from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">your organization</span></>}
          </h2>
          <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed">
            {isAr
              ? "سواء كنت تريد تجربة النظام مجاناً أو تبحث عن حل مؤسسي متكامل، لدينا ما يناسب احتياجاتك"
              : "Whether you want to try the system free or need a complete enterprise solution, we have what fits your needs"}
          </p>
        </div>

        {/* البطاقتان جنباً إلى جنب */}
        <div className="grid sm:grid-cols-2 gap-6 mt-10">
          {/* البطاقة الأولى: التجربة المجانية */}
          <div className="bg-white border border-slate-100 rounded-3xl p-7 shadow-sm flex flex-col">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 bg-gradient-to-l from-fuchsia-600 to-violet-600 text-white">
                <Gift size={13} /> {isAr ? "جرب نظام جدارة مجاناً" : "Try Jadara free"}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-center">
              <Sparkles size={16} className="text-violet-400 shrink-0" />
              <h3 className="text-xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
                {isAr ? "تجربة مجانية لمدة 30 يوماً بدون التزام" : "30-day free trial, no commitment"}
              </h3>
              <Sparkles size={16} className="text-violet-400 shrink-0" />
            </div>
            <p className="text-[#6B7280] text-sm leading-relaxed text-center mt-3">
              {isAr
                ? "استكشف جميع مزايا نظام جدارة لإدارة الموارد البشرية، من الحضور والانصراف إلى الرواتب والتأمينات ونهاية الخدمة، عبر تجربة مجانية كاملة بدون إدخال بيانات دفع."
                : "Explore every Jadara HR feature — attendance, payroll, GOSI, end of service — in a full free trial with no payment details."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
              {trialPills.map((p) => (
                <div key={p} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-2 text-sm">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-emerald-600" />
                  </span>
                  <span className="text-[#374151]">{p}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-5 text-xs text-[#6B7280]">
              {trialTags.map(({ I, t }) => (
                <span key={t} className="inline-flex items-center gap-1.5"><I size={14} className="text-violet-500" /> {t}</span>
              ))}
            </div>

            <button
              type="button"
              onClick={onStartTrial}
              className="mt-6 w-full rounded-2xl py-3.5 font-bold text-white bg-gradient-to-l from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-lg shadow-fuchsia-500/30 transition"
            >
              {isAr ? "ابدأ التجربة المجانية" : "Start free trial"}
            </button>
          </div>

          {/* البطاقة الثانية: الباقة المؤسسية / السنوية */}
          <div className="bg-white border border-slate-100 rounded-3xl p-7 shadow-sm flex flex-col">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 bg-gradient-to-l from-fuchsia-600 to-violet-600 text-white">
                {isAr ? "الباقة المؤسسية" : "Enterprise Plan"}
              </span>
            </div>
            <h3 className="text-center mt-4" style={{ fontFamily: "var(--font-display)" }}>
              <span className="block text-base font-bold text-[#111827]">{isAr ? "الباقة المؤسسية" : "Enterprise Plan"}</span>
              <span className="block text-2xl font-extrabold mt-1 bg-gradient-to-l from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
                {isAr ? "تواصل معنا" : "Contact us"}
              </span>
            </h3>
            <p className="text-[#6B7280] text-sm leading-relaxed text-center mt-3">
              {isAr
                ? "حلول متكاملة مصممة خصيصاً لتلبية احتياجات المنشآت الكبيرة والمتوسطة. تبدأ الأسعار من 1,500 ر.س / سنوياً حسب شريحة عدد موظفيك."
                : "Integrated solutions tailored for medium and large organizations. Pricing starts at 1,500 SAR/year based on your headcount tier."}
            </p>

            <div className="space-y-2.5 mt-5">
              {entFeatures.map(({ I, t }) => (
                <div key={t} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                    <I size={17} className="text-white" />
                  </span>
                  <span className="text-sm font-medium text-[#374151]">{t}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onBuy}
              className="mt-6 w-full rounded-2xl py-3.5 font-bold text-white bg-gradient-to-l from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-lg shadow-fuchsia-500/30 transition"
            >
              {isAr ? "شراء الباقة المناسبة لك" : "Buy the plan that suits you"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}