let _lang = "ar";
try {
  if (typeof localStorage !== "undefined") _lang = localStorage.getItem("jadara_lang") || "ar";
} catch (e) {}

export function getLang() {
  return _lang;
}
export function setLangStore(l) {
  _lang = l || "ar";
}
export const isAr = () => _lang === "ar";