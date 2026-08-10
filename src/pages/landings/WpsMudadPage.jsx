import { ShieldCheck, Wallet, FileText, CalendarClock, BadgeCheck, Landmark, Building2, CheckCircle2 } from "lucide-react";
import FeatureLanding from "@/components/landing/FeatureLanding";

export default function WpsMudadPage() {
  return <FeatureLanding content={CONTENT} />;
}

const CONTENT = {
  path: "/wps-mudad",
  ar: {
    badge: "نظام حماية الأجور — مدد (WPS)",
    titlePre: "حماية الأجور عبر منصة",
    titleHi: "مدد",
    hero: "أدر مسيرات الرواتب وأرسلها لحماية الأجور عبر منصة مدد بثقة — توليد ملفات WPS جاهزة، ربط بنوك الموظفين، مطابقة تواريخ الصرف، وامتثال كامل لنظام حماية الأجور السعودي. نظام رواتب سحابي مصمّم للمؤسسات والشركات الصغيرة والمتوسطة في الرياض وجدة والشرقية وكل المملكة.",
    heroImg: "https://images.unsplash.com/photo-1554224155-6726b3ff898f?auto=format&fit=crop&w=1200&q=80",
    ctaPrimary: "جرّب مجاناً 30 يوماً",
    painTitle: "هل تواجه تحديات في الالتزام بنظام حماية الأجور؟",
    painPoints: [
      "كيفية إدارة مسيرات الرواتب في السعودية بدقة.",
      "تجهيز ملفات حماية الأجور المهيأة لمنصة مدد.",
      "ربط حسابات الموظفين البنكية IBD منصة مدد.",
      "مطابقة تواريخ بداية ونهاية الصرف في الملف.",
      "تجنّب مخالفات حماية الأجور والغرامات.",
    ],
    featuresTag: "حماية الأجور بثقة",
    featuresTitle: "ماذا يوفّر جدارة لحماية الأجور؟",
    features: [
      { icon: FileText, t: "ملفات WPS جاهزة", d: "توليد ملفات حماية الأجور بصيغة مدد المعتمدة بنقرة واحدة." },
      { icon: Wallet, t: "حسابات بنكية منظّمة", d: "ربط أرقام الحسابات البنكية (IBAN) لكل موظف وتوثيقها." },
      { icon: CalendarClock, t: "مطابقة فترات الصرف", d: "ضبط تواريخ بداية ونهاية الصرف وفق متطلب مدد." },
      { icon: ShieldCheck, t: "امتثال كامل", d: "هيكلة الرواتب والتدوين وفق نظام حماية الأجور السعودي." },
      { icon: BadgeCheck, t: "تحقق آلي", d: "تحذيرات عند أي تضارب أو نقص قبل الإرسال." },
      { icon: Landmark, t: "بنوك سعودية معتمدة", d: "دعم بنوك وتنسيق مدد للبنوك السعودية المختلفة." },
    ],
    stepsTitle: "خطوات إرسال حماية الأجور",
    steps: [
      { t: "جهّز ملف الموظفين", d: "أدخل بيانات الموظفين وأرقام IBAN لكل موظف." },
      { t: "أدر مسير الرواتب", d: "احتسب الرواتب والمستحقات والخصومات والبدلات." },
      { t: "صدّر ملف WPS", d: "ولّد ملف حماية الأجور الجاهز للرفع على مدد." },
      { t: "ارفع الملف على مدد", d: "اتبع خطوات الرفع على منصة مدد وفق الجدول الزمني." },
    ],
    faqTitle: "أسئلة متكررة عن حماية الأجور",
    faqs: [
      { q: "ما هو نظام حماية الأجور السعودي WPS؟", a: "نظام يلزم المنشآت بإرسال بيانات رواتب موظفيها لمنصة مدد لضمان صرف الأجور في موعدها لحسابات الموظفين." },
      { q: "هل يدعم جدارة كل البنوك السعودية؟", a: "يدعم جدارة تنسيق ملف الإرسال المعتمد من مدد لكل البنوك السعودية." },
      { q: "هل يحفظ جدارة نسخة من الملفات المرسلة؟", d: "", a: "يولّد جدارة الملفات وفق الهيكل المعتمد ويمكنك أرشفتها محلياً قبل الإرسال." },
    ],
    ctaTitle: "أتمت حماية الأجور في منشأتك",
    ctaDesc: "جرّب جدارة مجاناً 30 يوماً وأرسل أول ملف WPS بثقة.",
    seo: {
      title: "نظام حماية الأجور «مدد» | ربط مسيرات الرواتب السعودية بـ WPS",
      description: "أدر مسيرات الرواتب وأرسلها لحماية الأجور عبر منصة مدد بنقرة — توليد ملفات WPS جاهزة، ربط IBAN، مطابقة تواريخ الصرف وامتثال كامل لنظام حماية الأجور السعودي للمؤسسات والشركات في الرياض وجدة والشرقية.",
      keywords: "حماية الأجور, مدد, WPS, ملف حماية الأجور, مسير الرواتب السعودي, نظام رواتب متوافق مع مدد, Wage Protection System Saudi Arabia, Mudad file",
    },
  },
  en: {
    badge: "Wage Protection System — Mudad (WPS)",
    titlePre: "Wage Protection via",
    titleHi: "Mudad",
    hero: "Manage payroll and submit Wage Protection files to Mudad confidently — generate ready WPS files, link employee bank accounts, match payment dates and stay fully compliant with the Saudi Wage Protection System. A cloud payroll system built for SMEs in Riyadh, Jeddah, the Eastern Province and across the Kingdom.",
    heroImg: "https://images.unsplash.com/photo-1554224155-6726b3ff898f?auto=format&fit=crop&w=1200&q=80",
    ctaPrimary: "Try free for 30 days",
    painTitle: "Struggling with Wage Protection compliance?",
    painPoints: [
      "Managing Saudi payroll runs accurately.",
      "Preparing Mudad-ready Wage Protection files.",
      "Linking employee IBAN accounts for Mudad.",
      "Matching start and end payment dates in the file.",
      "Avoiding Wage Protection violations and fines.",
    ],
    featuresTag: "Wage Protection, done right",
    featuresTitle: "What Jadara brings for WPS",
    features: [
      { icon: FileText, t: "Ready WPS Files", d: "Generate Wage Protection files in the approved Mudad format in one click." },
      { icon: Wallet, t: "Organized Bank Accounts", d: "Link and document the IBAN for every employee." },
      { icon: CalendarClock, t: "Payment Period Matching", d: "Align payment start and end dates per Mudad requirements." },
      { icon: ShieldCheck, t: "Full Compliance", d: "Salary structuring and recording per the Saudi Wage Protection System." },
      { icon: BadgeCheck, t: "Automated Validation", d: "Warnings for any conflict or gap before submission." },
      { icon: Landmark, t: "Approved Saudi Banks", d: "Support the Mudad format for various Saudi banks." },
    ],
    stepsTitle: "Wage Protection submission steps",
    steps: [
      { t: "Prepare employee file", d: "Enter employee data and each employee's IBAN." },
      { t: "Run payroll", d: "Calculate salaries, entitlements, deductions and allowances." },
      { t: "Export WPS file", d: "Generate the Wage Protection file ready to upload to Mudad." },
      { t: "Upload to Mudad", d: "Follow Mudad's upload process on the official timeline." },
    ],
    faqTitle: "Wage Protection FAQs",
    faqs: [
      { q: "What is the Saudi WPS?", a: "A system requiring establishments to submit salary data to the Mudad platform to ensure wages are paid on time to employee accounts." },
      { q: "Does Jadara support all Saudi banks?", a: "Jadara supports the Mudad-approved submission format for all Saudi banks." },
      { q: "Does Jadara archive submitted files?", a: "Jadara generates files in the approved format; you can archive them locally before submission." },
    ],
    ctaTitle: "Automate Wage Protection in your company",
    ctaDesc: "Try Jadara free for 30 days and send your first WPS file confidently.",
    seo: {
      title: "Mudad Wage Protection System | Saudi Payroll WPS Link",
      description: "Manage payroll and submit Wage Protection files to Mudad in one click — generate ready WPS files, link IBAN, match payment dates and stay fully compliant with the Saudi Wage Protection System for SMEs in Riyadh, Jeddah and the Eastern Province.",
      keywords: "Wage Protection System, Mudad, WPS, Saudi payroll file, Mudad IBAN, Saudi payroll software, WPS compliance Saudi Arabia",
    },
  },
};

export function _icons() { return { ShieldCheck, Wallet, FileText, CalendarClock, BadgeCheck, Landmark, Building2, CheckCircle2 }; }