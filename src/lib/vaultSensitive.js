/**
 * vaultSensitive — طبقة العرض الموحّدة للبيانات الحساسة.
 *
 * عند تفعيل الخزنة السعودية، تُخزّن الحقول الحساسة (هوية/جواز/بنك/مواليد/هاتف/عنوان/تأمين)
 * في الخزنة وتُستبدل في Base44 برمز معتم (emp_ref). هذا المساعد يجلب القيم الحساسة
 * من الخزنة عند العرض، مع وضع احتياطي: إن لم يوجد emp_ref (النمط القديم)، يعيد الحقول المحلية.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export const SENSITIVE_FIELDS = [
  "national_id", "birth_date", "phone", "address", "emergency_contact",
  "passport_number", "passport_expiry", "bank_account", "health_insurance_number",
];

function pickSensitive(obj) {
  const out = {};
  for (const f of SENSITIVE_FIELDS) {
    if (obj && obj[f] !== undefined && obj[f] !== null && obj[f] !== "") out[f] = obj[f];
  }
  return out;
}

/**
 * يجلب البيانات الحساسة من الخزنة عبر emp_ref ويدمجها في كائن الموظف.
 * إن لم يوجد emp_ref أو فشلت الخزنة، يعيد الموظف كما هو (النمط القديم).
 */
export async function enrichEmployee(employee) {
  if (!employee || !employee.emp_ref) return employee;
  try {
    const res = await base44.functions.invoke("vaultProxy", { action: "getEmployee", empRef: employee.emp_ref });
    // vaultProxy يعيد { ok, data } عبر Axios → res.data = { ok, data }
    const data = res?.data?.data || res?.data || {};
    return { ...employee, ...pickSensitive(data) };
  } catch (e) {
    // الخزنة غير مُهيّأة — استخدم الحقول المحلية
    return employee;
  }
}

/**
 * يجلب البيانات الحساسة لمجموعة موظفين دفعة واحدة (للقوائم/المستندات).
 * يعيد خريطة emp_ref → قيم حساسة. يتجاهل من لا يملكون emp_ref.
 */
export async function enrichEmployeesBatch(employees) {
  const withRef = (employees || []).filter((e) => e && e.emp_ref);
  if (withRef.length === 0) return {};
  const map = {};
  await Promise.all(withRef.map(async (e) => {
    const enriched = await enrichEmployee(e);
    map[e.emp_ref] = pickSensitive(enriched);
  }));
  return map;
}

/**
 * Hook: يعيد نسخة الموظف مُغناة بالبيانات الحساسة من الخزنة عند توفر emp_ref.
 */
export function useEnrichedEmployee(employee) {
  const [enriched, setEnriched] = useState(employee);
  useEffect(() => {
    let active = true;
    if (!employee || !employee.emp_ref) { setEnriched(employee); return; }
    enrichEmployee(employee).then((e) => { if (active) setEnriched(e); });
    return () => { active = false; };
  }, [employee?.id, employee?.emp_ref]);
  return enriched || employee;
}