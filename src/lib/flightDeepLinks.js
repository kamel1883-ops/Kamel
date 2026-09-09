// مولّد روابط البحث العميقة لموقعَي «المطار» و«المسافر».
//
// المسافر (Almosafer): يدعم الانتقال المباشر إلى صفحة نتائج البحث عبر:
//   https://www.almosafer.com/en/flights/search?origin=RUH&destination=CAI&departure_date=YYYY-MM-DD&...
// تم التأكد من هذه الصيغة فعلياً — تفتح صفحة النتائج مباشرةً مع المعطيات المعبّأة.
//
// المطار (Almatar): تطبيق Angular لا ينشر رابطاً عميقاً موثّقاً لصفحة نتائج البحث.
// تُمرَّر المعطيات كأفضل تخمين، لكن إن لم يقرأها التطبيق يهبط المستخدم على صفحة
// البحث ويُدخل البيانات يدوياً. لتعديل الصيغة لاحقاً عند التأكد منها: غيّر هذا الملف فقط.

export const FLIGHT_PROVIDERS = {
  almatar: {
    key: "almatar",
    name: "المطار",
    nameEn: "Almatar",
    flightsBase: "https://almatar.com/en/flights/",
    site: "https://almatar.com",
    logo: "/logos/almatar.png",
    brand: "#16a34a",
    deepLinkSupported: false,
  },
  almosafer: {
    key: "almosafer",
    name: "المسافر",
    nameEn: "Almosafer",
    flightsBase: "https://www.almosafer.com/en/flights/search",
    site: "https://www.almosafer.com",
    logo: "/logos/almosafer.svg",
    brand: "#003143",
    deepLinkSupported: true,
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
  // المعطيات الأساسية (المسافر يقرأها فعلياً في صفحة /flights/search)
  params.set("origin", p.origin);
  params.set("destination", p.destination);
  params.set("departure_date", p.departDate || "");
  if (p.tripType === "round" && p.returnDate) params.set("return_date", p.returnDate);
  params.set("cabin", CABIN_VALUE[p.cabin] || "Economy");
  params.set("adults", String(p.adults ?? 1));
  params.set("children", String(p.children ?? 0));
  params.set("infants", String(p.infants ?? 0));
  return `${provider.flightsBase}?${params.toString()}`;
}