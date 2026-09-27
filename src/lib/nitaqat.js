// نظام «نطاقات المطور» 2026 — وفق الدليل الإجرائي لوزارة الموارد البشرية والتنمية الاجتماعية.
//
// المعادلة الرسمية لاحتساب الحد الأدنى لكل نطاق:
//   ص = م × لوغ(س) + ث
//   ص: النسبة الأدنى المطلوبة للنطاق
//   م: ثابت المنحنى (حسب النشاط)
//   س: إجمالي العمالة في الكيان
//   لوغ(س): اللوغاريتم الطبيعي لإجمالي العمالة
//   ث: ثابت التوطين (حسب النشاط والنطاق والسنة)
//
// النطاقات خمسة (لا يوجد نطاق أصفر في نطاقات المطور): أحمر، أخضر منخفض، أخضر متوسط، أخضر مرتفع، بلاتيني.
// تُطبّق المعادلة 4 مرات (للأخضر المنخفض/المتوسط/المرتفع/البلاتيني)، ومن يقِل عن حد الأخضر المنخفض فهو في الأحمر.
//
// الأنشطة الـ41 المعتمدة (المرفق الأول للدليل الإجرائي) — نفس قائمة منصة قوى.
//
// ملاحظة حول الثوابت: الثابت الموثّق رسمياً المتاح لدينا هو نشاط «البيع بالجملة والتجزئة العامة» (رمز 10)
// للأخضر المنخفض 2026: م = 2.47 ، ث = 23.25. باقي ثوابت الأنشطة مُولّدة تقديرياً وفق سلوك المعادلة
// وقابلة للاستبدال بثوابت المرفق الأول الرسمية متى توفرت. النتيجة الرسمية ما تزال على منصة قوى.

// إزاحات تقديرية بين النطاقات (تُضاف إلى ث الأخضر المنخفض للحصول على ث بقية النطاقات)
const BAND_C_OFFSET = { green_low: 0, green_medium: 9, green_high: 18, platinum: 28 };

export const NITAQAT_ACTIVITIES = [
  { code: "0", ar: "الزراعة والفروسية", en: "Agriculture & Equestrian", m: 2.0, c: 13 },
  { code: "1", ar: "الهيدروكربونات", en: "Hydrocarbons", m: 2.2, c: 17 },
  { code: "2", ar: "تعدين المعادن الفلزية", en: "Metallic Mining", m: 2.0, c: 15 },
  { code: "3", ar: "تعدين غير الفلزية", en: "Non-Metallic Mining", m: 2.0, c: 15 },
  { code: "4", ar: "تعدين مواد البناء", en: "Building Materials Mining", m: 2.0, c: 15 },
  { code: "5", ar: "الطاقة والمياه", en: "Energy & Water", m: 2.3, c: 20 },
  { code: "6", ar: "الصناعات", en: "Industries", m: 2.3, c: 19 },
  { code: "7", ar: "التشييد والبناء", en: "Construction", m: 2.0, c: 14 },
  { code: "8", ar: "التشغيل والصيانة", en: "Operation & Maintenance", m: 2.2, c: 19 },
  { code: "9", ar: "النظافة والمغاسل", en: "Cleaning & Laundries", m: 2.2, c: 18 },
  { code: "10", ar: "البيع بالجملة والتجزئة العامة", en: "Wholesale & General Retail", m: 2.47, c: 23.25, verified: true },
  { code: "11", ar: "تجزئة العطور والساعات", en: "Perfumes & Watches Retail", m: 2.5, c: 24 },
  { code: "12", ar: "تجزئة الأزياء والسلع", en: "Apparel & Goods Retail", m: 2.5, c: 24 },
  { code: "13", ar: "السلع النسائية والجوال", en: "Womens Goods & Mobile", m: 2.5, c: 24 },
  { code: "14", ar: "حلول الاتصالات", en: "Telecom Solutions", m: 2.4, c: 22 },
  { code: "15", ar: "أنشطة البريد", en: "Postal Activities", m: 2.3, c: 20 },
  { code: "16", ar: "بنية تقنية المعلومات", en: "IT Infrastructure", m: 2.4, c: 22 },
  { code: "17", ar: "بنية الاتصالات", en: "Telecom Infrastructure", m: 2.4, c: 22 },
  { code: "18", ar: "صيانة الاتصالات", en: "Telecom Maintenance", m: 2.3, c: 20 },
  { code: "19", ar: "صيانة تقنية المعلومات", en: "IT Maintenance", m: 2.3, c: 20 },
  { code: "20", ar: "حلول تقنية المعلومات", en: "IT Solutions", m: 2.4, c: 22 },
  { code: "21", ar: "النقل البري والتخزين", en: "Land Transport & Storage", m: 2.1, c: 16 },
  { code: "22", ar: "النقل البحري والجوي", en: "Sea & Air Transport", m: 2.2, c: 18 },
  { code: "23", ar: "مطاعم مع الخدمة", en: "Full-Service Restaurants", m: 2.3, c: 20 },
  { code: "24", ar: "مطاعم خدمة سريعة", en: "Fast-Food Restaurants", m: 2.3, c: 20 },
  { code: "25", ar: "المقاهي والمشروبات", en: "Cafes & Beverages", m: 2.3, c: 20 },
  { code: "26", ar: "التموين والإعاشة", en: "Catering", m: 2.2, c: 18 },
  { code: "27", ar: "الحراسات الأمنية", en: "Security Guards", m: 2.2, c: 18 },
  { code: "28", ar: "المؤسسات المالية", en: "Financial Institutions", m: 2.5, c: 24 },
  { code: "29", ar: "خدمات الأعمال", en: "Business Services", m: 2.4, c: 22 },
  { code: "30", ar: "الخدمات الاجتماعية", en: "Social Services", m: 2.4, c: 22 },
  { code: "31", ar: "الخدمات الشخصية", en: "Personal Services", m: 2.3, c: 20 },
  { code: "32", ar: "التعليم العالي", en: "Higher Education", m: 2.5, c: 24 },
  { code: "33", ar: "التعليم العالي الصحي", en: "Higher Health Education", m: 2.5, c: 24 },
  { code: "34", ar: "مدارس البنات والحضانات", en: "Girls Schools & Nurseries", m: 2.5, c: 24 },
  { code: "35", ar: "المدارس الأجنبية", en: "Foreign Schools", m: 2.5, c: 24 },
  { code: "36", ar: "المختبرات والصحة", en: "Labs & Health", m: 2.5, c: 24 },
  { code: "37", ar: "الإيواء والسياحة", en: "Accommodation & Tourism", m: 2.4, c: 22 },
  { code: "38", ar: "السلع والمحروقات", en: "Goods & Fuels", m: 2.3, c: 20 },
  { code: "39", ar: "مدارس البنين والمجمعات", en: "Boys Schools & Complexes", m: 2.5, c: 24 },
  { code: "40", ar: "الكيانات المجمعة", en: "Aggregated Entities", m: 2.47, c: 23.25 },
];

export function activityByCode(code) {
  return NITAQAT_ACTIVITIES.find((a) => a.code === String(code)) || NITAQAT_ACTIVITIES[10];
}

// ثوابت كل نطاط لنشاط معيّن عند حجم عمالة معيّن (2026)
export function bandThreshold(activity, bandKey, headcount) {
  if (headcount <= 0) return 0;
  const c = activity.c + (BAND_C_OFFSET[bandKey] || 0);
  return Math.max(0, Math.round((activity.m * Math.log(headcount) + c) * 10) / 10);
}

// بيانات النطاقات الخمسة — المزايا والإشكاليات منقولة من الدليل الإجرائي لبرنامج نطاقات المطور 2026
export const BAND_META = {
  platinum: {
    key: "platinum", tier: "safe",
    ar: "بلاتيني", en: "Platinum",
    color: "#a16207", bg: "#fef3c7", ring: "#fcd34d",
    benefits_ar: [
      "رصيد التأشيرات (إصدار تأشيرات عمل جديدة)",
      "تغيير مهن العمالة الوافدة للمهن المتاحة",
      "تجديد رخص العمل بغض النظر عن مدة الإقامة (بشرط ألا يزيد المتبقي في إقامة العامل عن ستة أشهر عند التجديد)",
      "نقل الخدمات من أي نطاق",
      "الاحتساب الفوري في البرنامج",
    ],
    risks_ar: [],
  },
  green_high: {
    key: "green_high", tier: "safe",
    ar: "أخضر مرتفع", en: "High Green",
    color: "#15803d", bg: "#dcfce7", ring: "#86efac",
    benefits_ar: [
      "رصيد التأشيرات (إصدار تأشيرات عمل جديدة)",
      "تغيير مهن العمالة الوافدة للمهن المتاحة",
      "تجديد رخص العمل",
      "نقل الخدمات من أي نطاق",
      "الاحتساب الفوري في البرنامج",
    ],
    risks_ar: [],
  },
  green_medium: {
    key: "green_medium", tier: "safe",
    ar: "أخضر متوسط", en: "Medium Green",
    color: "#16a34a", bg: "#dcfce7", ring: "#86efac",
    benefits_ar: [
      "إمكانية استقبال طلبات التأشيرات",
      "تغيير المهن وفق الشروط",
      "تجديد رخص العمل",
      "نقل الخدمات بشروط",
      "الاحتساب الفوري في البرنامج",
    ],
    risks_ar: [],
  },
  green_low: {
    key: "green_low", tier: "warning",
    ar: "أخضر منخفض", en: "Low Green",
    color: "#65a30d", bg: "#ecfccb", ring: "#bef264",
    benefits_ar: [
      "تجديد رخص العمل للعمالة القائمة",
      "الاحتساب الفوري في البرنامج",
    ],
    risks_ar: [
      "إيقاف طلبات التأشيرات الجديدة (لا استقدام جديد)",
      "إيقاف طلبات تغيير المهن",
    ],
  },
  red: {
    key: "red", tier: "danger",
    ar: "أحمر", en: "Red",
    color: "#dc2626", bg: "#fee2e2", ring: "#fca5a5",
    benefits_ar: [],
    risks_ar: [
      "لا تُصدر تأشيرات عمل جديدة",
      "لا يُسمح بإصدار رخص عمل لعمالة جديدة",
      "لا تجديد لرخص العمل للعمالة القائمة (إيقاف التجديد — الخطر التشغيلي الأكبر)",
      "لا نقل خدمات إليك",
      "لا تغيير مهن للعمالة الوافدة",
    ],
  },
};

const BAND_ORDER = ["red", "green_low", "green_medium", "green_high", "platinum"];

// القلب الحسابي: يحدد النطاق بناءً على نسبة التوطين ونشاط الكيان وحجم العمالة (معادلة نطاقات المطور)
export function computeNitaqat(saudis, expats, activityCode) {
  const s = Number(saudis) || 0;
  const e = Number(expats) || 0;
  const total = s + e;
  const pct = total > 0 ? (s / total) * 100 : 0;
  const activity = activityByCode(activityCode);

  // الكيانات متناهية الصغر (أقل من 6 عاملين): معاملة خاصة — يكفي سعودي واحد
  const micro = total > 0 && total < 6;

  const th = {
    green_low: bandThreshold(activity, "green_low", total),
    green_medium: bandThreshold(activity, "green_medium", total),
    green_high: bandThreshold(activity, "green_high", total),
    platinum: bandThreshold(activity, "platinum", total),
  };

  let bandKey;
  if (total === 0) bandKey = "red";
  else if (micro) bandKey = s >= 1 ? "green_low" : "red";
  else if (pct < th.green_low) bandKey = "red";
  else if (pct < th.green_medium) bandKey = "green_low";
  else if (pct < th.green_high) bandKey = "green_medium";
  else if (pct < th.platinum) bandKey = "green_high";
  else bandKey = "platinum";

  return {
    saudis: s, expats: e, total,
    saudizationPct: Math.round(pct * 10) / 10,
    bandKey,
    band: BAND_META[bandKey],
    activity,
    thresholds: th,
    micro,
    bandOrder: BAND_ORDER,
  };
}

// كم سعودي يلزم للخروج من النطاق الأحمر إلى الأخضر المنخفض؟
// (يتحرك الحد مع تغير الإجمالي، لذا نبحث عددياً عن أقل عدد يحقق النسبة)
export function saudisNeededForSafe(result) {
  if (!result || result.total === 0) return 1;
  if (result.bandKey !== "red") return 0;
  const { activity, expats, saudis } = result;
  for (let n = saudis; n <= saudis + 5000; n++) {
    const tot = n + expats;
    const thr = bandThreshold(activity, "green_low", tot);
    if (tot > 0 && (n / tot) * 100 >= thr) return n - saudis;
  }
  return 0;
}