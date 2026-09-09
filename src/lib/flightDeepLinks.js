// مولّد روابط البحث العميقة لمزوّدي حجوزات الطيران.
//
// ✅ المسافر (Almosafer): يدعم الانتقال المباشر لصفحة نتائج البحث.
//    https://www.almosafer.com/en/flights/search?origin=RUH&destination=CAI&departure_date=YYYY-MM-DD&...
//
// ✅ Skyscanner: يدعم الانتقال المباشر لصفحة نتائج البحث.
//    https://www.skyscanner.com.sa/transport/flights/ruh/dxb/260915/?adultsv2=1&cabinclass=economy
//
// ✅ Wingie (وينجي): يدعم الانتقال المباشر لصفحة نتائج البحث.
//    https://sa.wingie.com/flights/search/{city}-to-{city}-{iata}a-{iata}a/?departure=DD.MM.YYYY&adult=N
//
// ⚠️ المطار (Almatar): تطبيق Angular لا يدعم الروابط العميقة لنتائج البحث.
//    يهبط المستخدم على صفحة البحث ويُدخل البيانات يدوياً.

import { findAirport } from "@/lib/airports";

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
  skyscanner: {
    key: "skyscanner",
    name: "Skyscanner",
    nameEn: "Skyscanner",
    flightsBase: "https://www.skyscanner.com.sa/transport/flights",
    site: "https://www.skyscanner.com.sa",
    logo: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/6c6857001_generated_image.png",
    brand: "#0770e3",
    deepLinkSupported: true,
  },
  wingie: {
    key: "wingie",
    name: "وينجي",
    nameEn: "Wingie",
    flightsBase: "https://sa.wingie.com/flights/search",
    site: "https://sa.wingie.com",
    logo: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/2af06bcc3_generated_image.png",
    brand: "#e81932",
    deepLinkSupported: true,
  },
};

const CABIN_ALMOSAFER = { economy: "Economy", business: "Business", first: "First" };
const CABIN_SKYSCANNER = { economy: "economy", business: "business", first: "first" };

/** يحوّل اسم المدينة الإنجليزي إلى slug مناسب لرابط Wingie (أحرف صغيرة، مسافات → شرطات). */
function citySlug(iata) {
  const a = findAirport(iata);
  if (!a || !a.cityEn) return iata.toLowerCase();
  return a.cityEn.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/** يحوّل تاريخ YYYY-MM-DD إلى صيغة YYMMDD لـ Skyscanner. */
function toYYMMDD(date) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}${m}${d}`;
}

/** يحوّل تاريخ YYYY-MM-DD إلى صيغة DD.MM.YYYY لـ Wingie. */
function toDDMMYYYY(date) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  return `${d}.${m}.${y}`;
}

/**
 * يبني رابط بحث الطيران للمزوّد المختار.
 * @param {string} providerKey - "almatar" | "almosafer" | "skyscanner" | "wingie"
 * @param {object} p - { origin, destination, departDate, returnDate, adults, children, infants, cabin, tripType }
 */
export function buildFlightSearchUrl(providerKey, p) {
  const provider = FLIGHT_PROVIDERS[providerKey];
  if (!provider) return null;

  if (providerKey === "almosafer") {
    const params = new URLSearchParams();
    params.set("origin", p.origin);
    params.set("destination", p.destination);
    params.set("departure_date", p.departDate || "");
    if (p.tripType === "round" && p.returnDate) params.set("return_date", p.returnDate);
    params.set("cabin", CABIN_ALMOSAFER[p.cabin] || "Economy");
    params.set("adults", String(p.adults ?? 1));
    params.set("children", String(p.children ?? 0));
    params.set("infants", String(p.infants ?? 0));
    return `${provider.flightsBase}?${params.toString()}`;
  }

  if (providerKey === "skyscanner") {
    const from = p.origin.toLowerCase();
    const to = p.destination.toLowerCase();
    const dep = toYYMMDD(p.departDate);
    let path = `${provider.flightsBase}/${from}/${to}/${dep}/`;
    if (p.tripType === "round" && p.returnDate) path += `${toYYMMDD(p.returnDate)}/`;
    const params = new URLSearchParams();
    params.set("adultsv2", String(p.adults ?? 1));
    if (p.children > 0) params.set("childrenv2", Array(p.children).fill("8").join("|"));
    params.set("cabinclass", CABIN_SKYSCANNER[p.cabin] || "economy");
    return `${path}?${params.toString()}`;
  }

  if (providerKey === "wingie") {
    const fromCity = citySlug(p.origin);
    const toCity = citySlug(p.destination);
    const fromIata = p.origin.toLowerCase();
    const toIata = p.destination.toLowerCase();
    const path = `${provider.flightsBase}/${fromCity}-to-${toCity}-${fromIata}a-${toIata}a/`;
    const params = new URLSearchParams();
    params.set("departure", toDDMMYYYY(p.departDate));
    if (p.tripType === "round" && p.returnDate) params.set("return", toDDMMYYYY(p.returnDate));
    params.set("adult", String(p.adults ?? 1));
    return `${path}?${params.toString()}`;
  }

  // Almatar — لا يدعم الروابط العميقة، نمرر المعطيات كأفضل تخمين
  const params = new URLSearchParams();
  params.set("origin", p.origin);
  params.set("destination", p.destination);
  params.set("departure_date", p.departDate || "");
  if (p.tripType === "round" && p.returnDate) params.set("return_date", p.returnDate);
  params.set("cabin", CABIN_ALMOSAFER[p.cabin] || "Economy");
  params.set("adults", String(p.adults ?? 1));
  return `${provider.flightsBase}?${params.toString()}`;
}