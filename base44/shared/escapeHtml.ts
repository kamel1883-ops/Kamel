// تهريب قيم يُتحكم بها من المستخدم قبل وضعها في جسم بريد قد يُعرض كـ HTML.
// يمنع حقن وسوم/روابط مضلِّلة (CWE-79) في رسائل الإشعار للمالك/الدعم.
export function escapeHtml(s: any): string {
  const AMP = "&" + "amp;";
  const LT = "&" + "lt;";
  const GT = "&" + "gt;";
  const QUOT = "&" + "quot;";
  const APOS = "&" + "#39;";
  return String(s ?? "")
    .replace(/&/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT)
    .replace(/"/g, QUOT)
    .replace(/'/g, APOS);
}