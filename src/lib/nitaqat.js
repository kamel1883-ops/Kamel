// نموذج تقريبي لبرنامج «نطاقات» (نسبة التوطين) — استرشاد فقط، وليس ربطاً حكومياً.
// النسب تقريبية مبنية على فئات النشاط الواردة في دليل وزارة الموارد البشرية.
// أي نتيجة هنا تُعرض كـ«تقريبية» ولا تُعدّ قراراً نهائياً.

// الفئات: red_max < yellow_max < greenLow_max < greenMed_max < greenHigh_max (وما فوقه بلاتيني)
export const NITAQAT_ACTIVITIES = [
  { key: "general", ar: "أنشطة عامة", en: "General activities",
    thresholds: { red: 25, yellow: 35, greenLow: 45, greenMed: 55, greenHigh: 70 } },
  { key: "industrial", ar: "صناعية", en: "Industrial",
    thresholds: { red: 15, yellow: 22, greenLow: 30, greenMed: 40, greenHigh: 55 } },
  { key: "contracting", ar: "مقاولات", en: "Contracting",
    thresholds: { red: 10, yellow: 18, greenLow: 25, greenMed: 35, greenHigh: 50 } },
  { key: "services", ar: "خدمات", en: "Services",
    thresholds: { red: 25, yellow: 35, greenLow: 45, greenMed: 55, greenHigh: 70 } },
  { key: "retail", ar: "تجزئة", en: "Retail",
    thresholds: { red: 30, yellow: 40, greenLow: 50, greenMed: 60, greenHigh: 75 } },
  { key: "transport", ar: "نقل ومواصلات", en: "Transport",
    thresholds: { red: 15, yellow: 22, greenLow: 30, greenMed: 40, greenHigh: 55 } },
  { key: "food", ar: "خدمات تغذية / تموين", en: "Food supply",
    thresholds: { red: 20, yellow: 28, greenLow: 35, greenMed: 45, greenHigh: 60 } },
  { key: "realestate", ar: "عقار", en: "Real estate",
    thresholds: { red: 20, yellow: 28, greenLow: 35, greenMed: 45, greenHigh: 60 } },
  { key: "agriculture", ar: "زراعة", en: "Agriculture",
    thresholds: { red: 10, yellow: 15, greenLow: 20, greenMed: 30, greenHigh: 45 } },
  { key: "other", ar: "أخرى / لا ينطبق", en: "Other / N/A",
    thresholds: { red: 25, yellow: 35, greenLow: 45, greenMed: 55, greenHigh: 70 } },
];

export function activityByKey(key) {
  return NITAQAT_ACTIVITIES.find((a) => a.key === key) || NITAQAT_ACTIVITIES[0];
}

// البيانات الوصفية لكل نطاق: لون، تصنيف (آمن/تحذير/خطر)، المزايا والمخاطر
export const BAND_META = {
  platinum: {
    key: "platinum", tier: "safe",
    ar: "بلاتيني", en: "Platinum",
    color: "#a16207", bg: "#fef3c7", ring: "#fcd34d",
    benefits_ar: [
      "إصدار تأشيرات العمل دون قيود",
      "تجديد وإصدار رخص العمل بكامل الخدمات",
      "حجز رصيد استقدام مرتفع",
      "نقل خدمات العمالة الوافدة بحرية",
      "الوصول لخدمات قوى المتميزة",
    ],
    risks_ar: [],
  },
  green_high: {
    key: "green_high", tier: "safe",
    ar: "أخضر مرتفع", en: "High green",
    color: "#15803d", bg: "#dcfce7", ring: "#86efac",
    benefits_ar: [
      "إصدار تأشيرات العمل",
      "تجديد رخص العمل",
      "حجز رصيد استقدام",
      "نقل خدمات العمالة الوافدة",
    ],
    risks_ar: [],
  },
  green_medium: {
    key: "green_medium", tier: "safe",
    ar: "أخضر متوسط", en: "Medium green",
    color: "#16a34a", bg: "#dcfce7", ring: "#86efac",
    benefits_ar: [
      "إصدار تأشيرات العمل بحدود معقولة",
      "تجديد رخص العمل",
      "حجز رصيد استقدام محدود",
    ],
    risks_ar: [],
  },
  green_low: {
    key: "green_low", tier: "safe",
    ar: "أخضر منخفض", en: "Low green",
    color: "#65a30d", bg: "#ecfccb", ring: "#bef264",
    benefits_ar: [
      "إصدار تأشيرات عمل محدود",
      "تجديد رخص العمل للعمالة الحالية",
      "نقل خدمات الوافدين بشروط",
    ],
    risks_ar: ["قريب من النطاق الأصفر — راقب نسبة التوطين"],
  },
  yellow: {
    key: "yellow", tier: "warning",
    ar: "أصفر", en: "Yellow",
    color: "#ca8a04", bg: "#fef9c3", ring: "#fde047",
    benefits_ar: [],
    risks_ar: [
      "لا تُصدر تأشيرات عمل جديدة",
      "تجديد رخص العمل للعمالة الحالية فقط",
      "نقل خدمات الوافدين محدود جداً",
      "فترة تصحيح قبل الانتقال للنطاق الأحمر",
    ],
  },
  red: {
    key: "red", tier: "danger",
    ar: "أحمر", en: "Red",
    color: "#dc2626", bg: "#fee2e2", ring: "#fca5a5",
    benefits_ar: [],
    risks_ar: [
      "إيقاف إصدار تأشيرات العمل الجديدة",
      "عدم تجديد رخص العمل — يتوقف إصدار وتجديد رخصة العامل",
      "إيقاف الخدمات الحكومية المرتبطة بالمنشأة",
      "نقل ملكية الوافدين مسموح للمنشآت المتعاونة فقط",
      "خطر فقدان العمالة الحالية وتقييد النشاط",
    ],
  },
};

const BAND_ORDER = ["red", "yellow", "green_low", "green_medium", "green_high", "platinum"];

// القلب الحسابي: يحدد النطاق بناءً على نسبة التوطين ونشاط المنشأة
export function computeNitaqat(saudis, expats, activityKey) {
  const total = saudis + expats;
  const pct = total > 0 ? (saudis / total) * 100 : 0;
  const act = activityByKey(activityKey);
  const th = act.thresholds;
  let bandKey;
  if (total === 0) bandKey = "red";
  else if (pct < th.red) bandKey = "red";
  else if (pct < th.yellow) bandKey = "yellow";
  else if (pct < th.greenLow) bandKey = "green_low";
  else if (pct < th.greenMed) bandKey = "green_medium";
  else if (pct < th.greenHigh) bandKey = "green_high";
  else bandKey = "platinum";
  return {
    saudis, expats, total,
    saudizationPct: Math.round(pct * 10) / 10,
    bandKey,
    band: BAND_META[bandKey],
    activity: act,
    thresholds: th,
    bandOrder: BAND_ORDER,
  };
}

// كم سعودي يلزم للانتقال للنطاق الآمن (أخضر منخفض) التالي؟
export function saudisNeededForSafe(result) {
  if (!result || result.total === 0) return 1;
  const th = result.thresholds;
  const target = result.bandKey === "red" ? th.yellow : result.bandKey === "yellow" ? th.greenLow : null;
  if (target === null) return 0;
  // n/(n+expats) >= target/100  →  n >= expats*target/(100-target)
  if (target >= 100) return 0;
  const needed = Math.ceil((result.expats * target) / (100 - target));
  return Math.max(0, needed - result.saudis);
}