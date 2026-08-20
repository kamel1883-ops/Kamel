// شرائح الأسعار الرسمية — نسخة الخادم (تُستخدم في الدوال الخلفية)
// Official pricing tiers — server-side mirror of src/lib/pricing.js
// الشرائح الجديدة: البداية / الناشئة / المتوسطة / المتقدمة / الكبرى

export const PRICING_TIERS = [
  { id: "starter", min: 1, max: 20, tier: "البداية", yearly: 2400, setup: 1000, year1: 3400 },
  { id: "emerging", min: 21, max: 60, tier: "الناشئة", yearly: 3800, setup: 1500, year1: 5300 },
  { id: "medium", min: 61, max: 150, tier: "المتوسطة", yearly: 5500, setup: 2500, year1: 8000 },
  { id: "advanced", min: 151, max: 400, tier: "المتقدمة", yearly: 8000, setup: 3500, year1: 11500 },
  { id: "enterprise", min: 401, max: Infinity, tier: "الكبرى", yearly: 12000, setup: 0, year1: null, custom: true },
];

export function tierForCount(count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return null;
  return PRICING_TIERS.find((t) => n >= t.min && n <= t.max) || PRICING_TIERS[PRICING_TIERS.length - 1];
}