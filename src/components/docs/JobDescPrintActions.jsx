import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Eye, Printer } from "lucide-react";
import JobDescriptionDoc from "@/components/docs/JobDescriptionDoc";

// أزرار مشاهدة/طباعة PDF للوصف الوظيفي + معاينة داخل الصفحة (تفادي حظر النوافذ المنبثقة)
export default function JobDescPrintActions({ employee, text, isAr = true, size = "sm" }) {
  const [preview, setPreview] = useState(false);
  const body = text ?? employee?.job_description;
  if (!body || !String(body).trim()) return null;

  const doPrint = () => { setPreview(false); setTimeout(() => window.print(), 60); };

  return (
    <>
      <div className="flex gap-1.5">
        <Button type="button" size={size} variant="outline" onClick={() => setPreview(true)} className="h-7 px-2 text-xs gap-1.5"><Eye size={13} />{isAr ? "مشاهدة" : "View"}</Button>
        <Button type="button" size={size} variant="outline" onClick={doPrint} className="h-7 px-2 text-xs gap-1.5"><Printer size={13} />{isAr ? "طباعة PDF" : "Print PDF"}</Button>
      </div>

      {createPortal(
        <div className="print-jobdesc hidden print:block" aria-hidden>
          <JobDescriptionDoc employee={employee} text={body} isAr={isAr} />
        </div>,
        document.body
      )}

      {preview && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4 no-print" onClick={() => setPreview(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">{isAr ? "معاينة الوصف الوظيفي" : "Job description preview"}</span>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={doPrint} className="h-8 gap-1.5"><Printer size={14} />{isAr ? "طباعة" : "Print"}</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setPreview(false)} className="h-8">{isAr ? "إغلاق" : "Close"}</Button>
              </div>
            </div>
            <div className="p-6">
              <JobDescriptionDoc employee={employee} text={body} isAr={isAr} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}