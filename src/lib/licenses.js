// تعريفات تراخيص المنشأة الحكومية + عقود الصيانة

export const LICENSE_TYPES = [
  { key: "cr", label: "السجل التجاري", authority: "وزارة التجارة" },
  { key: "municipality", label: "ترخيص البلدية", authority: "وزارة البلديات والإسكان" },
  { key: "civil_defense", label: "ترخيص الدفاع المدني", authority: "المديرية العامة للدفاع المدني" },
  { key: "industrial", label: "الترخيص الصناعي", authority: "وزارة الصناعة والثروة المعدنية" },
  { key: "modon", label: "ترخيص هيئة مدن", authority: "الهيئة السعودية للمدن الصناعية ومناطق التقنية" },
  { key: "sfda", label: "ترخيص الغذاء والدواء", authority: "الهيئة العامة للغذاء والدواء (SFDA)" },
  { key: "medical", label: "الترخيص الطبي", authority: "وزارة الصحة" },
  { key: "veterinary", label: "الترخيص البيطري", authority: "وزارة البيئة والمياه والزراعة" },
  { key: "safety_maintenance", label: "عقد صيانة السلامة", authority: "عقد صيانة دورية" },
  { key: "labor", label: "ملف منشأة / مكتب العمل", authority: "وزارة الموارد البشرية والتنمية الاجتماعية" },
  { key: "gosi", label: "شهادة التأمينات الاجتماعية", authority: "المؤسسة العامة للتأمينات الاجتماعية" },
  { key: "transport", label: "ترخيص النقل", authority: "الهيئة العامة للنقل" },
  { key: "tourism", label: "الترخيص السياحي", authority: "الهيئة السعودية للسياحة" },
  { key: "other", label: "تراخيص أخرى", authority: "حسب الجهة المانحة" },
];

export const typeMeta = (k) => LICENSE_TYPES.find((t) => t.key === k) || { label: k, authority: "" };

export function expiryStatus(date, notApplicable) {
  if (notApplicable) return "not_applicable";
  if (!date) return "unknown";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp = new Date(date); exp.setHours(0, 0, 0, 0);
  if (exp < today) return "expired";
  const days = Math.round((exp - today) / 86400000);
  if (days <= 30) return "expiring_soon";
  return "active";
}

export const statusBadge = {
  active: { label: "ساري", cls: "bg-emerald-50 text-emerald-600" },
  expiring_soon: { label: "قارب الانتهاء", cls: "bg-amber-50 text-amber-600" },
  expired: { label: "منتهي", cls: "bg-rose-50 text-rose-600" },
  not_applicable: { label: "لا ينطبق", cls: "bg-slate-100 text-slate-500" },
  unknown: { label: "بدون تاريخ", cls: "bg-slate-100 text-slate-500" },
};