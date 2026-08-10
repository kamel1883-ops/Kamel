import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import TurnstileWidget from "@/components/TurnstileWidget";
import ShareBar from "@/components/ShareBar";
import ClientMarquee from "@/components/ClientMarquee";
import { useI18n } from "@/lib/i18n";
import { PRICING_TIERS_AR, PRICING_TIERS_EN, tierForCount } from "@/lib/pricing";
import {
  Sparkles, Check, ArrowLeft, ShieldCheck, Users, CalendarCheck, Wallet,
  Calculator, Target, Car, BarChart3, Lock, Zap, Phone, Mail, Building2,
  Loader2, BadgeCheck, Star, Clock, TrendingUp, Bell, CreditCard,
  GraduationCap, Award, GitBranch, Landmark, FileSpreadsheet, Plug,
  Gavel, HeartPulse, Stethoscope, LineChart, MessageCircle, MapPin, Crown,
  Network, ClipboardList, Plane, CalendarPlus, Server, Linkedin, Facebook, Twitter,
  Send, Music2,
} from "lucide-react";

const WHATSAPP = "https://wa.me/966594700782";
const SALES_EMAIL = "info@jadara-hr.com";
// روابط حسابات التواصل الرسمية
const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/company/%D8%AC%D8%AF%D8%A7%D8%B1%D8%A9-%D9%84%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%B1%D8%AF-%D8%A7%D9%84%D8%A8%D8%B4%D8%B1%D9%8A%D8%A9",
  twitter: "https://x.com/jadarahr",
};

const featuresAr = [
  { icon: Users, title: "إدارة الموظفين", desc: "ملفات كاملة، وثائق، إقامات، جوازات، تأمين طبي، حسابات بنكية، وتنبيهات انتهاء الوثائق." },
  { icon: CalendarCheck, title: "الحضور والانصراف", desc: "بصمة ذاتية من البرنامج نفسه — بدون أجهزة بصمة ولا أنظمة قديمة. يبصم الموظف حضوره وانصرافه من جواله داخل بوابة الموظف، ولا تُقبل البصمة إلا ضمن 50 متراً من مقر العمل، وتتدفّق تلقائياً إلى الإدارة والرواتب. وتبقى إمكانية استيراد البصمات من أجهزة البصمة (Excel/CSV) للمنشآت التي تستخدم أجهزتها." },
  { icon: CalendarPlus, title: "إدارة الإجازات والموافقات", desc: "بوابة الموظف لرفع طلبات الإجازات، ومسار موافقات متعدد المراحل (مدير مباشر ‹ الموارد البشرية ‹ المالية)، خصم آلي من رصيد الإجازات، ومرفقات التقارير الطبية." },
  { icon: Plane, title: "رحلات العمل والانتداب", desc: "طلب رحلات داخلية وخارجية من بوابة الموظف، حساب التكلفة (تنقل، إقامة، بدل انتداب يومي، سلفة)، اعتماد الإدارة، ومتابعة حالة الرحلة حتى الاكتمال." },
  { icon: Wallet, title: "إدارة الرواتب (Payroll)", desc: "احتساب آلي للراتب، تعديل المستحقات والسلف والخصومات، اعتماد وصرف كشوف، وتقارير شهرية." },
  { icon: ShieldCheck, title: "التأمينات الاجتماعية (GOSI)", desc: "احتساب تلقائي للسعوديين (21% إجمالي) والمقيمين (2% صاحب العمل) وفق النظام." },
  { icon: Calculator, title: "نهاية الخدمة", desc: "حاسبة وفق نظام العمل السعودي — جميع أسباب الإنهاء وموادها النظامية (74، 75، 77، 80، 81، 84، 85)، تصفية رصيد الإجازات وتعويض التذاكر، ومخالصة قابلة للطباعة بشعار منشأتك." },
  { icon: Target, title: "إدارة الأداء", desc: "تقييمات دورية (أهداف، كفاءات، قيم)، توصيات (ترقية/مكافأة/إنذار)، ومسارات تطوير." },
  { icon: GitBranch, title: "التخطيط التعاقبي", desc: "خطة تعاقب للمناصب الحرجة، تحديد البدلاء، مستوى الجاهزية، ومخاطر الفقد وأثره." },
  { icon: Network, title: "الهيكل التنظيمي", desc: "بناء هيكل تنظيمي مرن تضعه المنشأة بنفسها (إدارة عليا › أقسام › مشرفون › عمال) بعدد مستويات ووحدات غير محدود، مع المسؤولين والأعداد المخططة والفعلية لكل وحدة." },
  { icon: ClipboardList, title: "تخطيط القوة العاملة", desc: "خطط القوة العاملة بأفق سنوي/متعدد السنوات: الأهداف، الأعداد الحالية والمستهدفة، فجوات التوظيف، الميزانية، التدريب، المبادرات ومؤشرات الأداء، وحالة الخطة." },
  { icon: BarChart3, title: "تحليلات الموارد البشرية", desc: "لوحات معلومات تفاعلية ومؤشرات لحظية: معدلات الدوران والاستبقاء (سنوي/نصف سنوي/ربع سنوي)، السعودة، الحضور، تكلفة العمالة، والاتجاهات." },
  { icon: Car, title: "إدارة الأسطول والمركبات", desc: "مركبات، تأمين، رخص، فحوصات فنية دورية، ومسؤولين، مع تنبيهات انتهاء." },
  { icon: Landmark, title: "تراخيص المنشأة الحكومية", desc: "تتبّع كل تراخيص الجهات الحكومية وعقود الصيانة، خيار «لا ينطبق»، ونسخة إلكترونية لكل ترخيص." },
  { icon: Plug, title: "التكاملات الذكية", desc: "تكاملات حكومية: التراخيص، الإقامات (مقيم/أبشر)، التأمينات الاجتماعية، والضمان الصحي — حلول متكاملة كل ما تحتاجه في مكان واحد." },
  { icon: Server, title: "بنية تحتية سحابية خاصة", desc: "نعمل على خوادم VPS ألمانية خاصة (غير مشتركة) بأعلى معايير التخزين السحابي، وتقنيات العزل والتشفير، فتعمل منصتك بأداء ثابت وسرعة فائقة لا تتأثر بضغط العمل أو عدد المستخدمين مهما كبر حجم منشأتك." },
  { icon: Building2, title: "بوابة تجربة العميل", desc: "نظام اشتراكات ذكي بفترة تجربة مجانية 30 يوماً، وإشعارات فورية للمالك بكل عميل جديد." },
  { icon: Gavel, title: "سياسة العمل والإنذارات الذكية", desc: "مرجع كامل لسياسة العمل وفق نظام العمل السعودي (الغياب، النوم، إتلاف المنتجات، العصيان، إفشاء الأسرار…). أنشئ إنذاراً تصاعدياً (أول/ثاني/ثالث/فصل) مرتبطاً بالمادة النظامية بعد جلسة تحقيق مع الموظف، ويُرسل تلقائياً إلى بوابة الموظف الذاتية — دون ورق ودون انتظار موافقة الموظف، ويظهر له عدد إنذاراته ودرجاتها فوراً." },
];

const featuresEn = [
  { icon: Users, title: "Employee Management", desc: "Complete profiles, documents, Iqama, passports, health insurance, bank accounts, and document expiry alerts." },
  { icon: CalendarCheck, title: "Attendance & Time", desc: "Self check‑in from the app itself — no fingerprint machines, no legacy systems. Employees clock in/out from their phone inside the employee portal; check‑in is only accepted within 50 meters of the workplace and flows automatically to management and payroll. Importing punches from fingerprint devices (Excel/CSV) is still available for companies using hardware." },
  { icon: CalendarPlus, title: "Leaves & Approvals", desc: "Employee portal to submit leave requests with a multi‑stage approval flow (direct manager ‹ HR ‹ Finance), automatic leave‑balance deduction, and medical report attachments." },
  { icon: Plane, title: "Business Trips & Deputation", desc: "Request internal/external trips from the employee portal, cost calculation (transport, accommodation, daily per diem, advance), management approval, and trip status tracking to completion." },
  { icon: Wallet, title: "Payroll", desc: "Automatic salary calculation, editing of entitlements, loans, deductions, approval and payment of payroll sheets, and monthly reports." },
  { icon: ShieldCheck, title: "GOSI (Social Insurance)", desc: "Automatic calculation for Saudis (21% total) and expatriates (2% employer) per the scheme." },
  { icon: Calculator, title: "End of Service", desc: "Calculator per Saudi Labor Law — all termination reasons and articles (74, 75, 77, 80, 81, 84, 85), leave balance encashment and ticket compensation, with a printable settlement bearing your company logo." },
  { icon: Target, title: "Performance Management", desc: "Periodic reviews (goals, competencies, values), recommendations (promotion/bonus/warning), and development paths." },
  { icon: GitBranch, title: "Succession Planning", desc: "Succession plans for critical roles, identify successors, readiness level, and risk and impact of loss." },
  { icon: Network, title: "Organization Structure", desc: "Build a flexible org structure the company shapes itself (exec › departments › supervisors › staff) with unlimited levels and units, with managers and planned/actual headcount per unit." },
  { icon: ClipboardList, title: "Workforce Planning", desc: "Workforce plans on an annual/multi‑year horizon: objectives, current vs target headcount, hiring gaps, budget, training, initiatives, KPIs, and plan status." },
  { icon: BarChart3, title: "HR Analytics", desc: "Interactive dashboards and live KPIs: turnover & retention rates (annual/semi-annual/quarterly), Saudization, attendance, labor cost, and trends." },
  { icon: Car, title: "Fleet & Vehicles", desc: "Vehicles, insurance, licenses, periodic technical inspections, and assignees, with expiry alerts." },
  { icon: Landmark, title: "Government Licenses", desc: "Track all government authority licenses and maintenance contracts, a “not applicable” option, and an electronic copy for each license." },
  { icon: Plug, title: "Smart Integrations", desc: "Government integrations: licenses, Iqama (Muqeem/Absher), GOSI, and health insurance — all in one place." },
  { icon: Server, title: "Private Cloud Infrastructure", desc: "We run on dedicated German VPS servers (not shared) with the highest cloud storage standards, isolation and encryption — so your platform runs with steady performance and blazing speed unaffected by workload or user volume, however large your organization grows." },
  { icon: Building2, title: "Client Trial Portal", desc: "Smart subscription system with a 30‑day free trial and instant owner notifications for every new client." },
  { icon: Gavel, title: "Labor Policy & Smart Warnings", desc: "Full labor policy reference per Saudi Labor Law (absence, sleeping, product damage, insubordination, disclosure of secrets…). Issue a progressive warning (first/second/third/termination) linked to the relevant article after an investigation session with the employee; it is sent automatically to the employee self-service portal — paperless and without waiting for the employee's approval — and their warnings count and levels appear instantly." },
];

const licensesAr = [
  "السجل التجاري", "أمانة/بلدية", "الدفاع المدني",
  "وزارة الصناعة والثروة المعدنية", "الهيئة السعودية للمدن الصناعية ومناطق التقنية (MODON)", "الهيئة العامة للغذاء والدواء (SFDA)",
  "وزارة الموارد البشرية والتنمية الاجتماعية", "التأمينات الاجتماعية (GOSI)",
  "هيئة النقل", "الهيئة السعودية للسياحة", "الزكاة والضريبة والجمارك",
  "مكتب العمل", "الرخصة الصحية / العيادات",
];
const licensesEn = [
  "Commercial Register", "Municipality", "Civil Defense",
  "Ministry of Industry & Mineral Resources", "MODON", "SFDA",
  "Ministry of Human Resources", "GOSI",
  "Transport Authority", "Saudi Tourism Authority", "ZATCA",
  "Labor Office", "Health / Clinic License",
];

const integrationsAr = [
  { icon: Bell, t: "إشعارات فورية", d: "تنبيهات استباقية لانتهاء التراخيص والإقامات والتأمينات والوثائق والمركبات." },
  { icon: Landmark, t: "التراخيص الحكومية", d: "ربط مع بوابات التراخيص الحكومية ومتابعة استصدارها وتجديدها." },
  { icon: BadgeCheck, t: "مقيم وأبشر (قريباً)", d: "تكاملات قادمة مع منصة مقيم وأبشر لمتابعة هويات وإقامات المقيمين." },
  { icon: ShieldCheck, t: "التأمينات الاجتماعية (GOSI)", d: "تكامل لاحتساب المساهمات والشهادات وفق نظام التأمينات الاجتماعية." },
  { icon: HeartPulse, t: "مجلس الضمان الصحي", d: "ربط بيانات التأمين الصحي والمستفيدين والاعتمادات." },
  { icon: Stethoscope, t: "التعاملات الطبية", d: "ربط التعاملات الطبية والفحوصات لهويات المقيمين." },
  { icon: Car, t: "إدارة المرور للمركبات", d: "ربط رخص وتأمين وفحوصات المركبات مع إدارة المرور." },
  { icon: Calculator, t: "أنظمة المحاسبة (Odoo/ERP)", d: "تكامل مع أنظمة محاسبية Odoo وأنظمة ERP لترحيل الرواتب والقيود." },
];
const integrationsEn = [
  { icon: Bell, t: "Instant Notifications", d: "Proactive alerts for expiry of licenses, Iqama, insurance, documents, and vehicles." },
  { icon: Landmark, t: "Government Licenses", d: "Integration with government license portals to track issuance and renewal." },
  { icon: BadgeCheck, t: "Muqeem & Absher (Soon)", d: "Upcoming integrations with Muqeem and Absher to track expat IDs and Iqama." },
  { icon: ShieldCheck, t: "GOSI", d: "Integration to calculate contributions and certificates per the social insurance scheme." },
  { icon: HeartPulse, t: "Health Insurance Council", d: "Link health insurance data, beneficiaries, and approvals." },
  { icon: Stethoscope, t: "Medical Transactions", d: "Link medical transactions and tests to expat IDs." },
  { icon: Car, t: "Traffic for Vehicles", d: "Link vehicle licenses, insurance, and inspections with the Traffic Department." },
  { icon: Calculator, t: "Accounting (Odoo/ERP)", d: "Integration with Odoo and ERP systems to post payroll and journal entries." },
];

const tiersAr = PRICING_TIERS_AR;
const tiersEn = PRICING_TIERS_EN;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const isAr = lang === "ar";
  const features = isAr ? featuresAr : featuresEn;
  const licenses = isAr ? licensesAr : licensesEn;
  const integrations = isAr ? integrationsAr : integrationsEn;

  const t = isAr ? {
    nav: { features: "المميزات", licenses: "التراخيص", integrations: "التكاملات", about: "عن المؤسس", pricing: "الباقات", contact: "تواصل" },
    portal: "بوابة الموظف الذاتية", login: "بوابة الشركات", start: "ابدأ الآن",
    badge: "منصة الموارد البشرية السعودية لعام 2027",
    titlePre: "نظام موارد بشرية",
    titleHi: "خارق ومتكامل",
    heroDesc: "من «جدارة» — منصة واحدة تجمع: الموظفين، الحضور والبصمة الذاتية، الإجازات، رحلات العمل، الرواتب، نهاية الخدمة، التأمينات، الأداء، التخطيط التعاقبي، التحليلات، الأسطول، والتراخيص الحكومية… مع تكاملات ذكية وتصميم فخم وحسابات وفق الأنظمة السعودية.",
    cta1: "جرّب مجاناً لمدة شهر", cta2: "استكشف المميزات",
    stats: [{ n: "+50", l: "عميل تابع" }, { n: "+15,000", l: "موظف مُدار" }, { n: "99.9%", l: "استمرارية" }],
    portalTitle: "بوابة الموظف الذاتية",
    portalDesc: "دخول خاص بالموظفين فقط — بصمة الحضور والانصراف من الجوال ضمن 50 متراً من مقر العمل (بدون أجهزة)، وعرض الراتب ورصيد الإجازات، ورفع طلبات السلف والإجازات ورحلات العمل مباشرة. يُربط الحساب برقم الهوية/الإقامة بعد اعتماد الموارد البشرية.",
    portalCta: "دخول البوابة",
    featuresTag: "كل ما تحتاجه في مكان واحد", featuresTitle: "منصة واحدة، حلول متكاملة",
    vmvTag: "هويتنا", vmvTitle: "رؤيتنا، رسالتنا، وأهدافنا",
    visionLabel: "رؤيتنا", visionText: "أن نكون المنصة السعودية الرائدة والمفضّلة لإدارة الموارد البشرية بحلول 2027، نمكّن المنشآت من تحويل مواردها البشرية إلى ميزة تنافسية حقيقية عبر تقنية سحابية ذكية وامتثال تام للأنظمة.",
    missionLabel: "رسالتنا", missionText: "تبسيط إدارة الموارد البشرية للمنشآت السعودية بمختلف أحجامها عبر منصة واحدة متكاملة، تجمع الموظفين والحضور والرواتب والإجازات ونهاية الخدمة والتراخيص والتحليلات، وتوفّر تجربة فاخرة وآمنة ودقيقة بلا تعقيد.",
    goalsLabel: "أهدافنا", goalsText: "نمكّن عملاءنا من الكفاءة والامتثال والنمو، ونختصر الوقت والجهد، ونعزز السعودة وقرارات الموارد البشرية بالبيانات، ونبني شراكة طويلة الأمد قائمة على الثقة والشفافية.",
    licensesTag: "امتثال تام", licensesTitle: "تراخيص حكومية شاملة تحت سقف واحد",
    licBadge: "مزايا إدارة التراخيص",
    licLi: ["خيار «لا ينطبق» لأي ترخيص غير ملزم لمنشأتك.", "إرفاق نسخة إلكترونية لكل ترخيص.", "تنبيهات استباقية قبل انتهاء الترخيص.", "تسجيل عقود الصيانة وتواريخها.", "تصنيف مخصّص لأي ترخيص حكومي إضافي."],
    integTag: "تكاملات ذكية", integTitle: "تكاملات تربط نظامك بالواقع",
    aboutTag: "الرؤية خلف جدارة", aboutTitle: "عن المؤسس",
    aboutChip: "مولد فكرة «جدارة» ومصمم منهجها",
    aboutRole: "مدير رأس المال البشري",
    aboutText1: "يقف خلف «جدارة» قائد في إدارة رأس المال البشري جمع بين العمق الأكاديمي والخبرة التطبيقية في تصميم حلول رقمية ترفع كفاءة المنشآت وتلتزم بالأنظمة السعودية. حاصل على درجة ", aboutTextBold1: "الماجستير في إدارة الموارد البشرية", aboutTextUniv: " من ", aboutTextUnivBold: "جامعة بورتسموث — المملكة المتحدة", aboutTextGrade: " بتقدير ", aboutTextGradeBold: "جيد جداً",
    aboutText2: "، إضافةً إلى شهادة ", certs: ["MA — University of Portsmouth", "SHRM-SCP", "OTHM", "CMI"],
    certAr: ["ماجستير — جامعة بورتسموث", "SHRM-SCP", "OTHM", "CMI"],
    pricingTag: "ابدأ الآن", pricingTitle: "باقات بسيطة وشريفة",
    planTrialLabel: "تجربة مجانية", planTrialDur: "30 يوماً", planTrialSub: "بدون بطاقة ائتمان",
    planTrialLi: ["تجربة كاملة لكل المميزات", "مدة 30 يوماً بدون بطاقة ائتمان", "استيراد بيانات الموظفين", "دعم فني خلال فترة التجربة", "بدون التزام"],
    planTrialCta: "سجّل تجربتك",
    planAnnualLabel: "الاشتراك السنوي", planAnnualPrice: "2,500 ريال", planAnnualPriceNote: "السنة الأولى (تشمل سنة مجانية)", planAnnualAfter: "ثم 700 ريال سنوياً من العام الثاني", planAnnualSub: "اطلب عرض سعر ودفع بتحويل بنكي",
    planAnnualLi: ["كل مميزات المنصة", "السنة الأولى بـ 2,500 ريال (تشمل سنة مجانية)", "التجديد السنوي 700 ريال فقط من العام الثاني", "تكاملات حكومية", "دعم مخصّص وتحديثات مستمرة"],
    planAnnualBadge: "الأكثر اختياراً", planAnnualCta: "اطلب عرض السعر",
    paidVerifying: "جارٍ تأكيد الاشتراك والدفع…",
    paidTitle: "تم الاشتراك بنجاح", paidDesc: "تم تفعيل اشتراكك السنوي ودفع 2,500 ريال بنجاح. سنتواصل معك على بياناتك لتأكيد الترحيل، وتجديد العام الثاني بـ 700 ريال. تحقق من بريدك.",
    paidCta: "تسجيل الدخول للمنصة",
    trialTag: "سجّل في دقيقة", trialTitle: "ابدأ تجربتك المجانية الآن",
    doneTitle: "تم استلام طلبك بنجاح", doneDesc: "سيتواصل معك فريقنا خلال فترة التجربة لتفعيل اشتراكك السنوي ونقل بياناتك. تحقق من بريدك الإلكتروني.",
    doneCta: "تسجيل الدخول للمنصة",
    form: { company: "اسم المنشأة *", industry: "القطاع / النشاط", city: "المدينة", contact: "اسم الشخص المسؤول", phone: "الهاتف *", unified: "الرقم الموحد (يبدأ بـ7) *", email: "البريد الإلكتروني *", headcount: "عدد الموظفين المتوقع *", pricePreview: (tier, price) => `شريحتك: ${tier} — السعر السنوي للباقة: ${price.toLocaleString()} ر.س`, submit: "تفعيل التجربة المجانية لمدة شهر", secure: "بياناتك آمنة ولن تُباع لأي طرف ثالث" },
    contactTag: "نحن هنا لمساعدتك", contactTitle: "تواصل معنا",
    wa: "واتساب مباشر", emailCard: "البريد الإلكتروني", loc: "الموقع", locVal: "المملكة العربية السعودية",
    footerDesc: "منصة الموارد البشرية السعودية المتكاملة — منصة واحدة تجمع كل ما تحتاجه لإدارة رأس المال البشري.",
    footContact: "تواصل معنا", footPlatform: "المنصة", copy: "© 2027 جدارة — جميع الحقوق محفوظة",
  } : {
    nav: { features: "Features", licenses: "Licenses", integrations: "Integrations", about: "Founder", pricing: "Pricing", contact: "Contact" },
    portal: "Employee Self‑Service Portal", login: "Company Portal", start: "Get Started",
    badge: "The Saudi HR Platform for 2027",
    titlePre: "A Super, Integrated",
    titleHi: "HR System",
    heroDesc: "From “Jadara” — one platform combining: employees, self‑attendance, leaves, business trips, payroll, end of service, GOSI, performance, succession planning, analytics, fleet, and government licenses… with smart integrations, a premium design, and calculations per Saudi regulations.",
    cta1: "Try free for a month", cta2: "Explore Features",
    stats: [{ n: "+50", l: "Active Clients" }, { n: "+15,000", l: "Employees Managed" }, { n: "99.9%", l: "Uptime" }],
    portalTitle: "Employee Self‑Service Portal",
    portalDesc: "Employees only — clock in/out from the phone within 50 meters of the workplace (no devices), view salary and leave balance, and submit loan, leave, and business‑trip requests directly. The account is linked by national ID/Iqama after HR approval.",
    portalCta: "Enter Portal",
    featuresTag: "Everything in one place", featuresTitle: "One platform, integrated solutions",
    vmvTag: "Our Identity", vmvTitle: "Our Vision, Mission & Goals",
    visionLabel: "Our Vision", visionText: "To be the leading and preferred Saudi platform for human resource management by 2027, empowering organizations to turn their human capital into a genuine competitive advantage through smart cloud technology and full regulatory compliance.",
    missionLabel: "Our Mission", missionText: "Simplify HR management for Saudi organizations of all sizes through one integrated platform that brings together employees, attendance, payroll, leaves, end-of-service, licenses, and analytics — delivering a premium, secure, and accurate experience without complexity.",
    goalsLabel: "Our Goals", goalsText: "Empower our clients' efficiency, compliance, and growth; cut time and effort; strengthen Saudization and data-driven HR decisions; and build a long-term partnership grounded in trust and transparency.",
    licensesTag: "Full compliance", licensesTitle: "All government licenses under one roof",
    licBadge: "License management perks",
    licLi: ["A “not applicable” option for any license not binding to you.", "Attach an electronic copy for each license.", "Proactive alerts before expiry.", "Record maintenance contracts and dates.", "Custom classification for any extra government license."],
    integTag: "Smart integrations", integTitle: "Integrations that connect your system to reality",
    aboutTag: "The vision behind Jadara", aboutTitle: "About the Founder",
    aboutChip: "Originator of the Jadara idea and designer of its methodology",
    aboutRole: "Head of Human Capital",
    aboutText1: "Behind “Jadara” stands a leader in human capital management combining academic depth with applied experience in designing digital solutions that raise organizational efficiency and comply with Saudi regulations. Holds a ", aboutTextBold1: "Master’s in HR Management", aboutTextUniv: " from ", aboutTextUnivBold: "University of Portsmouth — UK", aboutTextGrade: " with merit ", aboutTextGradeBold: "Very Good",
    aboutText2: ", in addition to the ", certs: ["MA — University of Portsmouth", "SHRM-SCP", "OTHM", "CMI"],
    certAr: ["MA — University of Portsmouth", "SHRM-SCP", "OTHM", "CMI"],
    pricingTag: "Start now", pricingTitle: "Simple, fair plans",
    planTrialLabel: "Free Trial", planTrialDur: "30 days", planTrialSub: "No credit card",
    planTrialLi: ["Full access to all features", "30 days, no credit card", "Import employee data", "Technical support during the trial", "No commitment"],
    planTrialCta: "Start your trial",
    planAnnualLabel: "Annual Subscription", planAnnualPrice: "SAR 2,500", planAnnualPriceNote: "First year (includes one free year)", planAnnualAfter: "Then SAR 700 / year from year two", planAnnualSub: "Request a quote & pay by bank transfer",
    planAnnualLi: ["All platform features", "First year at SAR 2,500 (includes one free year)", "Annual renewal at only SAR 700 from year two", "Government integrations", "Dedicated support and continuous updates"],
    planAnnualBadge: "Most chosen", planAnnualCta: "Request a quote",
    paidVerifying: "Verifying subscription and payment…",
    paidTitle: "Subscription successful", paidDesc: "Your annual subscription is active and SAR 2,500 was paid. We’ll contact you on your details to confirm onboarding; renewal from year two is SAR 700. Check your email.",
    paidCta: "Sign in to the platform",
    trialTag: "Register in a minute", trialTitle: "Start your free trial now",
    doneTitle: "Your request was received", doneDesc: "Our team will contact you during the trial to activate your annual subscription and migrate your data. Check your email.",
    doneCta: "Sign in to the platform",
    form: { company: "Company name *", industry: "Sector / Activity", city: "City", contact: "Responsible person", phone: "Phone *", unified: "Unified number (starts with 7) *", email: "Email *", headcount: "Expected employees count *", pricePreview: (tier, price) => `Your tier: ${tier} — Annual package price: ${price.toLocaleString()} SAR`, submit: "Activate the free trial for a month", secure: "Your data is safe and will never be sold to third parties" },
    contactTag: "We’re here to help", contactTitle: "Contact us",
    wa: "WhatsApp directly", emailCard: "Email", loc: "Location", locVal: "Saudi Arabia",
    footerDesc: "The integrated Saudi HR platform — one place bringing together everything you need to manage human capital.",
    footContact: "Contact us", footPlatform: "Platform", copy: "© 2027 Jadara — All rights reserved",
  };

  const [form, setForm] = useState({
    name: "", commercial_register: "", industry: "",
    contact_name: "", contact_email: "", contact_phone: "", unified_number: "", city: "",
    employee_count: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!captcha) { setErr(isAr ? "أكمل التحقق البشري أولاً" : "Please complete the human check first"); return; }
    if (!form.employee_count || Number(form.employee_count) <= 0) { setErr(isAr ? "أدخل عدد الموظفين المتوقع" : "Please enter the expected employee count"); return; }
    setSaving(true); setErr("");
    try {
      await base44.functions.invoke("createTrial", { ...form, captcha_token: captcha });
      setDone(true);
    } catch (error) {
      setErr(error?.response?.data?.error || error?.message || (isAr ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong, try again"));
      setCaptcha("");
      setCaptchaKey((k) => k + 1);
    } finally {
      setSaving(false);
    }
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[#0b1120] text-white antialiased" dir={isAr ? "rtl" : "ltr"}>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      {/* شريط علوي */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo tone="light" size={44} />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
            <button onClick={() => scrollTo("features")} className="hover:text-white transition">{t.nav.features}</button>
            <button onClick={() => scrollTo("licenses")} className="hover:text-white transition">{t.nav.licenses}</button>
            <button onClick={() => scrollTo("integrations")} className="hover:text-white transition">{t.nav.integrations}</button>
            <button onClick={() => scrollTo("about")} className="hover:text-white transition">{t.nav.about}</button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-white transition">{t.nav.pricing}</button>
            <button onClick={() => scrollTo("contact")} className="hover:text-white transition">{t.nav.contact}</button>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/portal" className="text-sm text-white/80 hover:text-white px-3 py-2 rounded-lg hidden sm:block">{t.portal}</Link>
            <Link to="/company-login" className="text-sm text-white/80 hover:text-white px-3 py-2 rounded-lg hidden sm:block">{t.login}</Link>
            <button onClick={() => scrollTo("trial")} className="text-sm bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 px-4 py-2 rounded-xl font-medium shadow-lg shadow-violet-500/30 transition">{t.start}</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 pt-16 pb-12 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80 mb-5">
            <BadgeCheck size={14} className="text-violet-300" /> {t.badge}
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            {t.titlePre}
            <span className="block bg-gradient-to-l from-violet-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent">{t.titleHi}</span>
          </h1>
          <p className="text-white/70 text-lg mt-5 max-w-xl leading-relaxed">{t.heroDesc}</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button onClick={() => scrollTo("trial")} className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 px-6 py-3.5 rounded-2xl font-semibold shadow-xl shadow-violet-500/30 flex items-center gap-2 transition">
              <Zap size={18} /> {t.cta1}
            </button>
            <button onClick={() => scrollTo("features")} className="bg-white/10 hover:bg-white/15 border border-white/15 px-6 py-3.5 rounded-2xl font-medium transition">{t.cta2}</button>
          </div>
          <div className="flex gap-8 mt-8 text-sm">
            {t.stats.map((s) => <Stat key={s.l} n={s.n} l={s.l} />)}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-blue-500/20 rounded-[2rem] blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80" alt="Team" className="w-full h-[420px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent" />
            <div className="absolute bottom-4 right-4 left-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {features.map((f) => {
                  const I = f.icon;
                  return (
                    <div key={f.title} className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl px-2.5 py-2 flex items-center gap-1.5">
                      <I size={14} className="text-violet-200 shrink-0" />
                      <span className="text-[11px] leading-tight text-white/90">{f.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* بوابة الموظف الذاتية */}
      <section className="max-w-7xl mx-auto px-5 py-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-violet-400/30 bg-gradient-to-l from-violet-600/20 via-indigo-600/15 to-blue-600/20 p-8 sm:p-10">
          <div className="absolute -top-12 -left-12 w-60 h-60 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Users size={26} className="text-violet-200" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{t.portalTitle}</h3>
                <p className="text-white/70 mt-2 max-w-2xl leading-relaxed">{t.portalDesc}</p>
              </div>
            </div>
            <Link to="/portal" className="shrink-0 inline-flex items-center gap-2 bg-white text-[#0b1120] hover:bg-white/90 px-6 py-3.5 rounded-2xl font-semibold shadow-xl transition">
              {t.portalCta} <ArrowLeft size={18} style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
            </Link>
          </div>
        </div>
      </section>

      {/* عملاؤنا */}
      <ClientMarquee />

      {/* الرؤية والرسالة والأهداف */}
      <section id="vmv" className="max-w-6xl mx-auto px-5 py-14">
        <SectionHead tag={t.vmvTag} title={t.vmvTitle} />
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {[
            { icon: Star, label: t.visionLabel, text: t.visionText, glow: "from-amber-500/20 to-yellow-500/10", ring: "text-amber-300" },
            { icon: ShieldCheck, label: t.missionLabel, text: t.missionText, glow: "from-emerald-500/20 to-teal-500/10", ring: "text-emerald-300" },
            { icon: Target, label: t.goalsLabel, text: t.goalsText, glow: "from-violet-500/20 to-indigo-500/10", ring: "text-violet-300" },
          ].map((c) => {
            const I = c.icon;
            return (
              <motion.div key={c.label} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="relative bg-[#13161f] border border-white/10 rounded-3xl p-7 overflow-hidden">
                <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-br ${c.glow} blur-2xl`} />
                <div className="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mb-4 shadow-lg">
                  <I size={22} className={c.ring} />
                </div>
                <div className="relative text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>{c.label}</div>
                <p className="relative text-white/65 text-sm leading-relaxed">{c.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* المميزات */}
      <section id="features" className="max-w-7xl mx-auto px-5 py-14">
        <SectionHead tag={t.featuresTag} title={t.featuresTitle} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {features.map((f) => {
            const I = f.icon;
            return (
              <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="group relative bg-[#13161f] hover:bg-[#171b29] border border-white/10 rounded-3xl p-6 pt-7 transition-all hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-7 left-6 h-8 w-8 rounded-full bg-violet-500/0 group-hover:bg-violet-500/10 blur-xl transition-all" />
                <div className="relative w-12 h-12 rounded-2xl bg-[#37376c] border border-white/10 flex items-center justify-center mb-4 shadow-lg shadow-indigo-950/50">
                  <I size={22} className="text-white" />
                </div>
                <div className="relative font-semibold text-lg leading-snug">{f.title}</div>
                <div className="relative text-white/60 text-sm mt-2 leading-relaxed">{f.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* التراخيص الحكومية */}
      <section id="licenses" className="max-w-7xl mx-auto px-5 py-14">
        <SectionHead tag={t.licensesTag} title={t.licensesTitle} />
        <div className="grid lg:grid-cols-3 gap-6 mt-10 items-start">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
            {licenses.map((l) => (
              <div key={l} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm">
                <Landmark size={16} className="text-violet-300 shrink-0" /> {l}
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3 text-sm text-white/75">
            <div className="font-semibold text-white text-base mb-1">{t.licBadge}</div>
            {t.licLi.map((li) => <FeatureLi key={li}>{li}</FeatureLi>)}
          </div>
        </div>
      </section>

      {/* التكاملات */}
      <section id="integrations" className="max-w-7xl mx-auto px-5 py-14">
        <SectionHead tag={t.integTag} title={t.integTitle} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {integrations.map((it) => {
            const I = it.icon;
            return (
              <div key={it.t} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-white/10 flex items-center justify-center mb-4">
                  <I size={20} className="text-emerald-200" />
                </div>
                <div className="font-semibold">{it.t}</div>
                <div className="text-white/60 text-sm mt-1.5 leading-relaxed">{it.d}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* عن المؤسس */}
      <section id="about" className="max-w-5xl mx-auto px-5 py-14">
        <SectionHead tag={t.aboutTag} title={t.aboutTitle} />
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="bg-gradient-to-br from-white/8 to-white/5 border border-white/10 rounded-3xl p-8 mt-8 grid sm:grid-cols-[auto,1fr] gap-7 items-start">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-white/15 flex items-center justify-center mx-auto sm:mx-0">
            <Crown size={40} className="text-amber-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/15 text-amber-200 border border-amber-300/20 rounded-full px-3 py-1 text-xs mb-3">
              <Sparkles size={13} /> {t.aboutChip}
            </div>
            <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{t.aboutRole}</h3>
            <p className="text-white/75 mt-3 leading-loose">
              {t.aboutText1}<b className="text-white">{t.aboutTextBold1}</b>{t.aboutTextUniv}<b className="text-white">{t.aboutTextUnivBold}</b>{t.aboutTextGrade}<b className="text-white">{t.aboutTextGradeBold}</b>{t.aboutText2} <b className="text-white">SHRM‑SCP</b> {isAr ? "الأمريكية، وشهادة" : ", the"} <b className="text-white">OTHM</b> {isAr ? "، وشهادة" : " certificate, and the"} <b className="text-white">CMI</b> {isAr ? "." : " certificate."}
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {(isAr ? t.certAr : t.certs).map((c) => {
                const I = c.includes("MA") || c.includes("ماجستير") ? GraduationCap : Award;
                return (
                  <span key={c} className="inline-flex items-center gap-1.5 text-xs bg-white/8 border border-white/15 rounded-full px-3 py-1.5">
                    <I size={13} className="text-violet-200" /> {c}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* الباقات */}
      <section id="pricing" className="max-w-5xl mx-auto px-5 py-14">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-sky-400/15 border border-sky-400/25 text-sky-200 rounded-full px-3 py-1 text-xs">{isAr ? "نظام تسعير سنوي / مرن" : "Annual / Flexible pricing system"}</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-4" style={{ fontFamily: "var(--font-display)" }}>{isAr ? "دليل هيكلة واحتساب خطة الأسعار الشرائحية العادلة" : "Fair Tiered Pricing Plan — Structure & Calculation"}</h2>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 overflow-hidden bg-[#0b1426]/70">
          <div className="px-6 py-4 border-b border-white/10 bg-[#161c2d]/80">
            <div className="font-bold text-white/90">{isAr ? "1. جدول شرائح الأسعار الرسمية" : "1. Official Pricing Tiers Table"}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#161c2d] text-white/80">
                <tr>
                  <th className="text-right font-semibold px-4 py-3">{isAr ? "الفئة / الشريحة" : "Tier"}</th>
                  <th className="text-right font-semibold px-4 py-3">{isAr ? "نطاق أعداد العمال / الموظفين" : "Headcount range"}</th>
                  <th className="text-right font-semibold px-4 py-3">{isAr ? "السعر السنوي (ر.س)" : "Annual (SAR)"}</th>
                  <th className="text-right font-semibold px-4 py-3">{isAr ? "ملاحظات القيمة والتغطية" : "Coverage notes"}</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                {(isAr ? tiersAr : tiersEn).map((row, i) => (
                  <tr key={row.id || i} className={i % 2 ? "bg-white/[0.03]" : "bg-transparent"}>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{row.tier}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.range}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><span className="font-extrabold text-sky-300">{row.yearly.toLocaleString()} {isAr ? "ر.س / سنوياً" : "SAR/yr"}</span></td>
                    <td className="px-4 py-3 text-white/65">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-white/10 text-xs text-white/50">{isAr ? "جميع الأسعار سنوية شاملة الضريبة. تُحدّد الشريحة المناسبة وفق عدد الموظفين." : "All prices are annual, tax-inclusive. The applicable tier is determined by employee headcount."}</div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <button onClick={() => scrollTo("trial")} className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl py-3.5 font-medium transition">{isAr ? "جرّب مجاناً 30 يوماً" : "Try free for 30 days"}</button>
          <button onClick={() => navigate("/quote")} className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 rounded-2xl py-3.5 font-semibold shadow-xl shadow-violet-500/30 transition">{isAr ? "اطلب عرض سعر" : "Request a quote"}</button>
        </div>
      </section>

      {/* تجربة / تسجيل */}
      <section id="trial" className="max-w-3xl mx-auto px-5 py-14">
        <SectionHead tag={t.trialTag} title={t.trialTitle} />
        {done ? (
          <div className="bg-white/5 border border-emerald-400/30 rounded-3xl p-10 text-center mt-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <BadgeCheck size={32} className="text-emerald-300" />
            </div>
            <div className="text-2xl font-bold">{t.doneTitle}</div>
            <p className="text-white/70 mt-2">{t.doneDesc}</p>
            <Link to="/company-login?returnTo=/app" className="inline-flex items-center gap-2 mt-6 text-violet-300 hover:text-violet-200">
              {t.doneCta} <ArrowLeft size={16} style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 mt-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t.form.company} value={form.name} onChange={(v) => set("name", v)} required />
              <Field label={t.form.industry} value={form.industry} onChange={(v) => set("industry", v)} />
              <Field label={t.form.city} value={form.city} onChange={(v) => set("city", v)} />
              <Field label={t.form.contact} value={form.contact_name} onChange={(v) => set("contact_name", v)} />
              <Field label={t.form.unified} value={form.unified_number} onChange={(v) => set("unified_number", v.replace(/\D/g, ""))} required />
              <Field label={t.form.phone} value={form.contact_phone} onChange={(v) => set("contact_phone", v)} required />
            </div>
            <Field label={t.form.email} value={form.contact_email} onChange={(v) => set("contact_email", v)} type="email" required />
            <Field label={t.form.headcount} value={form.employee_count} onChange={(v) => set("employee_count", v.replace(/\D/g, ""))} required />
            {(() => { const pt = form.employee_count ? tierForCount(form.employee_count, isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN) : null; return pt ? <div className="text-sm rounded-xl bg-violet-500/10 border border-violet-400/20 text-violet-200 px-4 py-3">{t.form.pricePreview(pt.tier, pt.yearly)}</div> : null; })()}
            <div className="flex justify-center">
              <TurnstileWidget key={captchaKey} onToken={setCaptcha} className="rounded-xl overflow-hidden" />
            </div>
            {err && <div className="text-rose-300 text-sm bg-rose-500/10 border border-rose-400/20 rounded-xl p-3">{err}</div>}
            <button type="submit" disabled={saving || !captcha} className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-xl shadow-violet-500/30 transition disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />} {t.form.submit}
            </button>
            <p className="text-white/50 text-xs text-center flex items-center justify-center gap-1.5"><Lock size={13} /> {t.form.secure}</p>
          </form>
        )}
      </section>

      {/* شارك جدارة */}
      <section id="share" className="max-w-3xl mx-auto px-5 py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80 mb-4">{isAr ? "انشُرها على كل المنصات" : "Share on every platform"}</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ fontFamily: "var(--font-display)" }}>{isAr ? "شارك جدارة مع فريقك" : "Share Jadara with your team"}</h2>
        <p className="text-white/60 mb-6 max-w-xl mx-auto">{isAr ? "اضغط أي منصة لمشاركة رابط جدارة مباشرة لأي شخص يبحث عن نظام لإدارة الموارد البشرية." : "Click any platform to share Jadara's link with anyone looking for an HR management system."}</p>
        <ShareBar isAr={isAr} />
      </section>

      {/* تواصل */}
      <section id="contact" className="max-w-5xl mx-auto px-5 py-14">
        <SectionHead tag={t.contactTag} title={t.contactTitle} />
        <div className="grid sm:grid-cols-3 gap-5 mt-8">
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-400/20 rounded-3xl p-6 text-center transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3"><MessageCircle size={22} className="text-emerald-300" /></div>
            <div className="font-semibold">{t.wa}</div>
            <div className="text-white/60 text-sm mt-1" dir="ltr">+966 594700782</div>
          </a>
          <a href={`mailto:${SALES_EMAIL}`} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-6 text-center transition">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-3"><Mail size={22} className="text-violet-200" /></div>
            <div className="font-semibold">{t.emailCard}</div>
            <div className="text-white/60 text-sm mt-1" dir="ltr">{SALES_EMAIL}</div>
          </a>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3"><MapPin size={22} className="text-blue-200" /></div>
            <div className="font-semibold">{t.loc}</div>
            <div className="text-white/60 text-sm mt-1">{t.locVal}</div>
          </div>
        </div>
      </section>

      {/* التذييل */}
      <footer className="border-t border-white/10 mt-10">
        <div className="max-w-7xl mx-auto px-5 py-10 grid sm:grid-cols-3 gap-8 text-sm text-white/60">
          <div>
            <div className="mb-2"><Logo tone="light" size={36} /></div>
            <p>{t.footerDesc}</p>
            <div className="flex items-center gap-2 mt-4">
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"
                className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin size={17} className="text-white/80" />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" aria-label="X (Twitter)"
                className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter size={17} className="text-white/80" />
              </a>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="font-medium text-white mb-1">{t.footContact}</div>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><MessageCircle size={14} /> WhatsApp: +966 594700782</a>
            <a href={`mailto:${SALES_EMAIL}`} className="flex items-center gap-2 hover:text-white"><Mail size={14} /> {SALES_EMAIL}</a>
          </div>
          <div className="space-y-1.5">
            <div className="font-medium text-white mb-1">{t.footPlatform}</div>
            <button onClick={() => scrollTo("features")} className="block hover:text-white">{t.nav.features}</button>
            <button onClick={() => scrollTo("pricing")} className="block hover:text-white">{t.nav.pricing}</button>
            <Link to="/about" className="block hover:text-white">{isAr ? "من نحن" : "About"}</Link>
            <Link to="/contact" className="block hover:text-white">{t.nav.contact}</Link>
            <Link to="/company-login?returnTo=/app" className="block hover:text-white">{t.login}</Link>
          </div>
        </div>
        <div className="text-center text-white/40 text-xs pb-6">{t.copy}</div>
      </footer>

    </div>
  );
}

function SectionHead({ tag, title }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80">{tag}</div>
      <h2 className="text-3xl sm:text-4xl font-extrabold mt-4" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div>
      <div className="text-2xl font-extrabold bg-gradient-to-l from-violet-300 to-blue-300 bg-clip-text text-transparent">{n}</div>
      <div className="text-white/50 text-xs mt-0.5">{l}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/60">{label}</label>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/50" />
    </div>
  );
}

function FeatureLi({ children }) {
  return (
    <div className="flex items-start gap-2"><Check size={16} className="text-emerald-400 mt-0.5 shrink-0" /> <span>{children}</span></div>
  );
}