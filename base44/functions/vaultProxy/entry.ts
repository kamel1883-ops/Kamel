/**
 * vaultProxy — البوابة الوحيدة بين واجهة Base44 والخزنة السعودية.
 *
 * تمنع تسريب أي قيمة حساسة إلى السجلات، وتوحّد كل عمليات الخزنة عبر وحدة vaultClient المشتركة.
 * كل عملية تُستدعى من الواجهة عبر base44.functions.invoke('vaultProxy', { action, ... }).
 *
 * الأدعمـة:
 *   storeEmployee   — تخزين بيانات موظف حساسة → { emp_ref }
 *   storeEmployeesBulk — تخزين جماعي (استيراد) → { refs }
 *   getEmployee     — استرجاع قيم حساسة مفكوكة (للعرض)
 *   updateEmployee  — تحديث قيم حساسة
 *   deleteEmployee  — حذف من الخزنة
 *   storePayroll    — تخزين قيم مالية → { payroll_ref }
 *   getPayroll      — استرجاع قيم مالية
 *   storeDocument   — رفع مستند → { doc_ref, sha256 }
 *   getDocumentLink — توليد رابط تنزيل مؤقت → { token, expires_in, download_url }
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import {
  storeEmployee, storeEmployeesBulk, getEmployee, updateEmployee, deleteEmployee,
  storePayroll, getPayroll, storeDocument, getDocumentLink, buildDownloadUrl,
} from "../../shared/vaultClient.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, tenantId, ...rest } = body;
    if (!action) return Response.json({ error: "action_required" }, { status: 400 });
    // نستخدم معرّف المستخدم كـ tenant افتراضياً إن لم يُمرّر
    const tenant = tenantId || user.id;

    let result;
    switch (action) {
      case "storeEmployee":
        result = await storeEmployee(tenant, rest.sensitiveData || rest);
        break;
      case "storeEmployeesBulk":
        if (!Array.isArray(rest.rows)) return Response.json({ error: "rows_required" }, { status: 400 });
        result = await storeEmployeesBulk(tenant, rest.rows);
        break;
      case "getEmployee":
        if (!rest.empRef) return Response.json({ error: "empRef_required" }, { status: 400 });
        result = await getEmployee(tenant, rest.empRef);
        break;
      case "updateEmployee":
        if (!rest.empRef) return Response.json({ error: "empRef_required" }, { status: 400 });
        result = await updateEmployee(tenant, rest.empRef, rest.sensitiveData || rest);
        break;
      case "deleteEmployee":
        if (!rest.empRef) return Response.json({ error: "empRef_required" }, { status: 400 });
        result = await deleteEmployee(tenant, rest.empRef);
        break;
      case "storePayroll":
        if (!rest.empRef) return Response.json({ error: "empRef_required" }, { status: 400 });
        result = await storePayroll(tenant, rest);
        break;
      case "getPayroll":
        if (!rest.payrollRef) return Response.json({ error: "payrollRef_required" }, { status: 400 });
        result = await getPayroll(tenant, rest.payrollRef);
        break;
      case "storeDocument":
        if (!rest.fileBase64) return Response.json({ error: "fileBase64_required" }, { status: 400 });
        {
          const bytes = Uint8Array.from(atob(rest.fileBase64), (c) => c.charCodeAt(0));
          result = await storeDocument(
            tenant, bytes, rest.fileName || "document", rest.mimeType || "application/octet-stream",
            rest.empRef || null, rest.docType || "other"
          );
        }
        break;
      case "getDocumentLink":
        if (!rest.docRef) return Response.json({ error: "docRef_required" }, { status: 400 });
        {
          const link = await getDocumentLink(tenant, rest.docRef);
          result = { ...link, download_url: buildDownloadUrl(link.token) };
        }
        break;
      default:
        return Response.json({ error: "unknown_action", action }, { status: 400 });
    }
    return Response.json({ ok: true, data: result });
  } catch (error) {
    // لا نُسجّل أي حمولة — فقط رسالة الخطأ العامة
    console.error("[vaultProxy] error:", error.message);
    return Response.json({ error: "vault_operation_failed" }, { status: 500 });
  }
}