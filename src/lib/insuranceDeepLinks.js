// مولّد روابط التأمين العميقة لمزوّدي التأمين في السعودية.
//
// ✅ تأميني (Tameeni) — التأمين الصحي للمنشآت الصغيرة والمتوسطة:
//    https://health.tameeni.com/  (صفحة بدء التسعير — تتطلب تسجيل الدخول عبر نفاذ/منشآت)
//
// ✅ بي كير (BCare) — تأمين المركبات (أفراد ومنشآت):
//    https://www.bcare.com.sa/en  (صفحة بدء التسعير — تتطلب تسجيل الدخول)
//
// ⚠️ ملاحظة: منصات التأمين تتطلب تسجيل الدخول ولا تدعم التعبئة التلقائية لبيانات التسعير
//    عبر معاملات الرابط كحال حجوزات الطيران — لذا يُفتح رابط بدء التسعير ويكمل العميل
//    إدخال البيانات ومقارنة العروض والشراء مباشرة على الموقع.

export const HEALTH_INSURANCE_PROVIDERS = {
  tameeni: {
    key: "tameeni",
    name: "تأميني",
    nameEn: "Tameeni",
    site: "tameeni.com",
    brand: "#0B8A4F",
    quoteBase: "https://health.tameeni.com/",
    info: "https://www.tameeni.com/en/health-sme",
    deepLinkSupported: false,
  },
};

export const VEHICLE_INSURANCE_PROVIDERS = {
  bcare: {
    key: "bcare",
    name: "بي كير",
    nameEn: "BCare",
    site: "bcare.com.sa",
    brand: "#E30613",
    quoteBase: "https://www.bcare.com.sa/en",
    corporateBase: "https://www.bcare.com.sa/en",
    deepLinkSupported: false,
  },
};

/** يبني رابط بدء تسعير التأمين الصحي على منصة تأميني. */
export function buildHealthInsuranceUrl(providerKey) {
  const provider = HEALTH_INSURANCE_PROVIDERS[providerKey];
  if (!provider) return null;
  return provider.quoteBase;
}

/** يبني رابط بدء تسعير تأمين المركبات على منصة بي كير (أفراد أو منشآت). */
export function buildVehicleInsuranceUrl(providerKey, p = {}) {
  const provider = VEHICLE_INSURANCE_PROVIDERS[providerKey];
  if (!provider) return null;
  return p.ownership === "company" ? provider.corporateBase : provider.quoteBase;
}