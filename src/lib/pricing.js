// شرائح الأسعار الرسمية — مرجع موحّد لصفحة الهبوط ولوحة المالك
// Official pricing tiers — shared reference for the landing page and owner admin

export const PRICING_TIERS_AR = [
  { id: "micro", min: 1, tier: "الشريحة الأولى (البداية)", range: "من 1 إلى 30 عامل", yearly: 1500, note: "مناسبة جداً للمنشآت الصغيرة والمشاريع الناشئة، تغطي التكلفة التشغيلية تقريباً من أول اشتراك." },
  { id: "small", min: 31, tier: "الشريحة الثانية (الناشئة)", range: "من 31 إلى 100 عامل", yearly: 2800, note: "تطلق النمو السريع للمنشآت الصغيرة مع هامش ربحي مرتفع وخدمات." },
  { id: "medium", min: 101, tier: "الشريحة الثالثة (المتوسطة)", range: "من 101 إلى 300 عامل", yearly: 4200, note: "إدارة متكاملة لفرق العمل المتوسطة مع توفير قيمة عالية مقابل التكلفة." },
  { id: "growth", min: 301, tier: "الشريحة الرابعة (المتقدمة)", range: "من 301 إلى 700 عامل", yearly: 6000, note: "دعم كامل وإمكانيات ربط متقدمة وميزات تحليلات الموارد البشرية." },
  { id: "enterprise", min: 701, tier: "الشريحة الخامسة (الكبرى)", range: "من 701 إلى 1,000+ عامل", yearly: 8500, note: "تغطية غير محدودة، دعم فني مختص، وربط خاص بروابط البرمجة (API) للشركات الكبرى." },
];

export const PRICING_TIERS_EN = [
  { id: "micro", min: 1, tier: "Tier 1 (Micro)", range: "1 – 30 employees", yearly: 1500, note: "Ideal for small businesses and startups — covers operating cost right from the first subscription." },
  { id: "small", min: 31, tier: "Tier 2 (Small)", range: "31 – 100 employees", yearly: 2800, note: "Drives rapid growth for small firms with a high profit margin and services." },
  { id: "medium", min: 101, tier: "Tier 3 (Medium)", range: "101 – 300 employees", yearly: 4200, note: "Integrated management for mid-sized teams with great value for cost." },
  { id: "growth", min: 301, tier: "Tier 4 (Growth)", range: "301 – 700 employees", yearly: 6000, note: "Full support, advanced integrations, and HR analytics features." },
  { id: "enterprise", min: 701, tier: "Tier 5 (Enterprise)", range: "701 – 1,000+ employees", yearly: 8500, note: "Unlimited coverage, dedicated technical support, and API integration for large enterprises." },
];

// إرجاع الشريحة المطابقة لعدد الموظفين
export function tierForCount(count, tiers = PRICING_TIERS_AR) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n <= 30) return tiers[0];
  if (n <= 100) return tiers[1];
  if (n <= 300) return tiers[2];
  if (n <= 700) return tiers[3];
  return tiers[4];
}