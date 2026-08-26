// تتبّع إحالات برنامج شركاء جدارة — يُحفظ الرمز المرجعي القادم من رابط الشريك (?ref=CODE)
// في متصفح الزائر لمدة 90 يوماً، ويُرسل مع طلب التجربة/الشراء ليُنسب العميل لهذا الشريك.
// لا يُنسب أي عميل لشريك إن لم يأتِ عبر رابطه (لا افتراضات ولا تخمين).

const KEY = "jadara_referral";
const TTL_MS = 90 * 24 * 3600 * 1000;

export function captureReferral() {
  try {
    const raw = new URLSearchParams(window.location.search).get("ref");
    const code = String(raw || "").trim().toUpperCase().slice(0, 24);
    if (!code || !/^[A-Z0-9-]{4,24}$/.test(code)) return;
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
  } catch (_) {}
}

export function getReferral() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!parsed?.code) return "";
    if (Date.now() - Number(parsed.at || 0) > TTL_MS) { localStorage.removeItem(KEY); return ""; }
    return String(parsed.code);
  } catch (_) { return ""; }
}

export function affiliateLink(code) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/?ref=${encodeURIComponent(code || "")}`;
}