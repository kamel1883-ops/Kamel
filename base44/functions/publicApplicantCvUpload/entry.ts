/**
 * publicApplicantCvUpload — دالة عامة (بدون مصادقة) لرفع سيرة المرشحين.
 *
 * تخزّن الملف في Base44 عبر UploadPublicFile وتُرجع رابطاً دائماً يُحفظ في حقل
 * cv_url في سجل JobApplication. المرشح ليس له حساب، لذا الوظيفة عامة.
 *
 * التحقق الصارم: PDF/DOC/DOCX فقط، حجم ≤5MB، تطابق MIME مع الامتداد.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

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
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { fileBase64, fileName, mimeType } = body;

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

    // بناء File من البايتات الخام ورفعه إلى تخزين Base44 العام
    const file = new File([bytes], fileName, { type: mimeType });

    const result = await base44.integrations.Core.UploadPublicFile({ file });
    const fileUrl = result?.file_url;

    if (!fileUrl) {
      throw new Error("upload_returned_no_url");
    }

    return Response.json({ ok: true, data: { file_url: fileUrl } });
  } catch (error) {
    console.error("[publicApplicantCvUpload] error:", error?.message || error);
    return Response.json({ error: "upload_failed" }, { status: 500 });
  }
}