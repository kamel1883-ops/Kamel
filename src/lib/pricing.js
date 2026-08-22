// شرائح الأسعار الرسمية — مرجع موحّد لصفحة الهبوط ولوحة المالك
// Official pricing tiers — shared reference for the landing page and owner admin
// 5 شرائح (البداية / الناشئة / المتوسطة / المتقدمة / الكبرى) — سعر سنوي واحد فقط، بدون أي رسوم تأسيس.
// إجمالي السنة الأولى = السعر السنوي (لا توجد رسوم إضافية).

export const PRICING_TIERS_AR = [
  { id: "starter", min: 1, tier: "البداية", range: "1 - 20 موظف", yearly: 1900, setup: 0, year1: 1900, note: "مناسبة جداً للمنشآت الصغيرة والمشاريع الناشئة — سعر سنوي واحد بدون رسوم تأسيس." },
  { id: "emerging", min: 21, tier: "الناشئة", range: "21 - 60 موظف", yearly: 3200, setup: 0, year1: 3200, note: "تنطلق بنمو المنشآت الصغيرة بخدمات قوية — سعر سنوي واحد بدون رسوم تأسيس." },
  { id: "medium", min: 61, tier: "المتوسطة", range: "61 - 150 موظف", yearly: 4500, setup: 0, year1: 4500, note: "إدارة متكاملة لفرق العمل المتوسطة بقيمة عالية مقابل التكلفة." },
  { id: "advanced", min: 151, tier: "المتقدمة", range: "151 - 400 موظف", yearly: 6800, setup: 0, year1: 6800, note: "دعم كامل وإمكانيات ربط متقدمة وميزات تحليلات الموارد البشرية." },
  { id: "enterprise", min: 401, tier: "الكبرى", range: "401 - 1,000+ موظف", yearly: 9900, setup: 0, year1: null, custom: true, note: "تغطية واسعة، دعم فني مختص، وربط API — السعر السنوي يبدأ من 9,900 ر.س والإجمالي حسب الاتفاق." },
];

export const PRICING_TIERS_EN = [
  { id: "starter", min: 1, tier: "Starter", range: "1 - 20 employees", yearly: 1900, setup: 0, year1: 1900, note: "Ideal for small businesses and startups — single annual price, no setup fee." },
  { id: "emerging", min: 21, tier: "Emerging", range: "21 - 60 employees", yearly: 3200, setup: 0, year1: 3200, note: "Drives rapid growth for small firms with strong services — single annual price." },
  { id: "medium", min: 61, tier: "Medium", range: "61 - 150 employees", yearly: 4500, setup: 0, year1: 4500, note: "Integrated management for mid-sized teams with great value for cost." },
  { id: "advanced", min: 151, tier: "Advanced", range: "151 - 400 employees", yearly: 6800, setup: 0, year1: 6800, note: "Full support, advanced integrations, and HR analytics features." },
  { id: "enterprise", min: 401, tier: "Enterprise", range: "401 - 1,000+ employees", yearly: 9900, setup: 0, year1: null, custom: true, note: "Wide coverage, dedicated technical support, and API integration — annual price starts at 9,900 SAR; total by agreement." },
];

// المميزات الموحّدة — نفس القائمة الكاملة في كل باقة (بدون استثناء)
export const FULL_FEATURES_AR = [
  "إدارة الموظفين", "الحضور والانصراف (بصمة ذاتية)", "إدارة الإجازات والموافقات",
  "رحلات العمل والانتداب", "إدارة الرواتب", "التأمينات الاجتماعية (GOSI)",
  "نهاية الخدمة", "إدارة الأداء", "التخطيط التعاقبي", "الهيكل التنظيمي",
  "تخطيط القوة العاملة", "تحليلات الموارد البشرية", "إدارة الأسطول والمركبات",
  "تراخيص المنشأة الحكومية", "التكاملات الذكية", "بوابة تجربة العميل",
  "سياسة العمل والإنذارات الذكية", "بوابة الموظف الذاتية",
];
export const FULL_FEATURES_EN = [
  "Employee Management", "Attendance & Self Check-in", "Leaves & Approvals",
  "Business Trips & Deputation", "Payroll", "GOSI (Social Insurance)",
  "End of Service", "Performance Management", "Succession Planning",
  "Organization Structure", "Workforce Planning", "HR Analytics",
  "Fleet & Vehicles", "Government Licenses", "Smart Integrations",
  "Client Trial Portal", "Labor Policy & Smart Warnings", "Employee Self-Service Portal",
];

// إرجاع الشريحة المطابقة لعدد الموظفين
export function tierForCount(count, tiers = PRICING_TIERS_AR) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n <= 20) return tiers[0];
  if (n <= 60) return tiers[1];
  if (n <= 150) return tiers[2];
  if (n <= 400) return tiers[3];
  return tiers[4];
}