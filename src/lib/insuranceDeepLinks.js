// مولّد روابط التأمين العميقة لمزوّدي التأمين في السعودية (تأميني وبي كير).
//
// ✅ تأميني (Tameeni) — التأمين الصحي للمنشآت + تأمين المركبات:
//    صحي:   https://health.tameeni.com/
//    مركبات: https://www.tameeni.com/motorapp/en
//
// ✅ بي كير (BCare) — التأمين الصحي للمنشآت + تأمين المركبات (أفراد ومنشآت):
//    صحي:   https://medical.bcare.com.sa/en
//    مركبات: https://www.bcare.com.sa/en
//
// ⚠️ ملاحظة: منصات التأمين تتطلب تسجيل الدخول ولا تدعم التعبئة التلقائية لبيانات التسعير
//    عبر معاملات الرابط كحال حجوزات الطيران — لذا يُفتح رابط بدء التسعير ويكمل العميل
//    إدخال البيانات ومقارنة العروض والشراء مباشرة على الموقع.

export const INSURANCE_PROVIDERS = {
  tameeni: {
    key: "tameeni",
    name: "تأميني",
    nameEn: "Tameeni",
    site: "tameeni.com",
    brand: "#0088EB",
    healthUrl: "https://health.tameeni.com/",
    vehicleUrl: "https://www.tameeni.com/motorapp/en",
    logoType: "tameeni",
  },
  bcare: {
    key: "bcare",
    name: "بي كير",
    nameEn: "BCare",
    site: "bcare.com.sa",
    brand: "#146394",
    healthUrl: "https://medical.bcare.com.sa/en",
    vehicleUrl: "https://www.bcare.com.sa/en",
    logoType: "bcare",
  },
};

/** يبني رابط بدء التسعير للمزوّد المختار حسب نوع التأمين (صحي/مركبات). */
export function buildInsuranceUrl(providerKey, type) {
  const provider = INSURANCE_PROVIDERS[providerKey];
  if (!provider) return null;
  return type === "health" ? provider.healthUrl : provider.vehicleUrl;
}