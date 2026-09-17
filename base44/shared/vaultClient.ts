/**
 * عميل الخزنة السعودية — طبقة وسطية موحدة بين Base44 والسيرفر السعودي.
 *
 * القاعدة الذهبية: لا تُمرّر أي قيمة حساسة خارج هذه الوحدة كنص واضح في السجلات.
 * كل المكالمات تستخدم مفتاح API مشترك + ترويسة المستأجر، عبر HTTPS فقط.
 *
 * السرّان المطلوبان في إعدادات التطبيق:
 *   VAULT_API_KEY — مفتاح مشترك (يطابق .env على السيرفر)
 *   VAULT_URL    — نطاق الخزنة السعودي (https://vault.jadara.sa) بدون شرطة مائلة
 */
import { secrets } from "base44:runtime";

const SENSITIVE_FIELDS = [
  "full_name", "national_id", "passport_number", "bank_account",
  "birth_date", "phone", "address", "emergency_contact",
];

const PAYROLL_FIELDS = [
  "base_salary", "housing", "transport", "other",
  "gross", "net", "gosi_employee", "gosi_employer",
];

function getVaultConfig() {
  const apiKey = secrets.get("VAULT_API_KEY");
  const baseUrl = secrets.get("VAULT_URL");
  if (!apiKey || !baseUrl) {
    throw new Error("vault_not_configured: VAULT_API_KEY و VAULT_URL غير مُضبطين في أسرار التطبيق");
  }
  return { apiKey, baseUrl: baseUrl.replace(/\/$/, "") };
}

/** ترويسات موحدة لكل مكالمة — مفتاح API + المستأجر */
function headers(apiKey, tenantId, extra = {}) {
  return {
    "X-Vault-Key": apiKey,
    "X-Tenant-Id": tenantId,
    "Content-Type": "application/json",
    ...extra,
  };
}

/** استدعاء موحّد مع معالجة أخطاء نظيفة لا تُسجّل الحمولة */
async function callVault(path, tenantId, options = {}) {
  const { apiKey, baseUrl } = getVaultConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: headers(apiKey, tenantId, options.headers),
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  if (!res.ok) {
    // لا نُسجّل الحمولة — قد تحوي قيماً حساسة
    throw new Error(`vault_error: ${res.status} ${path}`);
  }
  return body;
}

// ============================================================
// الموظفون — هوية/إقامة/جواز/بنك
// ============================================================

/** يخزّن القيم الحساسة في الخزنة ويعيد رمزاً معتماً (emp_ref) */
export async function storeEmployee(tenantId, sensitiveData) {
  const payload = {};
  for (const f of SENSITIVE_FIELDS) {
    if (sensitiveData[f] !== undefined && sensitiveData[f] !== null && sensitiveData[f] !== "") {
      payload[f] = String(sensitiveData[f]);
    }
  }
  return callVault("/api/vault/employees", tenantId, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** تخزين جماعي — يُعيد مصفوفة رموز معتمة بنفس ترتيب الإدخال */
export async function storeEmployeesBulk(tenantId, rows) {
  const payload = rows.map((r) => {
    const o = {};
    if (r.emp_ref) o.emp_ref = r.emp_ref;
    for (const f of SENSITIVE_FIELDS) {
      if (r[f] !== undefined && r[f] !== null && r[f] !== "") o[f] = String(r[f]);
    }
    return o;
  });
  return callVault("/api/vault/employees/bulk", tenantId, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** يسترجع القيم الحساسة المفكوكة — للعرض في الواجهة فقط، لا تُخزّن */
export async function getEmployee(tenantId, empRef) {
  return callVault(`/api/vault/employees/${empRef}`, tenantId, { method: "GET" });
}

/** يحدّث قيماً حساسة موجودة */
export async function updateEmployee(tenantId, empRef, sensitiveData) {
  const payload = {};
  for (const f of SENSITIVE_FIELDS) {
    if (sensitiveData[f] !== undefined && sensitiveData[f] !== null && sensitiveData[f] !== "") {
      payload[f] = String(sensitiveData[f]);
    }
  }
  return callVault(`/api/vault/employees/${empRef}`, tenantId, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** يحذف سجل الموظف الحساس من الخزنة */
export async function deleteEmployee(tenantId, empRef) {
  return callVault(`/api/vault/employees/${empRef}`, tenantId, { method: "DELETE" });
}

// ============================================================
// الرواتب — قيم مالية حساسة
// ============================================================

export async function storePayroll(tenantId, data) {
  const payload = { emp_ref: data.emp_ref, period_key: data.period_key || null };
  for (const f of PAYROLL_FIELDS) {
    if (data[f] !== undefined && data[f] !== null && data[f] !== "") {
      payload[f] = String(data[f]);
    }
  }
  return callVault("/api/vault/payroll", tenantId, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPayroll(tenantId, payrollRef) {
  return callVault(`/api/vault/payroll/${payrollRef}`, tenantId, { method: "GET" });
}

// ============================================================
// المستندات — رفع/تنزيل
// ============================================================

/** يرفع مستنداً (ArrayBuffer) ويعيد doc_ref */
export async function storeDocument(tenantId, fileBuffer, fileName, mimeType, empRef = null, docType = "other") {
  const { apiKey, baseUrl } = getVaultConfig();
  const formData = new FormData();
  formData.append("file", new Blob([fileBuffer], { type: mimeType }), fileName);
  formData.append("doc_type", docType);
  if (empRef) formData.append("emp_ref", empRef);
  const res = await fetch(`${baseUrl}/api/vault/documents`, {
    method: "POST",
    headers: { "X-Vault-Key": apiKey, "X-Tenant-Id": tenantId },
    body: formData,
  });
  if (!res.ok) throw new Error(`vault_error: ${res.status} /api/vault/documents`);
  return res.json();
}

/** يولّد رابط تنزيل مؤقت (JWT) — يُعرض للمستخدم النهائي */
export async function getDocumentLink(tenantId, docRef) {
  return callVault(`/api/vault/documents/${docRef}/link`, tenantId, { method: "POST" });
}

/** يبني رابط التنزيل العام النهائي (رابط مباشر يفتح في المتصفح) */
export function buildDownloadUrl(docToken) {
  const baseUrl = secrets.get("VAULT_URL");
  if (!baseUrl) throw new Error("vault_not_configured: VAULT_URL غير مُضبوط");
  return `${baseUrl.replace(/\/$/, "")}/api/vault/documents/download/${docToken}`;
}