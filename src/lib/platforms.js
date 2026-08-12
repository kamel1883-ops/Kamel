// منصات الحكومة السعودية التي تطلب اشتراكات / رسوم سنوية — ثنائية اللغة
import { isAr } from "@/lib/lang";

export const PLATFORM_TYPES = [
  { key: "absher_business", ar: { label: "أبشر أعمال", authority: "الهيئة السعودية للبيانات والذكاء الاصطناعي (أبشر)" }, en: { label: "Absher Business", authority: "Saudi Data & AI Authority (Absher)" } },
  { key: "muqeem", ar: { label: "منصة مقيم", authority: "وزارة الموارد البشرية والتنمية الاجتماعية" }, en: { label: "Muqeem", authority: "Ministry of Human Resources" } },
  { key: "ajeer", ar: { label: "منصة عاجل", authority: "وزارة الموارد البشرية والتنمية الاجتماعية" }, en: { label: "Ajeer", authority: "Ministry of Human Resources" } },
  { key: "qiwa", ar: { label: "منصة قوى", authority: "وزارة الموارد البشرية والتنمية الاجتماعية" }, en: { label: "Qiwa", authority: "Ministry of Human Resources" } },
  { key: "mudad", ar: { label: "منصة مدد (حماية الأجور WPS)", authority: "وزارة الموارد البشرية والتنمية الاجتماعية" }, en: { label: "Mudad (WPS)", authority: "Ministry of Human Resources" } },
  { key: "gosi", ar: { label: "منصة التأمينات الاجتماعية", authority: "المؤسسة العامة للتأمينات الاجتماعية (GOSI)" }, en: { label: "GOSI", authority: "General Organization for Social Insurance" } },
  { key: "tamm", ar: { label: "بوابة تم للأعمال", authority: "الغرفة التجارية (بوابة الأعمال)" }, en: { label: "Tamm Business Portal", authority: "Chamber of Commerce" } },
  { key: "wathq", ar: { label: "منصة واثق", authority: "وزارة التجارة (المركز الوطني للمعلومات التجارية)" }, en: { label: "Wathq", authority: "Ministry of Commerce (NCIC)" } },
  { key: "balady", ar: { label: "منصة بلدي", authority: "وزارة البلديات والإسكان" }, en: { label: "Balady", authority: "Ministry of Municipalities & Housing" } },
  { key: "maroof", ar: { label: "منصة معروف", authority: "وزارة التجارة" }, en: { label: "Maroof", authority: "Ministry of Commerce" } },
  { key: "etimad", ar: { label: "منصة إتماد", authority: "المركز الوطني للمشتريات الحكومية" }, en: { label: "Etimad", authority: "National Center for Government Procurement" } },
  { key: "zatca", ar: { label: "هيئة الزكاة والضريبة والجمارك (فاتورة)", authority: "هيئة الزكاة والضريبة والجمارك (ZATCA)" }, en: { label: "ZATCA (E-Invoice)", authority: "Zakat, Tax & Customs Authority" } },
  { key: "saudi_business_center", ar: { label: "المركز السعودي للأعمال", authority: "المركز السعودي للأعمال (SBC)" }, en: { label: "Saudi Business Center", authority: "Saudi Business Center" } },
  { key: "ejar", ar: { label: "منصة إيجار", authority: "وزارة العدل / الأمانة العامة لمنصة إيجار" }, en: { label: "Ejar", authority: "Ejar Rental Platform" } },
  { key: "labor_office", ar: { label: "الملف الالكتروني للمنشأة (مكتب العمل)", authority: "وزارة الموارد البشرية والتنمية الاجتماعية" }, en: { label: "Labor Office e-File", authority: "Ministry of Human Resources" } },
  { key: "other", ar: { label: "منصة أخرى", authority: "حسب الجهة" }, en: { label: "Other platform", authority: "Per authority" } },
];

export const platformMeta = (k) => {
  const item = PLATFORM_TYPES.find((t) => t.key === k);
  if (!item) return { label: k, authority: "" };
  const meta = isAr() ? item.ar : item.en;
  return meta;
};

// الأيام المتبقية حتى انتهاء الاشتراك
export function remainingDays(date, notApplicable) {
  if (notApplicable) return null;
  if (!date) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp = new Date(date); exp.setHours(0, 0, 0, 0);
  return Math.round((exp - today) / 86400000);
}

export { expiryStatus, statusBadge, statusBadgeEn, statusBadgeOf } from "@/lib/licenses";