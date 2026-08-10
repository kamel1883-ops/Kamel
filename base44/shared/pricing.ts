// شرائح الأسعار الرسمية — نسخة الخادم (تُستخدم في الدوال الخلفية)
// Official pricing tiers — server-side mirror of src/lib/pricing.js

export const PRICING_TIERS = [
  { id: "micro", min: 1, max: 30, tier: "الشريحة الأولى (البداية)", yearly: 1500 },
  { id: "small", min: 31, max: 100, tier: "الشريحة الثانية (الناشئة)", yearly: 2800 },
  { id: "medium", min: 101, max: 300, tier: "الشريحة الثالثة (المتوسطة)", yearly: 4200 },
  { id: "growth", min: 301, max: 700, tier: "الشريحة الرابعة (المتقدمة)", yearly: 6000 },
  { id: "enterprise", min: 701, max: Infinity, tier: "الشريحة الخامسة (الكبرى)", yearly: 8500 },
];

export function tierForCount(count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return null;
  return PRICING_TIERS.find((t) => n >= t.min && n <= t.max) || PRICING_TIERS[PRICING_TIERS.length - 1];
}