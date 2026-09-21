/**
 * vaultGeneric — طبقة الكتابة/القراءة العامة لكل الأقسام الحساسة في الخزنة السعودية.
 *
 * نمط العمل: عند حفظ نموذج قسم حساس، تُرسل كل بيانات السجل للخزنة عبر vaultProxy،
 * يُعاد رمز معتم (ref)، Base44 يحفظ الـ ref + البيانات الوصفية للفلترة فقط.
 *
 * وضع احتياطي: لو فشلت الخزنة أو لم تُهيّأ، يُحفظ السجل محلياً في Base44 ولا ينكسر النظام.
 */
import { base44 } from "@/api/base44Client";

// الأقسام الحساسة المدعومة في الخزنة الموسّعة
export const VAULT_MODULES = {
  complaints: "complaints",
  warnings: "warnings",
  licenses: "licenses",
  platformSubs: "platform-subs",
  orgStructure: "org-structure",
  succession: "succession",
  training: "training",
  performance: "performance",
  eos: "eos",
  equipment: "equipment",
  expenses: "expenses",
  businessTrips: "business-trips",
  leaves: "leaves",
  approvals: "approvals",
  appointees: "appointees",
  reports: "reports",
  gosi: "gosi",
};

/**
 * يخزّن أو يحدّث سجلاً حساساً في الخزنة ويعيد ref المعتم.
 * - إن وُجد existingRef → تحديث
 * - وإلا → إنشاء جديد
 * يعيد null عند فشل الخزنة (وضع احتياطي).
 */
export async function writeRecordToVault(moduleKey, existingRef, record) {
  if (!record || typeof record !== "object") return existingRef || null;
  try {
    const action = existingRef ? "updateRecord" : "storeRecord";
    const payload = { action, module: moduleKey, data: record, empRef: record.emp_ref || null };
    if (existingRef) payload.ref = existingRef;
    const res = await base44.functions.invoke("vaultProxy", payload);
    const data = res?.data?.data || res?.data || {};
    const refKey = `${moduleKey}Ref`;
    return data[refKey] || data.ref || data.emp_ref || null;
  } catch (e) {
    console.log(`[vaultGeneric] ${moduleKey}: vault unavailable, legacy mode`);
    return null;
  }
}

/**
 * يسترجع سجلاً حساساً مفكوك التشفير من الخزنة (للعرض في الواجهة).
 * يعيد null عند فشل الخزنة.
 */
export async function readRecordFromVault(moduleKey, ref) {
  if (!ref) return null;
  try {
    const res = await base44.functions.invoke("vaultProxy", {
      action: "getRecord", module: moduleKey, ref,
    });
    return res?.data?.data || res?.data || null;
  } catch (e) {
    console.log(`[vaultGeneric] ${moduleKey}: read failed, legacy mode`);
    return null;
  }
}

/**
 * يخزّن مستنداً (ArrayBuffer/Base64) في الخزنة ويعيد رابط تنزيل مؤقت.
 * يعيد null عند فشل الخزنة.
 */
export async function writeDocumentToVault(fileBase64, fileName, mimeType, empRef, docType) {
  try {
    const res = await base44.functions.invoke("vaultProxy", {
      action: "storeDocument", fileBase64, fileName, mimeType, empRef, docType,
    });
    const data = res?.data?.data || res?.data || {};
    return { docRef: data.doc_ref, downloadUrl: data.download_url } ;
  } catch (e) {
    console.log("[vaultGeneric] document: vault unavailable");
    return null;
  }
}

/**
 * يبني payload نهائي لـ Base44: يضيف الـ ref المعتم ويُبقي البيانات الوصفية للفلترة.
 * الحقول الحساسة تبقى في الخزنة فقط، لكن البيانات الوصفية (حالة/تاريخ/نوع) تبقى في Base44.
 */
export function applyVaultRef(payload, moduleKey, ref, sensitiveKeys) {
  if (!ref) return payload;
  const cleared = { ...payload, [`${moduleKey}Ref`]: ref };
  for (const k of sensitiveKeys) {
    if (cleared[k] !== undefined) cleared[k] = "";
  }
  return cleared;
}

export function isVaultRecordActive(ref) {
  return !!ref;
}