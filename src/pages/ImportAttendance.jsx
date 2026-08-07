import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, Loader2, CheckCircle2, AlertTriangle, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export default function ImportAttendance() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "استيراد البصمات", subtitle: "ارفع ملف Excel أو CSV بسجلات البصمة ليُحلّل ويُربط تلقائياً بالموظفين والرواتب",
    fileH: "ملف سجلات البصمة", fileDesc: "الأعمدة المتوقّعة: الرقم الوظيفي/رقم الموظف، الاسم، التاريخ، وقت الحضور، وقت الانصراف",
    pick: "اضغط لاختيار ملف Excel أو CSV", kb: (n) => `${n} كيلوبايت`, uploadFail: "فشل رفع الملف",
    upload: "رفع الملف", import: "تحليل واستيراد", cancel: "إلغاء",
    processing: "جارٍ تحليل الملف ومطابقة الموظفين وإنشاء سجلات الحضور...", analyzeFail: "فشل التحليل",
    total: "إجمالي السجلات", created: "سجلات جديدة", updated: "محدّثة", unmatched: "غير مطابقة",
    ok: "تم استيراد كل السجلات ومطابقتها بنجاح. ستُحتسب هذه الحضور تلقائياً عند توليد الرواتب.",
    partial: (c, u, n) => `تم استيراد ${c + u} سجل. ${n} سجل لم يُطابق موظفاً — تأكد من تطابق الرقم الوظيفي في الملف مع سجلات الموظفين.`,
    unmatchedH: "السجلات غير المطابقة",
    thIdName: "الرقم / الاسم", thDate: "التاريخ", thIn: "الحضور", thOut: "الانصراف",
  } : {
    title: "Import attendance", subtitle: "Upload an Excel or CSV file of punch records to be analyzed and auto-linked to employees and payroll",
    fileH: "Punch records file", fileDesc: "Expected columns: employee number/id, name, date, check-in time, check-out time",
    pick: "Click to pick an Excel or CSV file", kb: (n) => `${n} KB`, uploadFail: "File upload failed",
    upload: "Upload file", import: "Analyze & import", cancel: "Cancel",
    processing: "Analyzing the file and matching employees and creating attendance records...", analyzeFail: "Analysis failed",
    total: "Total records", created: "New records", updated: "Updated", unmatched: "Unmatched",
    ok: "All records were imported and matched successfully. These attendances will be counted automatically when generating payroll.",
    partial: (c, u, n) => `Imported ${c + u} records. ${n} records did not match an employee — make sure the employee number in the file matches the employee records.`,
    unmatchedH: "Unmatched records",
    thIdName: "Number / Name", thDate: "Date", thIn: "Check in", thOut: "Check out",
  };

  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  const onPick = (f) => { setFile(f); setResult(null); setErr(""); setFileUrl(""); };
  const doUpload = async () => {
    if (!file) return;
    setUploading(true); setErr("");
    try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); setFileUrl(file_url); }
    catch (e) { setErr(e?.message || t.uploadFail); }
    finally { setUploading(false); }
  };
  const doImport = async () => {
    if (!fileUrl) return;
    setProcessing(true); setErr(""); setResult(null);
    try { const res = await base44.functions.invoke("importAttendance", { file_url: fileUrl }); setResult(res.data); }
    catch (e) { setErr(e?.response?.data?.error || e?.message || t.analyzeFail); }
    finally { setProcessing(false); }
  };
  const reset = () => { setFile(null); setFileUrl(""); setResult(null); setErr(""); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="bg-white rounded-2xl border border-border p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><FileSpreadsheet size={22} /></div>
          <div><div className="font-semibold">{t.fileH}</div><div className="text-xs text-muted-foreground">{t.fileDesc}</div></div>
        </div>

        <label className="block border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition">
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
          <FileUp size={30} className="mx-auto text-slate-300 mb-2" />
          {file ? (
            <div className="text-sm"><div className="font-medium text-foreground">{file.name}</div><div className="text-xs text-muted-foreground mt-0.5">{t.kb((file.size / 1024).toFixed(0))}</div></div>
          ) : (<div className="text-sm text-muted-foreground">{t.pick}</div>)}
        </label>

        {err && <div className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{err}</div>}

        <div className="flex gap-2 mt-5">
          <Button onClick={doUpload} disabled={!file || uploading || fileUrl} className="gap-2">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {t.upload}
          </Button>
          <Button onClick={doImport} disabled={!fileUrl || processing} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {processing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />} {t.import}
          </Button>
          {(file || result) && <Button variant="ghost" onClick={reset}>{t.cancel}</Button>}
        </div>
      </div>

      {(processing && !result) && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700 flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> {t.processing}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Count label={t.total} value={result.total} cls="bg-slate-50 text-slate-700" />
            <Count label={t.created} value={result.created} cls="bg-emerald-50 text-emerald-600" />
            <Count label={t.updated} value={result.updated} cls="bg-blue-50 text-blue-600" />
            <Count label={t.unmatched} value={result.unmatchedCount} cls="bg-rose-50 text-rose-600" />
          </div>
          <div className={cn("rounded-2xl border p-5 flex items-start gap-3", result.unmatchedCount === 0 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200")}>
            {result.unmatchedCount === 0 ? <CheckCircle2 size={22} className="text-emerald-600 mt-0.5" /> : <AlertTriangle size={22} className="text-amber-600 mt-0.5" />}
            <div className="text-sm">{result.unmatchedCount === 0 ? t.ok : t.partial(result.created, result.updated, result.unmatchedCount)}</div>
          </div>
          {result.unmatched?.length > 0 && (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border text-sm font-medium">{t.unmatchedH}</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-muted-foreground text-xs">
                    <tr>
                      <th className="text-right px-4 py-2 font-medium">{t.thIdName}</th>
                      <th className="text-right px-4 py-2 font-medium">{t.thDate}</th>
                      <th className="text-right px-4 py-2 font-medium">{t.thIn}</th>
                      <th className="text-right px-4 py-2 font-medium">{t.thOut}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.unmatched.map((r, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">{r.employee_number || "—"} · {r.employee_name || "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.date}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.check_in || "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.check_out || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Count({ label, value, cls }) {
  return (<div className={cn("rounded-2xl p-4", cls)}><div className="text-xs opacity-80">{label}</div><div className="text-2xl font-bold mt-1">{value}</div></div>);
}