let _lang = "ar";
try {
  if (typeof localStorage !== "undefined") _lang = localStorage.getItem("jadara_lang") || "ar";
} catch (e) {}

// لغة بوابة الموظف — منفصلة عن لغة الواجهة العامة (لا تتسرب لتطبيق الإدارة)
let _portalLang = null;

export function getLang() {
  return _lang;
}
export function setLangStore(l) {
  _lang = l || "ar";
}
export const isAr = () => _lang === "ar";

export function setPortalLangStore(l) {
  _portalLang = l || null;
}
export function getPortalLang() {
  return _portalLang;
}
// اللغة الفعّالة: أولوية للغة البوابة إن وُجدت
export function activeLang() {
  return _portalLang || _lang;
}