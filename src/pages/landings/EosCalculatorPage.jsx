import { Calculator, ShieldCheck, CalendarDays, Plane, FileText, BadgeCheck, Percent, ScrollText } from "lucide-react";
import FeatureLanding from "@/components/landing/FeatureLanding";

export default function EosCalculatorPage() {
  return <FeatureLanding content={CONTENT} />;
}

const CONTENT = {
  path: "/eos-calculator",
  ar: {
    badge: "حاسبة نهاية الخدمة | نظام العمل السعودي",
    titlePre: "احسب مكافأة نهاية الخدمة حسب",
    titleHi: "نظام العمل السعودي",
    hero: "حاسبة دقيقة لمكافأة نهاية الخدمة وفق نظام العمل السعودي — كل أسباب الإنهاء وموادها (74، 75، 77، 80، 81، 84، 85)، احتساب نصف شهر للسنوات الخمس الأولى وشهر كامل بعدها، تصفية رصيد الإجازات وتعويض التذاكر، ومخالصة قابلة للطباعة بشعار منشأتك. نظام موارد بشرية سحابي للمنشآت السعودية.",
    heroImg: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=1200&q=80",
    ctaPrimary: "جرّب مجاناً 30 يوماً",
    painTitle: "هل تحتسب نهاية الخدمة يدوياً؟",
    painPoints: [
      "حساب مكافأة نهاية الخدمة وفقاً لمواد نظام العمل السعودي.",
      "تمييز أسباب الإنهاء (استقالة، فصل، انتهاء عقد) وأثرها على الاستحقاق.",
      "تصفية رصيد الإجازات المستحقة وتعويض التذاكر.",
      "إعداد مخالصة نهائية معتمدة قابلة للطباعة بشعار المنشأة.",
      "ربط نهاية الخدمة بمسار اعتماد المالية ورفع إيصال التحويل.",
    ],
    featuresTag: "احتساب دقيق",
    featuresTitle: "مزايا حاسبة نهاية الخدمة في جدارة",
    features: [
      { icon: Calculator, t: "حاسبة وفق نظام العمل", d: "تطبيق النصوص (نصف شهر للسنوات الخمس الأولى، شهر كامل بعدها) تلقائياً." },
      { icon: ScrollText, t: "كل أسباب الإنهاء", d: "المواد 74، 75، 77، 80، 81، 84، 85 — أسباب الإنهاء وموادها النظامية." },
      { icon: CalendarDays, t: "تصفية رصيد الإجازات", d: "احتساب تعويض الأيام المتبقية من رصيد الإجازات." },
      { icon: Plane, t: "تعويض التذاكر", d: "احتساب استحقاق تذكرة السفر وقيمتها لكل موظف." },
      { icon: FileText, t: "مخالصة قابلة للطباعة", d: "مخالصة واضحة بشعار المنشأة بتخطيط A4 جاهز للطباعة." },
      { icon: ShieldCheck, t: "مسار اعتماد المالية", d: "ربط المخالصة بمسار: الموارد البشرية ← المالية ← إقفال الموظف." },
    ],
    stepsTitle: "كيف تحتسب نهاية الخدمة؟",
    steps: [
      { t: "اختر الموظف", d: "حدد الموظف وآخر يوم عمل له." },
      { t: "اختر سبب الإنهاء", d: "حدد السبب ليعرض النظام المادة النظامية المناسبة." },
      { t: "راجع الاحتساب", d: "اكتشف المكافأة وتصفية الإجازات وتعويض التذاكر تلقائياً." },
      { t: "اطبع المخالصة", d: "احفظ كمسودة أو اطبع PDF بأبعاد A4 بشعار منشأتك." },
    ],
    faqTitle: "أسئلة متكررة عن نهاية الخدمة",
    faqs: [
      { q: "كم تستحق مكافأة نهاية الخدمة؟", a: "نصف شهر راتب عن كل سنة من السنوات الخمس الأولى، وشهر كامل عن كل سنة تالية، وفقاً للمادة 84 من نظام العمل." },
      { q: "هل الاستقالة تؤثر على المكافأة؟", a: "نعم — الاستقالة في أول سنتين لا تستحق مكافأة، ثم الاستحقاق التدريجي وفقاً لسنوات الخدمة وفق نظام العمل." },
      { q: "هل تدعم الحاسبة الجنسيات المختلفة؟", a: "نعم — تتعامل مع السعوديين والمقيمين وتعويض التذاكر حسب سياسة المنشأة." },
    ],
    ctaTitle: "احسب نهاية الخدمة بدقة وثقة",
    ctaDesc: "جرّب جدارة مجاناً 30 يوماً واحسب أول مخالصة بشعار منشأتك.",
    seo: {
      title: "حاسبة مكافأة نهاية الخدمة حسب نظام العمل السعودي | جدارة",
      description: "احسب مكافأة نهاية الخدمة بدقة وفق نظام العمل السعودي (مواد 74، 75، 77، 80، 81، 84، 85)، تصفية رصيد الإجازات وتعويض التذاكر، ومخالصة قابلة للطباعة بشعار منشأتك. للمنشآت السعودية.",
      keywords: "حاسبة نهاية الخدمة, حساب مكافأة نهاية الخدمة, نظام العمل السعودي, EOS calculator Saudi, article 84 Saudi labor law, end of service settlement Saudi Arabia",
    },
  },
  en: {
    badge: "End-of-Service Calculator | Saudi Labor Law",
    titlePre: "Calculate end-of-service per the",
    titleHi: "Saudi Labor Law",
    hero: "An accurate end-of-service calculator per the Saudi Labor Law — all termination reasons and articles (74, 75, 77, 80, 81, 84, 85), half-month for the first five years then a full month, leave balance encashment and ticket compensation, with a printable settlement bearing your company logo. A cloud HR system for Saudi companies.",
    heroImg: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=1200&q=80",
    ctaPrimary: "Try free for 30 days",
    painTitle: "Calculating end of service manually?",
    painPoints: [
      "Computing EOS per the Saudi Labor Law articles.",
      "Distinguishing termination reasons (resignation, dismissal, contract end) and their effect on entitlement.",
      "Settling accrued leave balance and ticket compensation.",
      "Producing an approved printable settlement with the company logo.",
      "Linking EOS to a finance approval flow with transfer proof.",
    ],
    featuresTag: "Accurate calculation",
    featuresTitle: "EOS calculator features in Jadara",
    features: [
      { icon: Calculator, t: "Law-aligned calculator", d: "Automatically applies the rules (half-month for the first 5 years, full month after)." },
      { icon: ScrollText, t: "All termination reasons", d: "Articles 74, 75, 77, 80, 81, 84, 85 — reasons and their articles." },
      { icon: CalendarDays, t: "Leave Balance Settlement", d: "Calculate compensation for remaining leave days." },
      { icon: Plane, t: "Ticket Compensation", d: "Compute the ticket entitlement and value per employee." },
      { icon: FileText, t: "Printable Settlement", d: "Clear settlement with company logo in A4 layout, print-ready." },
      { icon: ShieldCheck, t: "Finance Approval Flow", d: "Link the settlement to: HR → Finance → closing the employee." },
    ],
    stepsTitle: "How to calculate end of service",
    steps: [
      { t: "Select employee", d: "Pick the employee and their last working day." },
      { t: "Choose the reason", d: "Select the reason and the system shows the relevant article." },
      { t: "Review the calculation", d: "See EOS, leave settlement and ticket compensation automatically." },
      { t: "Print the settlement", d: "Save as a draft or print an A4 PDF with your logo." },
    ],
    faqTitle: "End-of-service FAQs",
    faqs: [
      { q: "How much is the end-of-service award?", a: "Half a month's salary for each of the first five years and a full month for each subsequent year, per Article 84 of the Labor Law." },
      { q: "Does resignation affect the award?", a: "Yes — resignation in the first two years forfeits the award, then gradual entitlement accrues per years of service under the Labor Law." },
      { q: "Does the calculator support different nationalities?", a: "Yes — it handles Saudis and expats, plus ticket compensation per company policy." },
    ],
    ctaTitle: "Calculate end of service accurately",
    ctaDesc: "Try Jadara free for 30 days and generate your first settlement with your logo.",
    seo: {
      title: "End-of-Service Calculator per Saudi Labor Law | Jadara",
      description: "Calculate end-of-service accurately per the Saudi Labor Law (articles 74, 75, 77, 80, 81, 84, 85), leave balance encashment and ticket compensation, with a printable settlement bearing your logo. For Saudi companies.",
      keywords: "end of service calculator, EOS Saudi Arabia, Saudi labor law article 84, end of service settlement, gratuity calculator Saudi, EOS award KSA",
    },
  },
};

export function _icons() { return { Calculator, ShieldCheck, CalendarDays, Plane, FileText, BadgeCheck, Percent, ScrollText }; }