import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import CommissionCalculator from "@/components/affiliate/CommissionCalculator";
import AffiliateJoinForm from "@/components/affiliate/AffiliateJoinForm";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Percent, Link2, Wallet, BadgeCheck } from "lucide-react";

export default function AffiliateProgram() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const steps = isAr ? [
    { icon: Link2, t: "احصل على رابطك", d: "سجّل بياناتك ويصلك رابط إحالة خاص بك من فريق جدارة." },
    { icon: BadgeCheck, t: "أحِل عميلاً جديداً", d: "شارك الرابط مع المنشآت، ويُحتسب العميل لك عند اشتراكه لأول مرة." },
    { icon: Wallet, t: "استلم عمولتك", d: "7% من قيمة أول اشتراك مدفوع، تُصرف بتحويل بنكي بعد اعتمادها." },
  ] : [
    { icon: Link2, t: "Get your link", d: "Register your details and receive a personal referral link from the Jadara team." },
    { icon: BadgeCheck, t: "Refer a new client", d: "Share the link with organizations; the client is credited to you on their first subscription." },
    { icon: Wallet, t: "Get paid", d: "7% of the first paid subscription, transferred by bank once approved." },
  ];

  const sections = isAr ? [
    { title: "التعريف بالبرنامج", body: "برنامج شركاء «جدارة» هو برنامج تسويق بالعمولة يتيح للشريك الترويج لمنصة جدارة لإدارة الموارد البشرية مقابل عمولة على العملاء الجدد الذين يشتركون من خلال رابط الشريك. وتُتتبّع الإحالات والعمولات عبر أنظمة جدارة المعتمدة للتحقق من صحة الإحالة والدفعة المؤهلة." },
    { title: "نسبة العمولة — 7% من أول اشتراك فقط", items: [
      "يحصل الشريك على عمولة 7% من قيمة أول اشتراك مدفوع ومؤهل للعميل الجديد المُحال عبر رابطه.",
      "تُستحق العمولة مرة واحدة فقط لكل عميل، ولا تتكرّر سنوياً.",
      "لا تُحتسب أي عمولة على التجديد السنوي للعميل ولا على السنوات التالية، إلا باتفاق خطي مستقل مع جدارة.",
      "تُحسب النسبة على صافي قيمة الاشتراك بعد الخصومات وقبل أي رسوم أو ضرائب.",
    ] },
    { title: "المدفوعات المؤهلة للعمولة", body: "تُحتسب العمولة على العملاء الجدد الذين يشتركون لأول مرة من خلال رابط الشريك. ولا تُحتسب العمولة على:", items: [
      "فترات التجربة المجانية (30 يوماً) قبل الاشتراك المدفوع.",
      "الدفعات الفاشلة أو غير المكتملة أو المبالغ المستردة.",
      "الرسوم والضرائب ورسوم التحويل البنكي.",
      "رسوم نقل البيانات أو التكاملات الإضافية خارج قيمة الاشتراك.",
      "الإحالات الذاتية أو الحسابات الوهمية.",
      "العملاء الحاليين أو السابقين أو إعادة تفعيل اشتراك قديم.",
      "تجديد الاشتراك السنوي بأي حال.",
    ] },
    { title: "استحقاق العمولة واعتمادها", body: "تظهر العمولة في حالة «انتظار» بعد اشتراك العميل، وتُعتمد بعد انقضاء مدة الاسترداد المنصوص عليها في سياسة الاسترداد (شهر من تاريخ التفعيل) والتأكد من عدم وجود استرداد أو إلغاء. وإذا استردّ العميل قيمة اشتراكه، تُلغى العمولة المرتبطة به بالكامل." },
    { title: "صرف العمولات", items: [
      "تُصرف العمولات المعتمدة بتحويل بنكي محلي داخل المملكة.",
      "الحد الأدنى للصرف 500 ريال، ويُرحّل الرصيد الأقل إلى الدورة التالية.",
      "تُصرف الدفعات شهرياً خلال أول عشرة (10) أيام عمل من الشهر التالي للاعتماد.",
      "على الشريك تزويد جدارة ببيانات بنكية صحيحة ومحدّثة، ولا تتحمّل جدارة تأخيراً ناتجاً عن بيانات ناقصة.",
    ] },
    { title: "شروط الترويج", body: "يلتزم الشريك بالترويج بطريقة واضحة وصادقة وغير مضلّلة، ويُمنع عليه:", items: [
      "تقديم معلومات غير صحيحة عن المنصة أو مميزاتها أو أسعارها.",
      "الوعد بنتائج أو خصومات غير مصرّح بها من جدارة.",
      "الرسائل المزعجة (Spam) أو أساليب التسويق الاحتيالية.",
      "إنشاء حسابات وهمية أو الإحالة الذاتية للحصول على عمولة.",
      "نشر محتوى مسيء أو غير قانوني أو يضر بسمعة جدارة.",
    ] },
    { title: "استخدام العلامة التجارية", body: "يجوز للشريك استخدام اسم «جدارة» وموادها التسويقية المعتمدة لغرض الترويج ضمن البرنامج فقط، دون تعديل الشعار أو الإيحاء بوجود شراكة رسمية أو تمثيل قانوني للمنصة دون موافقة مكتوبة." },
    { title: "مراجعة الإحالات", body: "تحتفظ جدارة بحق مراجعة كل إحالة قبل اعتمادها، ورفض أو إلغاء أي عمولة ناتجة عن نشاط احتيالي أو إحالة ذاتية أو حسابات وهمية أو مخالفة لهذه الشروط أو دفعة مستردة أو ملغاة." },
    { title: "إنهاء المشاركة", body: "يحق لجدارة إيقاف أو إنهاء مشاركة أي شريك عند مخالفة الشروط أو إساءة استخدام البرنامج، ويجوز للشريك التوقف في أي وقت. وفي حال الإنهاء بسبب مخالفة أو احتيال، يحق لجدارة إلغاء العمولات غير المدفوعة." },
    { title: "تعديل الشروط وحدود المسؤولية", body: "تحتفظ جدارة بحق تعديل شروط البرنامج أو نسبة العمولة أو آلية الصرف مستقبلاً، وتُطبَّق التعديلات من تاريخ نشرها. ولا تضمن جدارة للشريك عدداً معيناً من الإحالات أو الأرباح، ولا تتحمّل أي خسائر مباشرة أو غير مباشرة. وأي نزاع يُحال إلى الجهات النظامية المختصة في المملكة العربية السعودية." },
  ] : [
    { title: "Program overview", body: "The Jadara Partners Program is an affiliate program that lets partners promote the Jadara HR platform in return for a commission on new clients who subscribe through the partner's link. Referrals and commissions are tracked through Jadara's approved systems to validate each referral and qualified payment." },
    { title: "Commission rate — 7% of the first subscription only", items: [
      "The partner earns 7% of the value of the new client's first qualified paid subscription referred through their link.",
      "The commission is earned one time only per client and does not recur annually.",
      "No commission is due on the client's annual renewal or subsequent years, unless separately agreed in writing with Jadara.",
      "The rate applies to the net subscription value after discounts and before any fees or taxes.",
    ] },
    { title: "Qualified payments", body: "Commission applies to new clients subscribing for the first time through the partner link. No commission applies to:", items: [
      "Free trial periods (30 days) before a paid subscription.",
      "Failed, incomplete, or refunded payments.",
      "Taxes, fees, and bank transfer charges.",
      "Data migration or additional integration fees outside the subscription value.",
      "Self-referrals or fake accounts.",
      "Existing or former clients, or reactivation of an old subscription.",
      "Annual subscription renewals in any case.",
    ] },
    { title: "Accrual and approval", body: "The commission appears as “pending” after the client subscribes and is approved once the refund window in the Refund Policy has passed (one month from activation) and no refund or cancellation occurred. If the client is refunded, the related commission is cancelled in full." },
    { title: "Commission payouts", items: [
      "Approved commissions are paid by local bank transfer within Saudi Arabia.",
      "Minimum payout is SAR 500; lower balances carry over to the next cycle.",
      "Payouts are made monthly within the first ten (10) business days of the month following approval.",
      "The partner must provide accurate, up-to-date bank details; Jadara is not liable for delays caused by incomplete data.",
    ] },
    { title: "Promotion rules", body: "Partners must promote clearly, honestly, and without misleading claims. Prohibited:", items: [
      "Providing incorrect information about the platform, its features, or pricing.",
      "Promising results or discounts not authorized by Jadara.",
      "Spam messaging or fraudulent marketing methods.",
      "Creating fake accounts or self-referrals to earn commission.",
      "Publishing offensive, unlawful, or reputation-damaging content.",
    ] },
    { title: "Brand usage", body: "Partners may use the Jadara name and approved marketing materials solely to promote the platform within the program, without modifying the logo or implying an official partnership or legal representation without written consent." },
    { title: "Referral review", body: "Jadara reserves the right to review every referral before approval, and to reject or cancel any commission resulting from fraudulent activity, self-referral, fake accounts, breach of these terms, or a refunded or cancelled payment." },
    { title: "Termination", body: "Jadara may suspend or terminate any partner's participation upon breach or abuse of the program, and partners may stop at any time. Where terminated for breach or fraud, Jadara may cancel unpaid commissions." },
    { title: "Changes and liability", body: "Jadara may amend the program terms, commission rate, or payout mechanism in future, effective from publication. Jadara does not guarantee any number of referrals or earnings and is not liable for direct or indirect losses. Disputes are referred to the competent authorities in the Kingdom of Saudi Arabia." },
  ];

  return (
    <div className="min-h-screen bg-[#0B2545] text-white" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <Link to="/"><Logo tone="light" size={52} /></Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm bg-white/10 border border-white/15 hover:bg-white/15 px-4 py-2 rounded-xl">
              <ArrowLeft size={15} style={{ transform: isAr ? "none" : "scaleX(-1)" }} /> {isAr ? "الرئيسية" : "Home"}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* الهيرو */}
        <div className="inline-flex items-center gap-2 bg-amber-400/15 text-amber-200 border border-amber-300/25 rounded-full px-3 py-1 text-xs mb-4">
          <Percent size={13} /> {isAr ? "عمولة 7% من أول اشتراك — مرة واحدة" : "7% of the first subscription — one time"}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          {isAr ? "برنامج شركاء جدارة" : "Jadara Partners Program"}
        </h1>
        <p className="text-white/75 leading-loose mt-4 max-w-3xl">
          {isAr
            ? "اربح 7% من قيمة أول اشتراك لكل منشأة تُحيلها إلى منصة جدارة لإدارة الموارد البشرية. العمولة تُستحق مرة واحدة فقط عن أول اشتراك مدفوع، ولا تُحتسب عن التجديد السنوي."
            : "Earn 7% of the first subscription value for every organization you refer to the Jadara HR platform. The commission is earned one time only on the first paid subscription and is not due on annual renewals."}
        </p>

        {/* كيف يعمل */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {steps.map((s, i) => {
            const I = s.icon;
            return (
              <div key={s.t} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-3">
                  <I size={20} className="text-amber-300" />
                </div>
                <div className="font-semibold">{i + 1}. {s.t}</div>
                <div className="text-white/60 text-sm mt-1.5 leading-relaxed">{s.d}</div>
              </div>
            );
          })}
        </div>

        {/* الحاسبة */}
        <div className="mt-8"><CommissionCalculator isAr={isAr} /></div>

        {/* الشروط */}
        <h2 className="text-2xl font-extrabold mt-12 mb-1" style={{ fontFamily: "var(--font-display)" }}>
          {isAr ? "شروط وأحكام البرنامج" : "Program terms & conditions"}
        </h2>
        <div className="text-white/50 text-sm mb-5">{isAr ? "آخر تحديث: 2026" : "Last updated: 2026"}</div>
        <div className="space-y-5">
          {sections.map((s, i) => (
            <section key={s.title} className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>{i + 1}. {s.title}</h3>
              {s.body ? <p className="text-white/70 text-sm leading-loose">{s.body}</p> : null}
              {s.items?.length ? (
                <ul className="mt-3 space-y-2">
                  {s.items.map((it) => (
                    <li key={it} className="text-white/70 text-sm leading-relaxed flex gap-2">
                      <span className="text-amber-300 shrink-0">•</span><span>{it}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {/* الانضمام */}
        <div className="mt-10"><AffiliateJoinForm isAr={isAr} /></div>

        <div className="text-center text-white/50 text-sm mt-10">
          {isAr ? "للاستفسارات: " : "Inquiries: "}
          <a href="mailto:info@jadara-hr.com" className="text-amber-200 hover:text-amber-100" dir="ltr">info@jadara-hr.com</a>
        </div>
      </main>
    </div>
  );
}