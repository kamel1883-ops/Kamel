// مولّد روابط البحث العميقة لموقعَي «المطار» و«المسافر».
//
// ملاحظة تقنية مهمة: المزوّدان عبارة عن تطبيقات صفحة واحدة (SPA) لا تنشر
// مخططاً موثّقاً لمعطيات الرابط العميق لواجهة البحث الاستهلاكية. لذلك تُمرَّر
// بيانات البحث بأسماء معطيات مطابقة لـ API الداخلي للمسافر (origin, destination,
// departure_date, return_date, cabin, adults, children, infants) كأفضل تخمين،
// إضافةً لأسماء بديلة شائعة (from/to) لتعظيم فرصة قراءتها. إن لم يُعبّئ المزوّد
// النموذج تلقائياً، يهبط المستخدم على صفحة البحث ويُدخل نفس البيانات بسرعة.
// لتعديل الصيغة لاحقاً عند التأكد منها: غيّر هذا الملف فقط.

export const FLIGHT_PROVIDERS = {
  almatar: {
    key: "almatar",
    name: "المطار",
    nameEn: "Almatar",
    flightsBase: "https://almatar.com/en/flights/",
    site: "https://almatar.com",
    logo: "/logos/almatar.png",
    brand: "#16a34a",
  },
  almosafer: {
    key: "almosafer",
    name: "المسافر",
    nameEn: "Almosafer",
    flightsBase: "https://www.almosafer.com/en/flights-home",
    site: "https://www.almosafer.com",
    logo: "/logos/almosafer.svg",
    brand: "#003143",
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
  // الأسماء الأساسية المطابقة لـ API الداخلي للمسافر (snake_case)
  params.set("origin", p.origin);
  params.set("destination", p.destination);
  params.set("departure_date", p.departDate || "");
  if (p.tripType === "round" && p.returnDate) params.set("return_date", p.returnDate);
  params.set("cabin", CABIN_VALUE[p.cabin] || "Economy");
  params.set("adults", String(p.adults ?? 1));
  params.set("children", String(p.children ?? 0));
  params.set("infants", String(p.infants ?? 0));
  params.set("trip_type", p.tripType === "round" ? "round" : "oneway");
  // أسماء بديلة شائعة (from/to) لتعظيم فرصة قراءتها من بعض الواجهات
  params.set("from", p.origin);
  params.set("to", p.destination);
  params.set("depart", p.departDate || "");
  if (p.tripType === "round" && p.returnDate) params.set("return", p.returnDate);
  return `${provider.flightsBase}?${params.toString()}`;
}