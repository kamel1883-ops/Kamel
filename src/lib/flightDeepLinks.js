// مولّد روابط البحث العميقة لموقعَي «المطار» و«المسافر».
// ملاحظة مهمة: المواقع الاستهلاكية لا تنشر مخططاً موثّقاً لمعطيات الرابط العميق،
// لذلك تُمرَّر بيانات البحث بأسماء معطيات شائعة في بوابات الحجز. إذا لم يُعبّئ الموقع
// النموذج تلقائياً، يهبط المستخدم على صفحة البحث ويُدخل نفس البيانات بسرعة.
// لتعديل الصيغة لاحقاً عند التأكد منها: غيّر هذا الملف فقط.

export const FLIGHT_PROVIDERS = {
  almatar: {
    key: "almatar",
    name: "المطار",
    nameEn: "Almatar",
    flightsBase: "https://almatar.com/en/flights/",
    site: "https://almatar.com",
  },
  almosafer: {
    key: "almosafer",
    name: "المسافر",
    nameEn: "Almosafer",
    flightsBase: "https://www.almosafer.com/en",
    site: "https://www.almosafer.com",
  },
};

const CABIN_VALUE = { economy: "Economy", business: "Business", first: "First" };

/**
 * يبني رابط بحث الطيران للمزوّد المختار.
 * @param {string} providerKey - "almatar" | "almosafer"
 * @param {object} p - { origin, destination, departDate, returnDate, adults, children, infants, cabin, tripType }
 */
export function buildFlightSearchUrl(providerKey, p) {
  const provider = FLIGHT_PROVIDERS[providerKey];
  if (!provider) return null;
  const params = new URLSearchParams();
  params.set("origin", p.origin);
  params.set("destination", p.destination);
  params.set("departureDate", p.departDate || "");
  if (p.tripType === "round" && p.returnDate) params.set("returnDate", p.returnDate);
  params.set("adults", String(p.adults ?? 1));
  params.set("children", String(p.children ?? 0));
  params.set("infants", String(p.infants ?? 0));
  params.set("cabin", CABIN_VALUE[p.cabin] || "Economy");
  params.set("tripType", p.tripType === "round" ? "round" : "oneway");
  return `${provider.flightsBase}?${params.toString()}`;
}