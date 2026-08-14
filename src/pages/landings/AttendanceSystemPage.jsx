import { CalendarCheck, MapPin, Clock, FileCheck, Bell, BarChart3, Printer, Upload, Users2 } from "lucide-react";
import FeatureLanding from "@/components/landing/FeatureLanding";

export default function AttendanceSystemPage() {
  return <FeatureLanding content={CONTENT} />;
}

const CONTENT = {
  path: "/attendance-system",
  ar: {
    badge: "نظام الحضور والانصراف السعودي",
    titlePre: "نظام",
    titleHi: "الحضور والانصراف الذكي",
    hero: "نظام الحضور والانصراف من جدارة — تسجيل حضور بالبصمة عبر GPS ضمن نطاق 50 متراً من مقر العمل، استيراد جداول الحضور بالجملة، متابعة التأخر والغياب والإجازة، وتقارير شهرية قابلة للتحميل PDF بشعار المنشأة. للمنشآت في الرياض وجدة والدمام ومكة وباقي المملكة.",
    heroImg: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80",
    ctaPrimary: "ابدأ تجربتك المجانية 30 يوماً",
    painTitle: "تحدّيات متابعة الحضور والانصراف",
    painPoints: [
      "تسجيل حضور دقيق دون أجهزة بصمة مكلفة.",
      "ضمان أن الموظف يحضر من مقر العمل فعلاً.",
      "إدارة جداول الحضور لمئات الموظفين بسهولة.",
      "ربط الحضور بالرواتب وخصم الغياب تلقائياً.",
      "إصدار تقارير شهرية جاهزة للإدارة والتدقيق.",
    ],
    featuresTag: "منظومة الحضور",
    featuresTitle: "مزايا نظام الحضور والانصراف",
    features: [
      { icon: MapPin, t: "بصمة GPS", d: "تسجيل حضور ضمن نطاق 50 متراً من مقر العمل — بديل عملي لأجهزة البصمة." },
      { icon: Clock, t: "متابعة الدوام", d: "حضور، انصراف، ساعات عمل، تأخر، وغياب في لوحة واحدة." },
      { icon: Upload, t: "استيراد بالجملة", d: "ارفع جداول الحضور من ملفات Excel/CSV بنقرة واحدة." },
      { icon: Users2, t: "حالة كل موظف", d: "حاضر، متأخر، غائب، إجازة — مع شارات حالة واضحة." },
      { icon: FileCheck, t: "ربط الرواتب", d: "يُغذّي نظام الرواتب بأيام الحضور والغياب تلقائياً." },
      { icon: Printer, t: "تقارير شهرية PDF", d: "حمّل تقرير حضور أي شهر سابق PDF بشعار منشأتك وجدارة." },
      { icon: Bell, t: "تنبيهات التأخر", d: "إشعارات فورية عند تسجيل تأخر الموظف." },
      { icon: CalendarCheck, t: "بحوث الأشهر الماضية", d: "تصفّح شهور الحضور الماضية بمحرك بحث سريع." },
      { icon: BarChart3, t: "تحليلات الحضور", d: "معدلات الحضور والتأخر والغياب لكل قسم وفرع." },
    ],
    stepsTitle: "كيف يعمل نظام الحضور",
    steps: [
      { t: "حدّد مقر العمل", d: "أدخل إحداثيات مقر العمل ونطاق البصمة (افتراضي 50 متراً)." },
      { t: "سجّل الحضور", d: "يسجّل الموظف الحضور والانصراف عبر بوابة الموظف بالـ GPS." },
      { t: "استورد عند الحاجة", d: "ارفع جداول الحضور بالجملة لإدخال سريع للموظفين." },
      { t: "صدّر تقرير الشهر", d: "حمّل تقرير حضور أي شهر PDF بشعار منشأتك." },
    ],
    faqTitle: "أسئلة شائعة عن الحضور والانصراف",
    faqs: [
      { q: "هل يحتاج نظام الحضور إلى أجهزة بصمة؟", a: "لا — يعتمد جدارة على بصمة GPS ضمن نطاق 50 متراً من مقر العمل عبر بوابة الموظف، بديل عملي واقتصادي لأجهزة البصمة التقليدية." },
      { q: "هل يمكنني استيراد جداول الحضور بالجملة؟", a: "نعم — يمكنك رفع ملفات Excel/CSV لتسجيل حضور عدد كبير من الموظفين بنقرة واحدة." },
      { q: "هل يمكنني تحميل تقرير حضور لشهر سابق؟", a: "نعم — يمكنك اختيار أي شهر من الأشهر الماضية الموجودة وتحميل تقرير PDF بشعار منشأتك وشعار جدارة." },
      { q: "هل يربط الحضور بالرواتب؟", a: "نعم — يُغذّي نظام الرواتب تلقائياً بأيام الحضور والغياب لخصم الغياب بدقة." },
      { q: "هل يدعم الفروع المتعددة؟", a: "نعم — لكل فرع مقره ونطاق بصمة مستقل وتقارير موحّدة على مستوى المنشأة." },
    ],
    ctaTitle: "حضور دقيق وتقارير لحظية — دون أجهزة",
    ctaDesc: "وفّر كلفة الأجهزة وуляحق حضور فريقك بدقة — جرّب نظام حضور جدارة مجاناً 30 يوماً.",
    seo: {
      title: "نظام الحضور والانصراف السعودي | بصمة GPS وتقارير PDF — جدارة",
      description: "نظام الحضور والانصراف من جدارة — بصمة GPS ضمن 50 متراً، استيراد جداول الحضور، ربط بالرواتب، وتقارير شهرية PDF بشعار منشأتك. للشركات في الرياض وجدة والدمام ومكة وباقي السعودية.",
      keywords: "نظام الحضور والانصراف, برنامج الحضور والانصراف, نظام حضور سعودي, بصمة GPS, تتبع الحضور, نظام الحضور الرياض, نظام الحضور جدة, تقارير حضور PDF, استيراد جداول الحضور, ربط الحضور بالرواتب",
    },
  },
  en: {
    badge: "Saudi Attendance System",
    titlePre: "A smart",
    titleHi: "attendance & time-tracking system",
    hero: "Jadara's attendance system — GPS check-in within 50m of the workplace, bulk attendance import, lateness, absence and leave tracking, and downloadable monthly PDF reports with your logo. For companies in Riyadh, Jeddah, Dammam, Makkah and across the Kingdom.",
    heroImg: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80",
    ctaPrimary: "Start your 30-day free trial",
    painTitle: "Attendance tracking challenges",
    painPoints: [
      "Accurate attendance without expensive biometric devices.",
      "Ensuring employees actually check in from the workplace.",
      "Managing shift schedules for hundreds of employees easily.",
      "Linking attendance to payroll and auto-deducting absence.",
      "Producing monthly reports ready for management and audit.",
    ],
    featuresTag: "The attendance platform",
    featuresTitle: "Attendance system features",
    features: [
      { icon: MapPin, t: "GPS Check-in", d: "Check in within 50m of the workplace — a practical alternative to biometric devices." },
      { icon: Clock, t: "Time Tracking", d: "Check-in, check-out, work hours, lateness and absence in one dashboard." },
      { icon: Upload, t: "Bulk Import", d: "Upload attendance sheets from Excel/CSV in one click." },
      { icon: Users2, t: "Per-employee Status", d: "Present, late, absent, on leave — with clear status badges." },
      { icon: FileCheck, t: "Payroll Link", d: "Feeds the payroll system with attendance and absence automatically." },
      { icon: Printer, t: "Monthly PDF Reports", d: "Download any past month's attendance as PDF with your logo." },
      { icon: Bell, t: "Lateness Alerts", d: "Instant notifications when an employee checks in late." },
      { icon: CalendarCheck, t: "Past Month Search", d: "Browse past attendance months with a fast search engine." },
      { icon: BarChart3, t: "Attendance Analytics", d: "Attendance, lateness and absence rates by department and branch." },
    ],
    stepsTitle: "How the attendance system works",
    steps: [
      { t: "Define the Workplace", d: "Enter workplace coordinates and check-in radius (default 50m)." },
      { t: "Check in", d: "Employees check in and out via the employee portal using GPS." },
      { t: "Import when needed", d: "Upload bulk attendance sheets for fast entry." },
      { t: "Export the month", d: "Download any month's attendance report as PDF with your logo." },
    ],
    faqTitle: "Frequently asked attendance questions",
    faqs: [
      { q: "Does the attendance system require biometric devices?", a: "No — Jadara uses GPS check-in within a 50m radius of the workplace via the employee portal, a practical and cost-effective alternative to traditional biometric devices." },
      { q: "Can I import attendance schedules in bulk?", a: "Yes — you can upload Excel/CSV files to register attendance for many employees in one click." },
      { q: "Can I download a past month's attendance report?", a: "Yes — you can pick any past month and download a PDF report with your logo and the Jadara logo." },
      { q: "Does it link attendance to payroll?", a: "Yes — it feeds payroll automatically with attendance and absence days for accurate deductions." },
      { q: "Does it support multiple branches?", a: "Yes — each branch has its own location and check-in radius with unified company reports." },
    ],
    ctaTitle: "Accurate attendance and real-time reports — no devices",
    ctaDesc: "Save device costs and track your team accurately — try Jadara's attendance system free for 30 days.",
    seo: {
      title: "Saudi Attendance System | GPS Check-in & PDF Reports — Jadara",
      description: "Jadara attendance system — GPS check-in within 50m, bulk import, payroll link, and monthly PDF reports with your logo. For companies in Riyadh, Jeddah, Dammam and Makkah.",
      keywords: "Saudi attendance system, time and attendance software, GPS attendance, attendance tracking Saudi Arabia, attendance Riyadh, attendance Jeddah, PDF attendance report, payroll attendance link",
    },
  },
};

export function _icons() { return { CalendarCheck, MapPin, Clock, FileCheck, Bell, BarChart3, Printer, Upload, Users2 }; }