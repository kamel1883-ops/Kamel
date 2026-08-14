import { Award, Target, TrendingUp, GitBranch, FileCheck, Bell, BarChart3, Users, Star, CheckCircle2 } from "lucide-react";
import FeatureLanding from "@/components/landing/FeatureLanding";

export default function PerformanceSystemPage() {
  return <FeatureLanding content={CONTENT} />;
}

const CONTENT = {
  path: "/performance-system",
  ar: {
    badge: "نظام إدارة الأداء السعودي",
    titlePre: "نظام",
    titleHi: "إدارة الأداء والتقييم",
    hero: "نظام إدارة الأداء من جدارة يحوّل تقييم الموظفين إلى عملية منظمة وعادلة — أهداف ذكية (SMART)، كفاءات، سلوكيات مهنية، توصيات ترقية ومكافآت، وتتبع مستمر للإنجاز. مصمم للمنشآت السعودية لمتابعة الأداء وتطوير الكفاءات في الرياض وجدة والدمام وباقي المملكة.",
    heroImg: "https://images.unsplash.com/photo-1552664730-30cea382f415?auto=format&fit=crop&w=1200&q=80",
    ctaPrimary: "ابدأ تجربتك المجانية 30 يوماً",
    painTitle: "تحدّيات تقييم الأداء في المنشآت السعودية",
    painPoints: [
      "إدارة تقييمات موحّدة وعادلة بين الإدارات والفروع.",
      "ربط الأهداف الفردية بأهداف المنشأة الاستراتيجية.",
      "متابعة إنجاز الأهداف على مدار العام لا فقط سنوياً.",
      "توصيات واضحة للترقية والمكافأة والتطوير.",
      "ربط نتائج التقييم بالتخطيط التعاقبي والترقيات.",
    ],
    featuresTag: "منظومة الأداء",
    featuresTitle: "مزايا نظام إدارة الأداء",
    features: [
      { icon: Target, t: "أهداف SMART", d: "تحديد أهداف ذكية مع المخرجات والمهلات وتتبع نسبة الإنجاز." },
      { icon: Users, t: "تقييم متعدد الأطراف", d: "تقييم من المدير والمراجع وتأكيد من الموظف بشفافية." },
      { icon: Star, t: "كفاءات وسلوكيات", d: "تقييم الكفاءات الفنية والسلوك المهني بقيم موحّدة (1-5)." },
      { icon: TrendingUp, t: "متابعة الإنجاز", d: "تتبع مستمر لتنفيذ المهام وتحقيق الأهداف." },
      { icon: Award, t: "توصيات ترقية", d: "توصية بالترقية أو المكافأة أو الإنذار وفق نتائج التقييم." },
      { icon: GitBranch, t: "ربط التعاقبي", d: "ربط الأداء العالي بالتخطيط التعاقبي وتحديد البدلاء." },
      { icon: FileCheck, t: "مراجعات دورية", d: "تقييم سنوي، نصف سنوي، تجريبي، ووضع الأهداف." },
      { icon: Bell, t: "تنبيهات التقييم", d: "إشعارات للموعد القادم للتقييم وتأكيد الإقرار." },
      { icon: BarChart3, t: "تحليلات الأداء", d: "لوحات مؤشرات لقياس متوسط الأداء لكل قسم وإدارة." },
    ],
    stepsTitle: "كيف تُدار دورة الأداء",
    steps: [
      { t: "ضع الأهداف", d: "يحدد المدير والموظف الأهداف الذكية والمخرجات المتوقعة." },
      { t: "تابع الإنجاز", d: "يُسجّل تقدّم المهام على مدار العام بتحديثات دورية." },
      { t: "أجرِ التقييم", d: "تقييم الأهداف والكفاءات والسلوكيات من قبل المدير والمراجع." },
      { t: "أصدر التوصيات", d: "ترقية، مكافأة، تطوير، أو إنذار — وربطها بالتعاقبي." },
    ],
    faqTitle: "أسئلة شائعة عن إدارة الأداء",
    faqs: [
      { q: "هل يدعم جدارة التقييم التجريبي للموظفين الجدد؟", a: "نعم — يوفّر نوع مراجعة تجريبي (probation) لاتخاذ قرار التثبيت أو الفصل بعد فترة التجربة." },
      { q: "هل يمكنني تخصيص معايير التقييم؟", a: "نعم — يمكنك تحديد الأهداف والكفاءات والسلوكيات ودرجاتها بما يناسب منشأتك." },
      { q: "هل يربط التقييم بالترقيات؟", a: "نعم — تُولّد توصيات بالترقية أو المكافأة وترتبط مباشرةً بالتخطيط التعاقبي." },
      { q: "هل يدعم التقييم متعدد الأطراف؟", a: "نعم — يتيح تقييم المدير ومراجعة الجهة المختصة وإقرار الموظف." },
      { q: "هل توجد مراجعات نصف سنوية؟", a: "نعم — يدعم المراجعة السنوية، النصف سنوية، التجريبية، ووضع الأهداف." },
    ],
    ctaTitle: "حوّل تقييم الأداء إلى ميزة تنافسية",
    ctaDesc: " جرّب نظام إدارة الأداء من جدارة مجاناً 30 يوماً وطوّر فريقك بثقة.",
    seo: {
      title: "نظام إدارة الأداء السعودي | تقييم الموظفين والأهداف — جدارة",
      description: "نظام إدارة الأداء من جدارة — أهداف SMART، كفاءات، سلوكيات، تقييم متعدد الأطراف وتوصيات ترقية. للمنشآت في الرياض وجدة والدمام ومكة وباقي السعودية.",
      keywords: "نظام إدارة الأداء, نظام تقييم الموظفين, برنامج تقييم الأداء, إدارة الأداء السعودي, تقييم الأهداف والكفاءات, نظام أداء HR, نظام أداء الرياض, نظام تقييم الأداء جدة, KPI الموظفين, تطوير الكفاءات",
    },
  },
  en: {
    badge: "Saudi Performance Management System",
    titlePre: "A",
    titleHi: "performance & evaluation system",
    hero: "Jadara's performance management system turns employee evaluation into an organized, fair process — SMART goals, competencies, professional behaviors, promotion and bonus recommendations, and continuous achievement tracking. Built for Saudi organizations to manage and grow talent in Riyadh, Jeddah, Dammam and across the Kingdom.",
    heroImg: "https://images.unsplash.com/photo-1552664730-30cea382f415?auto=format&fit=crop&w=1200&q=80",
    ctaPrimary: "Start your 30-day free trial",
    painTitle: "Performance review challenges in Saudi organizations",
    painPoints: [
      "Uniform, fair evaluations across departments and branches.",
      "Linking individual goals to strategic company goals.",
      "Tracking goal achievement year-round, not only annually.",
      "Clear promotion, bonus and development recommendations.",
      "Linking review outcomes to succession and promotions.",
    ],
    featuresTag: "The performance platform",
    featuresTitle: "Performance management system features",
    features: [
      { icon: Target, t: "SMART Goals", d: "Define smart goals with outputs, deadlines and achievement tracking." },
      { icon: Users, t: "Multi-party Review", d: "Manager and reviewer evaluation with transparent employee acknowledgement." },
      { icon: Star, t: "Competencies & Behaviors", d: "Rate technical competencies and professional behavior on a unified 1-5 scale." },
      { icon: TrendingUp, t: "Achievement Tracking", d: "Continuously track task execution and goal progress." },
      { icon: Award, t: "Promotion Recommendations", d: "Recommend promotion, bonus, warning or development based on results." },
      { icon: GitBranch, t: "Succession Link", d: "Link high performance to succession planning and identify successors." },
      { icon: FileCheck, t: "Periodic Reviews", d: "Annual, mid-year, probation and goal-setting reviews." },
      { icon: Bell, t: "Review Alerts", d: "Notifications for upcoming reviews and acknowledgement confirmation." },
      { icon: BarChart3, t: "Performance Analytics", d: "Dashboards for average performance by department and unit." },
    ],
    stepsTitle: "How the performance cycle works",
    steps: [
      { t: "Set Goals", d: "Manager and employee define SMART goals and expected outputs." },
      { t: "Track Progress", d: "Task progress is logged year-round with periodic updates." },
      { t: "Run Reviews", d: "Goals, competencies and behaviors evaluated by manager and reviewer." },
      { t: "Issue Recommendations", d: "Promotion, bonus, development or warning — linked to succession." },
    ],
    faqTitle: "Frequently asked performance questions",
    faqs: [
      { q: "Does Jadara support probation reviews for new hires?", a: "Yes — it offers a probation review type to confirm or dismiss employees after the trial period." },
      { q: "Can I customize evaluation criteria?", a: "Yes — you can define goals, competencies, behaviors and their weights to fit your organization." },
      { q: "Does it link reviews to promotions?", a: "Yes — it generates promotion or bonus recommendations and links them to succession planning." },
      { q: "Does it support multi-party reviews?", a: "Yes — it enables manager evaluation, reviewer review and employee acknowledgement." },
      { q: "Are mid-year reviews supported?", a: "Yes — annual, mid-year, probation and goal-setting reviews are all supported." },
    ],
    ctaTitle: "Turn performance management into a competitive advantage",
    ctaDesc: "Try Jadara's performance system free for 30 days and grow your team confidently.",
    seo: {
      title: "Saudi Performance Management System | Employee & Goal Reviews — Jadara",
      description: "Jadara performance management — SMART goals, competencies, behaviors, multi-party reviews and promotion recommendations. For Saudi organizations in Riyadh, Jeddah, Dammam and Makkah.",
      keywords: "performance management Saudi Arabia, employee evaluation system, performance review software, KPI HR Saudi, performance management Riyadh, employee appraisal, HR performance system",
    },
  },
};

export function _icons() { return { Award, Target, TrendingUp, GitBranch, FileCheck, Bell, BarChart3, Users, Star, CheckCircle2 }; }