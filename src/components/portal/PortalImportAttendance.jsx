import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ShieldCheck, FileUp, CheckCircle2, AlertCircle } from "lucide-react";

const parseCSV = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const split = (line) => {
    const out = []; let cur = ""; let q = false;
    for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '"') { q = !q; } else if (c === "," && !q) { out.push(cur); cur = ""; } else cur += c; }
    out.push(cur); return out.map((s) => s.trim().replace(/^"|"$/g, ""));
  };
  const header = split(lines[0]).map((h) => h.toLowerCase());
  const idx = (keys) => { for (const k of keys) { const i = header.indexOf(k); if (i >= 0) return i; } return -1; };
  const iNum = idx(["employee_number", "الرقم الوظيفي", "رقم_الموظف", "الرقم"]); const iDate = idx(["date", "التاريخ"]); const iIn = idx(["check_in", "الحضور", "وقت_الدخول"]); const iOut = idx(["check_out", "الانصراف", "وقت_الخروج"]);
  const rows = [];
  for (let li = 1; li < lines.length; li++) { const c = split(lines[li]); if (!c.length) continue; rows.push({ employee_number: c[iNum] || "", date: c[iDate] || "", check_in: c[iIn] || "", check_out: c[iOut] || "" }); }
  return rows;
};

// استيراد البصمات يدويًا في بوابة الموظف — للموظف المُفوّض بصلاحية «import-attendance».
// يقرأ ملف CSV في المتصفح ويُرسل السجلات للخلفية التي تُطابقها وتُنشئ سجلات الحضور موثّقة.
export default function PortalImportAttendance({ session, isAr = true }) {
  const args = { token: session.token, employee_id: session.employee_id };
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const onFile = async (file) => {
    if (!file) return;
    setErr(""); setResult(null); setBusy(true);
    try {
      const text = await file.text();
      let records = parseCSV(text);
      if (!records.length) { setErr(isAr ? "لم يتم العثور على سجلات صالحة في الملف" : "No valid records"); return; }
      const res = await base44.functions.invoke("portalData", { ...args, action: "delegated_import_attendance", records });
      const d = res?.data || res;
      if (d?.ok) setResult(d);
      else setErr(d?.error || (isAr ? "فشل الاستيراد" : "Import failed"));
    } catch (e) { setErr(e.message || String(e)); }
    finally { setBusy(false); }
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-center gap-2 mb-2"><Upload size={18} className="text-violet-600" /><h3 className="font-bold text-sm">{isAr ? "استيراد البصمات يدويًا" : "Manual attendance import"}</h3></div>
        <p className="text-xs text-muted-foreground mb-3">{isAr ? "ارفع ملف CSV يحتوي أعمدة: الرقم الوظيفي، التاريخ، الحضور، الانصراف. تُطابق السجلات بالموظفين وتُنشأ موثّقة باسمك." : "Upload a CSV with: employee_number, date, check_in, check_out. Records are matched and attributed to you."}</p>
        <div className="text-[11px] text-violet-700 flex items-center gap-1.5 mb-3"><ShieldCheck size={13} />{isAr ? "كل سجل حضور يُستورد يُوثّق باسمك ورقم هويتك." : "Every imported record is attributed to you."}</div>
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:bg-slate-50 transition">
          <FileUp size={28} className="text-violet-500" />
          <span className="text-sm text-muted-foreground">{isAr ? "اختر ملف CSV" : "Choose CSV file"}</span>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} disabled={busy} />
        </label>
      </div>
      {busy && <div className="p-6 text-center text-muted-foreground flex items-center justify-center gap-2 text-sm"><Loader2 className="animate-spin" size={16} />{isAr ? "جارٍ الاستيراد..." : "Importing..."}</div>}
      {err && <div className="bg-rose-50 text-rose-700 rounded-xl p-4 text-sm flex items-center gap-2"><AlertCircle size={16} />{err}</div>}
      {result && (
        <div className="bg-emerald-50 text-emerald-800 rounded-xl p-4 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} />
          {isAr ? `تم استيراد ${result.imported} سجل من أصل ${result.total}${result.skipped ? ` (تخطّي ${result.skipped})` : ""}.` : `Imported ${result.imported} of ${result.total}${result.skipped ? ` (${result.skipped} skipped)` : ""}.`}
        </div>
      )}
    </div>
  );
}