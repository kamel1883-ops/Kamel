// شرائح الأسعار الرسمية — نسخة الخادم (تُستخدم في الدوال الخلفية)
// Official pricing tiers — server-side mirror of src/lib/pricing.js
// الشرائح الجديدة: البداية / الناشئة / المتوسطة / المتقدمة / الكبرى

// شرائح الأسعار الرسمية — سعر سنوي واحد فقط بدون رسوم تأسيس.
export const PRICING_TIERS = [
  { id: "starter", min: 1, max: 20, tier: "البداية", yearly: 1900, setup: 0, year1: 1900 },
  { id: "emerging", min: 21, max: 60, tier: "الناشئة", yearly: 3200, setup: 0, year1: 3200 },
  { id: "medium", min: 61, max: 150, tier: "المتوسطة", yearly: 4500, setup: 0, year1: 4500 },
  { id: "advanced", min: 151, max: 400, tier: "المتقدمة", yearly: 6800, setup: 0, year1: 6800 },
  { id: "enterprise", min: 401, max: Infinity, tier: "الكبرى", yearly: 9900, setup: 0, year1: null, custom: true },
];

export function tierForCount(count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return null;
  return PRICING_TIERS.find((t) => n >= t.min && n <= t.max) || PRICING_TIERS[PRICING_TIERS.length - 1];
}