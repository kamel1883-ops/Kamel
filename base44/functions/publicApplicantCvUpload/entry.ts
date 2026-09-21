/**
 * publicApplicantCvUpload — دالة عامة (بدون مصادقة) لرفع سيرة المرشحين إلى الخزنة السعودية.
 *
 * السبب: صفحة التقديم على الوظيفة (JobApply) عامة، والمرشح ليس له حساب.
 * vaultProxy يتطلب مستخدم مسجّل، لذا نحتاج نقطة عامة منفصلة لرفع السيرة فقط.
 *
 * التحقق الصارم: PDF/DOC/DOCX فقط، حجم ≤5MB، تطابق MIME مع الامتداد.
 * لا تُسجّل أي حمولة حساسة — فقط رسائل خطأ عامة.
 */
import { storeDocument } from "../../shared/vaultClient.ts";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_MIME: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream", // بعض المتصفحات ترسل هذا للـdocx
  ],
};

function decodeBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { fileBase64, fileName, mimeType, jobId } = body;

    if (!fileBase64 || !fileName) {
      return Response.json({ error: "missing_file" }, { status: 400 });
    }

    // التحقق من الامتداد
    const ext = (fileName.split(".").pop() || "").toLowerCase();
    const allowed = EXT_MIME[ext];
    if (!allowed) {
      return Response.json({ error: "invalid_file_type" }, { status: 415 });
    }

    // التحقق من تطابق MIME مع الامتداد
    const mt = (mimeType || "").toLowerCase();
    if (!allowed.includes(mt)) {
      return Response.json({ error: "mime_mismatch" }, { status: 415 });
    }

    // فك الترميز والتحقق من الحجم
    const bytes = decodeBase64(fileBase64);
    if (bytes.length > MAX_BYTES) {
      return Response.json({ error: "file_too_large" }, { status: 413 });
    }

    // tenant ثابت لمجمّع المرشحين — يُعزل عن بيانات المنشآت
    const tenant = "applicant_pool";

    const result = await storeDocument(
      tenant,
      bytes,
      fileName,
      mimeType,
      null, // empRef — لا يوجد موظف مرتبط
      "applicant_cv",
    );

    const docRef = result?.doc_ref || result?.docRef;
    if (!docRef) {
      throw new Error("vault_returned_no_ref");
    }

    return Response.json({ ok: true, data: { doc_ref: docRef } });
  } catch (error) {
    console.error("[publicApplicantCvUpload] error:", error.message);
    return Response.json({ error: "upload_failed" }, { status: 500 });
  }
}