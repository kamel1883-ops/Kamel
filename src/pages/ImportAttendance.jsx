import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, Loader2, CheckCircle2, AlertTriangle, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImportAttendance() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  const onPick = (f) => {
    setFile(f);
    setResult(null);
    setErr("");
    setFileUrl("");
  };

  const doUpload = async () => {
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);
    } catch (e) {
      setErr(e?.message || "فشل رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const doImport = async () => {
    if (!fileUrl) return;
    setProcessing(true); setErr(""); setResult(null);
    try {
      const res = await base44.functions.invoke("importAttendance", { file_url: fileUrl });
      setResult(res.data);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "فشل التحليل");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null); setFileUrl(""); setResult(null); setErr("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <PageHeader title="استيراد البصمات" subtitle="ارفع ملف Excel أو CSV بسجلات البصمة ليُحلّل ويُربط تلقائياً بالموظفين والرواتب" />

      <div className="bg-white rounded-2xl border border-border p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><FileSpreadsheet size={22} /></div>
          <div>
            <div className="font-semibold">ملف سجلات البصمة</div>
            <div className="text-xs text-muted-foreground">الأعمدة المتوقّعة: الرقم الوظيفي/رقم الموظف، الاسم، التاريخ، وقت الحضور، وقت الانصراف</div>
          </div>
        </div>

        <label className="block border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition">
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
          <FileUp size={30} className="mx-auto text-slate-300 mb-2" />
          {file ? (
            <div className="text-sm">
              <div className="font-medium text-foreground">{file.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(0)} كيلوبايت</div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">اضغط لاختيار ملف Excel أو CSV</div>
          )}
        </label>

        {err && <div className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{err}</div>}

        <div className="flex gap-2 mt-5">
          <Button onClick={doUpload} disabled={!file || uploading || fileUrl} className="gap-2">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} رفع الملف
          </Button>
          <Button onClick={doImport} disabled={!fileUrl || processing} variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {processing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />} تحليل واستيراد
          </Button>
          {(file || result) && <Button variant="ghost" onClick={reset}>إلغاء</Button>}
        </div>
      </div>

      {(processing && !result) && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700 flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> جارٍ تحليل الملف ومطابقة الموظفين وإنشاء سجلات الحضور...
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Count label="إجمالي السجلات" value={result.total} cls="bg-slate-50 text-slate-700" />
            <Count label="سجلات جديدة" value={result.created} cls="bg-emerald-50 text-emerald-600" />
            <Count label="محدّثة" value={result.updated} cls="bg-blue-50 text-blue-600" />
            <Count label="غير مطابقة" value={result.unmatchedCount} cls="bg-rose-50 text-rose-600" />
          </div>

          <div className={cn("rounded-2xl border p-5 flex items-start gap-3",
            result.unmatchedCount === 0 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200")}>
            {result.unmatchedCount === 0
              ? <CheckCircle2 size={22} className="text-emerald-600 mt-0.5" />
              : <AlertTriangle size={22} className="text-amber-600 mt-0.5" />}
            <div className="text-sm">
              {result.unmatchedCount === 0
                ? "تم استيراد كل السجلات ومطابقتها بنجاح. ستُحتسب هذه الحضور تلقائياً عند توليد الرواتب."
                : `تم استيراد ${result.created + result.updated} سجل. ${result.unmatchedCount} سجل لم يُطابق موظفاً — تأكد من تطابق الرقم الوظيفي في الملف مع سجلات الموظفين.`}
            </div>
          </div>

          {result.unmatched?.length > 0 && (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border text-sm font-medium">السجلات غير المطابقة</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-muted-foreground text-xs">
                    <tr>
                      <th className="text-right px-4 py-2 font-medium">الرقم / الاسم</th>
                      <th className="text-right px-4 py-2 font-medium">التاريخ</th>
                      <th className="text-right px-4 py-2 font-medium">الحضور</th>
                      <th className="text-right px-4 py-2 font-medium">الانصراف</th>
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
  return (
    <div className={cn("rounded-2xl p-4", cls)}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}