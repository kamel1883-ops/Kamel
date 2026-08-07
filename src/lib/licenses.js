// تعريفات تراخيص المنشأة الحكومية + عقود الصيانة — ثنائية اللغة
import { isAr } from "@/lib/lang";

export const LICENSE_TYPES = [
  { key: "cr", ar: { label: "السجل التجاري", authority: "وزارة التجارة" }, en: { label: "Commercial Register", authority: "Ministry of Commerce" } },
  { key: "municipality", ar: { label: "ترخيص البلدية", authority: "وزارة البلديات والإسكان" }, en: { label: "Municipality License", authority: "Ministry of Municipalities" } },
  { key: "civil_defense", ar: { label: "ترخيص الدفاع المدني", authority: "المديرية العامة للدفاع المدني" }, en: { label: "Civil Defense License", authority: "General Directorate of Civil Defense" } },
  { key: "industrial", ar: { label: "الترخيص الصناعي", authority: "وزارة الصناعة والثروة المعدنية" }, en: { label: "Industrial License", authority: "Ministry of Industry & Mineral Resources" } },
  { key: "modon", ar: { label: "ترخيص هيئة مدن", authority: "الهيئة السعودية للمدن الصناعية ومناطق التقنية" }, en: { label: "MODON License", authority: "Saudi Authority for Industrial Cities" } },
  { key: "sfda", ar: { label: "ترخيص الغذاء والدواء", authority: "الهيئة العامة للغذاء والدواء (SFDA)" }, en: { label: "Food & Drug License", authority: "Saudi Food & Drug Authority (SFDA)" } },
  { key: "medical", ar: { label: "الترخيص الطبي", authority: "وزارة الصحة" }, en: { label: "Medical License", authority: "Ministry of Health" } },
  { key: "veterinary", ar: { label: "الترخيص البيطري", authority: "وزارة البيئة والمياه والزراعة" }, en: { label: "Veterinary License", authority: "Ministry of Environment" } },
  { key: "safety_maintenance", ar: { label: "عقد صيانة السلامة", authority: "عقد صيانة دورية" }, en: { label: "Safety Maintenance Contract", authority: "Periodic maintenance contract" } },
  { key: "labor", ar: { label: "ملف منشأة / مكتب العمل", authority: "وزارة الموارد البشرية والتنمية الاجتماعية" }, en: { label: "Labor Office File", authority: "Ministry of Human Resources" } },
  { key: "gosi", ar: { label: "شهادة التأمينات الاجتماعية", authority: "المؤسسة العامة للتأمينات الاجتماعية" }, en: { label: "GOSI Certificate", authority: "General Organization for Social Insurance" } },
  { key: "transport", ar: { label: "ترخيص النقل", authority: "الهيئة العامة للنقل" }, en: { label: "Transport License", authority: "Transport General Authority" } },
  { key: "tourism", ar: { label: "الترخيص السياحي", authority: "الهيئة السعودية للسياحة" }, en: { label: "Tourism License", authority: "Saudi Tourism Authority" } },
  { key: "other", ar: { label: "تراخيص أخرى", authority: "حسب الجهة المانحة" }, en: { label: "Other licenses", authority: "Per issuing authority" } },
];

export const typeMeta = (k) => {
  const item = LICENSE_TYPES.find((t) => t.key === k);
  if (!item) return { label: k, authority: "" };
  const meta = isAr() ? item.ar : item.en;
  return meta;
};

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
export const statusBadgeEn = {
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-600" },
  expiring_soon: { label: "Expiring soon", cls: "bg-amber-50 text-amber-600" },
  expired: { label: "Expired", cls: "bg-rose-50 text-rose-600" },
  not_applicable: { label: "Not applicable", cls: "bg-slate-100 text-slate-500" },
  unknown: { label: "No date", cls: "bg-slate-100 text-slate-500" },
};
export function statusBadgeOf(key) {
  return (isAr() ? statusBadge : statusBadgeEn)[key] || { label: key, cls: "bg-slate-100 text-slate-500" };
}