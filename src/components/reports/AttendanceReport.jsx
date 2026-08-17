import React, { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, CalendarRange, Users2, CheckCircle2, Clock, XCircle, CalendarOff } from "lucide-react";
import { printReport } from "@/lib/reportPrint";
import { cn } from "@/lib/utils";
import { attendanceStatusLabel } from "@/lib/hr";

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

// تقرير الحضور والانصراف الشهري — اختيار شهر (شامل الأشهر الماضية الموجودة) وتصدير PDF
// يحمل شعار المنشأة يميناً وشعار جدارة يسار أعلى الصفحة عبر printReport (BrandHeader).
export default function AttendanceReport({ org }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selKey, setSelKey] = useState("");
  const [exporting, setExporting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const all = await base44.entities.Attendance.list("-created_date", 1000);
        setRecords(all || []);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const groups = useMemo(() => {
    const m = new Map();
    (records || []).forEach((r) => {
      const d = String(r.date || "").slice(0, 10);
      if (!d) return;
      const [y, mo] = d.split("-");
      const k = `${y}-${mo}`;
      if (!m.has(k)) m.set(k, { key: k, year: Number(y), month: Number(mo), rows: [] });
      m.get(k).rows.push(r);
    });
    return Array.from(m.values()).sort((a, b) => (b.year - a.year) || (b.month - a.month));
  }, [records]);

  useEffect(() => {
    if (!selKey && groups.length) setSelKey(groups[0].key);
  }, [groups, selKey]);

  const sel = groups.find((g) => g.key === selKey) || groups[0] || null;

  const counts = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, leave: 0 };
    (sel?.rows || []).forEach((r) => {
      if (c[r.status] != null) c[r.status] += 1;
    });
    return c;
  }, [sel]);

  const monthLabel = (y, m) => `${MONTHS_AR[(m || 1) - 1] || ""} ${y}`;

  const onExport = async () => {
    if (!ref.current || !sel) return;
    setExporting(true);
    try {
      await printReport(ref.current, {
        org,
        title: `تقرير الحضور والانصراف — ${monthLabel(sel.year, sel.month)}`,
        subtitle: `إجمالي السجلات: ${sel.rows.length} — حاضر: ${counts.present} · متأخر: ${counts.late} · غائب: ${counts.absent} · إجازة: ${counts.leave}`,
        stamp: true,
        landscape: true,
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
        جارٍ تحميل سجلات الحضور الشهرية…
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
        <CalendarRange className="mx-auto mb-3 text-muted-foreground/50" size={28} />
        لا توجد سجلات حضور شهرية بعد — سيظهر هنا تقرير شهري قابل للتحميل PDF فور تسجيل أول حضور.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">اختر الشهر</label>
          <select
            value={selKey}
            onChange={(e) => setSelKey(e.target.value)}
            className="h-9 rounded-md border border-input bg-white px-3 text-sm font-medium min-w-[220px]"
          >
            {groups.map((g) => (
              <option key={g.key} value={g.key}>
                {monthLabel(g.year, g.month)} — {g.rows.length} سجل
              </option>
            ))}
          </select>
        </div>
        <Button onClick={onExport} disabled={exporting || !sel} className="gap-2">
          {exporting ? <Printer size={16} className="animate-spin" /> : <Printer size={16} />}
          تحميل تقرير الشهر PDF
        </Button>
      </div>

      {sel && (
        <div ref={ref} className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CalendarRange size={16} className="text-violet-600" /> {monthLabel(sel.year, sel.month)}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            <Stat icon={Users2} label="إجمالي السجلات" value={sel.rows.length} tone="violet" />
            <Stat icon={CheckCircle2} label="حاضر" value={counts.present} tone="emerald" />
            <Stat icon={Clock} label="متأخر" value={counts.late} tone="amber" />
            <Stat icon={XCircle} label="غائب" value={counts.absent} tone="rose" />
            <Stat icon={CalendarOff} label="إجازة" value={counts.leave} tone="blue" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead className="text-center">الهوية/الإقامة</TableHead>
                <TableHead className="text-center">التاريخ</TableHead>
                <TableHead className="text-center">الحضور</TableHead>
                <TableHead className="text-center">الانصراف</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sel.rows.map((r) => {
                const s = attendanceStatusLabel(r.status);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.employee_name || "—"}
                      <span className="block text-[11px] text-muted-foreground tabular-nums" dir="ltr">{r.national_id || "—"}</span>
                    </TableCell>
                    <TableCell className="text-center tabular-nums" dir="ltr">{r.national_id || "—"}</TableCell>
                    <TableCell className="text-center text-xs">{String(r.date || "").slice(0, 10)}</TableCell>
                    <TableCell className="text-center tabular-nums">{r.check_in || "—"}</TableCell>
                    <TableCell className="text-center tabular-nums">{r.check_out || "—"}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", s.cls)}>{s.label}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  const tones = {
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <div className={cn("rounded-xl border p-3", tones[tone] || tones.violet)}>
      <div className="flex items-center gap-1.5 text-xs opacity-80">
        <Icon size={13} /> {label}
      </div>
      <div className="text-lg font-bold mt-0.5">{value}</div>
    </div>
  );
}