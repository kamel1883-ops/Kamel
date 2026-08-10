import { FileText, CalendarClock, Gavel, Bell, ShieldCheck, ScrollText, Building2, AlertTriangle } from "lucide-react";
import FeatureLanding from "@/components/landing/FeatureLanding";

export default function ContractsPage() {
  return <FeatureLanding content={CONTENT} />;
}

const CONTENT = {
  path: "/contracts",
  ar: {
    badge: "إدارة العقود واللوائح | نظام العمل السعودي",
    titlePre: "إدارة عقود العمل و",
    titleHi: "اللوائح السعودية",
    hero: "أدِر عقود العمل ولوائح المنشأة بسهولة داخل «جدارة» — توقيع وتجديد العقود، تنبيهات انتهاء العقود القاربت على الانتهاء، تنفيذ سياسة العمل والجزاءات والإنذارات التصاعدية وفق نظام العمل السعودي، ومتابعة اللوائح التنظيمية دون ورق. نظام موارد بشرية سحابي للمنشآت السعودية.",
    heroImg: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    ctaPrimary: "جرّب مجاناً 30 يوماً",
    painTitle: "هل تواجه تحديات في إدارة العقود واللوائح؟",
    painPoints: [
      "متابعة عقود العمل القاربت على الانتهاء قبل فوات الأوان.",
      "تنفيذ سياسة العمل وفق نظام العمل السعودي بدقة.",
      "إصدار إنذارات تصاعدية (أول/ثاني/ثالث/فصل) مرتبطة بالمواد النظامية.",
      "تنظيم لوائح المنشأة التنظيمية وإتاحتها للموظفين.",
      "تقليل الورق والخطوات اليدوية في إدارة العقود.",
    ],
    featuresTag: "عقود ولوائح بلا تعقيد",
    featuresTitle: "مزايا إدارة العقود واللوائح في جدارة",
    features: [
      { icon: FileText, t: "عقود للعمل", d: "تسجيل وإدارة عقود العمل بأنواعها (دوام كامل، جزئي، محدد المدة)." },
      { icon: CalendarClock, t: "تنبيهات انتهاء العقود", d: "تقارير عقود قاربت على الانتهاء قبل موعد التجديد." },
      { icon: Gavel, t: "سياسة العمل والإنذارات", d: "إنذار تصاعدي مرتبط بالمادة النظامية بعد جلسة تحقيق مع الموظف." },
      { icon: Bell, t: "تنبيهات استباقية", d: "إشعارات قبل انتهاء العقد أو تجدده أو الإنهاء المقرّب." },
      { icon: ShieldCheck, t: "لوائح المنشأة", d: "توثيق اللوائح التنظيمية وسياسات الجزاءات ومشاركتها بسهولة." },
      { icon: ScrollText, t: "مرجع قانوني", d: "بنية مرتبطة بنظام العمل السعودي ومواد الجزاءات المعتمدة." },
    ],
    stepsTitle: "كيف تُدار العقود واللوائح؟",
    steps: [
      { t: "سجّل عقد الموظف", d: "أدخل بيانات العقد: نوعه، تاريخ البداية والنهاية، الراتب التأسيسي." },
      { t: "تابع التنبيهات", d: "استقبل إشعارات انتهاء العقود القادمة قبل أول موعد." },
      { t: "طبّق اللوائح", d: "استخدم سياسة العمل لإصدار إنذارات تصاعدية مرتبطة بالمواد." },
      { t: "اربط بالموظف", d: "تظهر العقود والإنذارات للموظف في بوابة الموظف الذاتية." },
    ],
    faqTitle: "أسئلة متكررة عن العقود واللوائح",
    faqs: [
      { q: "هل يدعم جدارة عقود العمل المحددة والمفتوحة؟", a: "نعم — يدعم أنواع العقود (دوام كامل، جزئي، عقد محدد المدة) مع تتبّع التواريخ." },
      { q: "كيف يتم ربط التنبيهات بنظام العمل؟", a: "يدمج جدارة جدول عقود العمل مع تنبيهات انتهاء وتقارير عقود قاربت على الانتهاء." },
      { q: "هل الإنذارات التصاعدية موثّقة؟", a: "نعم — يربط كل إنذار بالمادة النظامية ذات صلة بعد جلسة تحقيق، ويرسله للموظف تلقائياً." },
    ],
    ctaTitle: "نظّم عقودك ولوائحك بثقة",
    ctaDesc: "جرّب جدارة مجاناً 30 يوماً وأدِر عقود العمل بلا ورق.",
    seo: {
      title: "إدارة العقود واللوائح حسب نظام العمل السعودي | جدارة",
      description: "إدارة عقود العمل، اللوائح التنظيمية، سياسات الجزاءات والإنذارات التصاعدية وفق نظام العمل السعودي — تخطيط، تنبيهات انتهاء العقود، وتنفيذ اللوائح بدون ورق. نظام HR سحابي للمنشآت السعودية.",
      keywords: "إدارة عقود العمل, لوائح الموارد البشرية, نظام العمل السعودي, سياسة الجزاءات, إنذارات تصاعدية, عقود قاربت على الانتهاء, Saudi labor contracts management",
    },
  },
  en: {
    badge: "Contracts & Policies | Saudi Labor Law",
    titlePre: "Manage labor contracts &",
    titleHi: "Saudi regulations",
    hero: "Manage labor contracts and company policies effortlessly in Jadara — contract signing and renewal, expiring-contract alerts, execution of work policy and progressive warnings per the Saudi Labor Law, and organized regulations without paperwork. A cloud HR system for Saudi companies.",
    heroImg: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    ctaPrimary: "Try free for 30 days",
    painTitle: "Struggling with contract & policy management?",
    painPoints: [
      "Tracking near-expiry labor contracts before it's too late.",
      "Applying work policy accurately under the Saudi Labor Law.",
      "Issuing progressive warnings (first/second/third/termination) linked to articles.",
      "Organizing and sharing company regulations with employees.",
      "Reducing paperwork and manual steps in contract management.",
    ],
    featuresTag: "Contracts & policies, simplified",
    featuresTitle: "Contract & policy features in Jadara",
    features: [
      { icon: FileText, t: "Labor Contracts", d: "Record and manage labor contracts by type (full-time, part-time, fixed-term)." },
      { icon: CalendarClock, t: "Expiry Alerts", d: "Near-expiry contract reports ahead of the renewal deadline." },
      { icon: Gavel, t: "Work Policy & Warnings", d: "Progressive warning linked to the article after an investigation session." },
      { icon: Bell, t: "Proactive Alerts", d: "Notifications before contract expiry, renewal or approaching termination." },
      { icon: ShieldCheck, t: "Company Policies", d: "Document regulations and disciplinary policies and share them easily." },
      { icon: ScrollText, t: "Legal Reference", d: "A structure tied to the Saudi Labor Law and approved articles." },
    ],
    stepsTitle: "How contracts & policies are managed",
    steps: [
      { t: "Register the contract", d: "Enter contract data: type, start and end date, base salary." },
      { t: "Track alerts", d: "Receive upcoming contract expiry notifications early." },
      { t: "Apply policies", d: "Use the work policy to issue progressive warnings linked to articles." },
      { t: "Link to employees", d: "Contracts and warnings appear for the employee in the self-service portal." },
    ],
    faqTitle: "Contracts & policies FAQs",
    faqs: [
      { q: "Does Jadara support fixed and open contracts?", a: "Yes — it supports contract types (full-time, part-time, fixed-term) with date tracking." },
      { q: "How are alerts tied to the Labor Law?", a: "Jadara integrates the contract schedule with expiry alerts and near-expiry reports." },
      { q: "Are progressive warnings documented?", a: "Yes — each warning is linked to the relevant article after an investigation session and sent to the employee automatically." },
    ],
    ctaTitle: "Organize your contracts & policies confidently",
    ctaDesc: "Try Jadara free for 30 days and manage labor contracts paperless.",
    seo: {
      title: "Contracts & Policies Management per Saudi Labor Law | Jadara",
      description: "Manage labor contracts, company regulations, disciplinary policies and progressive warnings per the Saudi Labor Law — planning, expiry alerts and policy execution without paperwork. A cloud HR system for Saudi companies.",
      keywords: "labor contract management, Saudi labor law policies, progressive warnings Saudi, near-expiry contracts, Saudi HR regulations, contract renewal Saudi Arabia",
    },
  },
};

export function _icons() { return { FileText, CalendarClock, Gavel, Bell, ShieldCheck, ScrollText, Building2, AlertTriangle }; }