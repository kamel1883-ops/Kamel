import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/hr";
import { turnoverWindow, attendanceRate, statusSplit, CHART_PALETTE } from "@/lib/analytics";
import { BarChart3, FileText, FileSpreadsheet, Car, Plane, CalendarCheck, Users, ShieldCheck, Truck, TrendingDown, Clock, AlertTriangle, Target, DoorOpen, ClipboardList, Sparkles, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";

const daysUntil = (d) => { if (!d) return null; const t = new Date(d).getTime(); if (isNaN(t)) return null; return Math.ceil((t - Date.now()) / 86400000); };
const addMonths = (n) => { const d = new Date(); d.setMonth(d.getMonth() + n); return d; };
const monthKey = (d) => `${new Date(d).getFullYear()}-${String(new Date(d).getMonth() + 1).padStart(2, "0")}`;

export default function ReportsPanel({ employees, attendance }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    section: "مركز التقارير", sectionSub: "تقارير ورسوم بيانية لدعم القرار — ضمن صفحة التحليلات",
    pick: "اختر تقريراً",
    rContracts: "العقود المنتهية", rTurnover: "معدل الدوران", rAttAll: "الحضور والغياب (الجميع)", rAttOne: "الحضور والغياب (موظف)",
    rActive: "نشط/غير نشط", rLicenses: "تراخيص قاربت الانتهاء", rVehicles: "تقرير الأسطول", rTrips: "رحلات العمل",
    window: "نافذة الإنذار", m30: "30 يوم", m60: "60 يوم", m90: "90 يوم", expiringSoon: "قارب الانتهاء", expired: "منتهي", within: "خلال",
    noData: "لا توجد بيانات", allEmps: "كل الموظفين", selectEmp: "اختر موظفاً",
    days: "يوم", daysLeft: "الأيام المتبقية", retire: "تقاعد/انتهاء العقد",
    attRate: "نسبة الحضور", absRate: "نسبة الغياب", present: "حاضر", absent: "غائب", late: "متأخر", leave: "إجازة", holiday: "عطلة",
    activeE: "نشط", inactive: "غير نشط", statusBy: "حالات الموظفين",
    vehStatus: "حالة المركبات", vehExpiry: "انتهاءات قريبة", insuranceExp: "تأمين", licenseExp: "رخصة", inspectionExp: "فحص",
    tripTable: "رحلات ضمن الفترة", tripEmp: "الموظف", tripDest: "الوجهة", tripDates: "الفترة", tripDays: "الأيام", tripCost: "التكلفة", tripsByMonth: "رحلات حسب الشهر",
    window3: "3 أشهر", window6: "6 أشهر",
    rWarnings: "الإنذارات (موظف)", rPerf: "إدارة الأداء", rExit: "مقابلات المغادرة", rSurveys: "الاستبيانات",
    warnType: "نوع المخالفة", warnLevel: "الدرجة", warnCount: "عدد الإنذارات", warnDate: "تاريخ الواقعة", warnNote: "نص الإنذار",
    perfAll: "متوسط الأداء للموظفين", perfOne: "أداء الموظف", perfPeriod: "الفترة", perfRate: "التقييم", perfRec: "التوصية",
    exitReasons: "أسباب المغادرة", exitSat: "متوسط الرضا", exitCount: "عدد المقابلات",
    survSent: "الانطباع العام", survAvg: "متوسط التقييم", survCount: "الردود",
    genAI: "توليد توصيات بالذكاء الاصطناعي", generating: "جارٍ التوليد…", aiSummary: "خلاصة", aiRecs: "التوصيات",
  } : {
    section: "Reports Center", sectionSub: "Reports & charts for decision support — inside Analytics",
    pick: "Pick a report",
    rContracts: "Expiring contracts", rTurnover: "Turnover rate", rAttAll: "Attendance & Absence (All)", rAttOne: "Attendance & Absence (Employee)",
    rActive: "Active/Inactive", rLicenses: "Licenses expiring", rVehicles: "Fleet report", rTrips: "Business trips",
    window: "Alert window", m30: "30 days", m60: "60 days", m90: "90 days", expiringSoon: "Expiring soon", expired: "Expired", within: "within",
    noData: "No data", allEmps: "All employees", selectEmp: "Select employee",
    days: "days", daysLeft: "Days left", retire: "retire/contract end",
    attRate: "Attendance rate", absRate: "Absence rate", present: "Present", absent: "Absent", late: "Late", leave: "Leave", holiday: "Holiday",
    activeE: "Active", inactive: "Inactive", statusBy: "Employee status",
    vehStatus: "Vehicle status", vehExpiry: "Upcoming expiries", insuranceExp: "Insurance", licenseExp: "License", inspectionExp: "Inspection",
    tripTable: "Trips in period", tripEmp: "Employee", tripDest: "Destination", tripDates: "Period", tripDays: "Days", tripCost: "Cost", tripsByMonth: "Trips by month",
    window3: "3 months", window6: "6 months",
    rWarnings: "Warnings (employee)", rPerf: "Performance", rExit: "Exit interviews", rSurveys: "Surveys",
    warnType: "Violation type", warnLevel: "Level", warnCount: "Warnings count", warnDate: "Incident date", warnNote: "Warning text",
    perfAll: "Avg performance per employee", perfOne: "Employee performance", perfPeriod: "Period", perfRate: "Rating", perfRec: "Recommendation",
    exitReasons: "Exit reasons", exitSat: "Avg satisfaction", exitCount: "Interviews",
    survSent: "Overall sentiment", survAvg: "Avg rating", survCount: "Responses",
    genAI: "Generate AI recommendations", generating: "Generating…", aiSummary: "Summary", aiRecs: "Recommendations",
  };

  const REPORTS = [
    { id: "contracts", label: t.rContracts, icon: FileSpreadsheet },
    { id: "turnover", label: t.rTurnover, icon: TrendingDown },
    { id: "attAll", label: t.rAttAll, icon: CalendarCheck },
    { id: "attOne", label: t.rAttOne, icon: Clock },
    { id: "actInactive", label: t.rActive, icon: Users },
    { id: "licenses", label: t.rLicenses, icon: ShieldCheck },
    { id: "vehicles", label: t.rVehicles, icon: Car },
    { id: "trips", label: t.rTrips, icon: Plane },
    { id: "warningsOne", label: t.rWarnings, icon: AlertTriangle },
    { id: "performance", label: t.rPerf, icon: Target },
    { id: "exit", label: t.rExit, icon: DoorOpen },
    { id: "surveys", label: t.rSurveys, icon: ClipboardList },
  ];

  const [rid, setRid] = useState("contracts");
  const [extra, setExtra] = useState({ records: [] });
  const [winM, setWinM] = useState(90);
  const [tripM, setTripM] = useState(6);
  const [empId, setEmpId] = useState("");

  useEffect(() => {
    (async () => {
      const [lic, veh, trp, wrn, rev, exi, srv, sres] = await Promise.all([
        base44.entities.License.list("-expiry_date", 500).catch(() => []),
        base44.entities.Vehicle.list("-created_date", 500).catch(() => []),
        base44.entities.BusinessTrip.list("-start_date", 500).catch(() => []),
        base44.entities.Warning.list("-created_date", 1000).catch(() => []),
        base44.entities.Performance.list("-created_date", 1000).catch(() => []),
        base44.entities.ExitInterview.list("-interview_date", 1000).catch(() => []),
        base44.entities.Survey.list("-created_date", 500).catch(() => []),
        base44.entities.SurveyResponse.list("-submitted_date", 1000).catch(() => []),
      ]);
      setExtra({ lic, veh, trp, warnings: wrn, reviews: rev, exits: exi, surveys: srv, sresponses: sres });
    })();
  }, []);

  const statusLabel = (k) => ({ present: t.present, absent: t.absent, late: t.late, leave: t.leave, holiday: t.holiday }[k] || k);

  return (
    <div className="mt-8" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-5">
        <h2 className="text-lg font-bold flex items-center gap-2"><BarChart3 size={20} className="text-violet-600" /> {t.section}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.sectionSub}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <button key={r.id} onClick={() => setRid(r.id)} className={cn("inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition",
              rid === r.id ? "bg-slate-800 text-white border-slate-800" : "bg-white text-foreground border-border hover:bg-muted")}>
              <Icon size={15} /> {r.label}
            </button>
          );
        })}
      </div>

      {(rid === "contracts") && <ContractsReport employees={employees} winM={winM} setWinM={setWinM} t={t} />}
      {rid === "turnover" && <TurnoverReport employees={employees} t={t} />}
      {rid === "attAll" && <AttAllReport attendance={attendance} statusLabel={statusLabel} t={t} />}
      {rid === "attOne" && <AttOneReport employees={employees} attendance={attendance} empId={empId} setEmpId={setEmpId} statusLabel={statusLabel} t={t} />}
      {rid === "actInactive" && <ActInactiveReport employees={employees} t={t} />}
      {rid === "licenses" && <LicensesReport records={extra.lic || []} t={t} />}
      {rid === "vehicles" && <VehiclesReport records={extra.veh || []} t={t} />}
      {rid === "trips" && <TripsReport records={extra.trp || []} tripM={tripM} setTripM={setTripM} t={t} />}
      {rid === "warningsOne" && <WarningsReport records={extra.warnings || []} employees={employees} empId={empId} setEmpId={setEmpId} t={t} />}
      {rid === "performance" && <PerformanceReport records={extra.reviews || []} employees={employees} empId={empId} setEmpId={setEmpId} t={t} />}
      {rid === "exit" && <ExitReport records={extra.exits || []} t={t} />}
      {rid === "surveys" && <SurveysReport surveys={extra.surveys || []} responses={extra.sresponses || []} t={t} />}
    </div>
  );
}

function Card({ title, children }) {
  return (<div className="bg-white rounded-2xl border border-border p-5 mb-5"><h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><FileText size={16} className="text-slate-400" /> {title}</h3>{children}</div>);
}
function Empty() { return <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">—</div>; }
function NoRows({ text }) { return <div className="p-8 text-center text-muted-foreground text-sm">{text}</div>; }

function WinButtons({ winM, setWinM, t }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-white overflow-hidden mb-4">
      {[[30,t.m30],[60,t.m60],[90,t.m90]].map(([v,l]) => (
        <button key={v} onClick={() => setWinM(v)} className={cn("px-3 py-1.5 text-sm font-medium", winM === v ? "bg-slate-800 text-white" : "text-muted-foreground hover:bg-slate-50")}>{l}</button>
      ))}
    </div>
  );
}

function ContractsReport({ employees, winM, setWinM, t }) {
  const rows = useMemo(() => employees
    .map((e) => ({ e, d: daysUntil(e.contract_end_date) }))
    .filter((x) => x.d != null && x.d <= winM)
    .sort((a, b) => a.d - b.d), [employees, winM]);
  const byDept = useMemo(() => {
    const m = {}; rows.forEach(({ e }) => { const d = e.department || "—"; m[d] = (m[d] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [rows]);
  return (
    <div>
      <WinButtons winM={winM} setWinM={setWinM} t={t} />
      <Card title={`${t.rContracts} — ${t.within} ${winM} ${t.days}`}>
        {byDept.length ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byDept} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={70} interval={0} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} /><Tooltip /><Bar dataKey="value" radius={[6,6,0,0]}>{byDept.map((_,i)=><Cell key={i} fill={CHART_PALETTE[i%CHART_PALETTE.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty />}
      </Card>
      <Card title={t.daysLeft}>
        {rows.length ? (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="text-xs text-muted-foreground"><th className="text-right pb-2 font-medium">{t.tripEmp}</th><th className="text-right pb-2 font-medium">{t.retire}</th><th className="text-left pb-2 font-medium">{t.daysLeft}</th></tr></thead>
            <tbody>{rows.map(({ e, d }) => (
              <tr key={e.id} className="border-t border-border"><td className="py-2">{e.full_name}</td><td className="py-2">{e.contract_end_date}</td>
                <td className="py-2"><span className={cn("text-xs px-2 py-0.5 rounded-full", d < 0 ? "bg-rose-100 text-rose-700" : d <= 30 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{d} {t.days}</span></td></tr>
            ))}</tbody>
          </table></div>
        ) : <NoRows text={t.noData} />}
      </Card>
    </div>
  );
}

function TurnoverReport({ employees, t }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const periods = [["quarter",3, isAr?"ربع سنوي":"Quarterly"],["half",6,isAr?"نصف سنوي":"Semi-annual"],["year",12,isAr?"سنوي":"Annual"],["nine",9,isAr?"9 أشهر":"9 months"]];
  const data = periods.map(([k,m,l]) => { const r = turnoverWindow(employees, m); return { name: l, hires: r.hires, exits: r.exits, rate: r.turnoverRate }; });
  return (
    <Card title={t.rTurnover}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} /><Tooltip /><Legend />
          <Bar dataKey="hires" name={isAr?"تعيينات":"Hires"} fill="#6366f1" radius={[6,6,0,0]} />
          <Bar dataKey="exits" name={isAr?"مغادرات":"Exits"} fill="#f43f5e" radius={[6,6,0,0]} />
          <Bar dataKey="rate" name={isAr?"معدل الدوران %":"Turnover %"} fill="#f59e0b" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {data.map((d) => (
          <div key={d.name} className="rounded-xl bg-muted/60 border border-border p-3"><div className="text-xs text-muted-foreground">{d.name}</div><div className="text-sm font-bold mt-1">{d.rate}%</div><div className="text-xs text-muted-foreground">{d.hires}/{isAr?"—":"·"}/{d.exits}</div></div>
        ))}
      </div>
    </Card>
  );
}

function AttAllReport({ attendance, statusLabel, t }) {
  const counts = useMemo(() => { const m = {}; attendance.forEach((a) => { m[a.status] = (m[a.status] || 0) + 1; }); return Object.entries(m).map(([k,v]) => ({ name: statusLabel(k), value: v })); }, [attendance, statusLabel]);
  const total = counts.reduce((s, x) => s + x.value, 0);
  const present = (counts.find((c) => c.name === t.present)?.value || 0);
  const absent = (counts.find((c) => c.name === t.absent)?.value || 0);
  const late = (counts.find((c) => c.name === t.late)?.value || 0);
  const attRate = total ? Math.round((present / total) * 100) : 0;
  const absRate = total ? Math.round((absent / total) * 100) : 0;
  return (
    <Card title={t.rAttAll}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3"><div className="text-xs text-muted-foreground">{t.attRate}</div><div className="text-xl font-bold">{attRate}%</div></div>
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-3"><div className="text-xs text-muted-foreground">{t.absRate}</div><div className="text-xl font-bold">{absRate}%</div></div>
      </div>
      {counts.length ? (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart><Pie data={counts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>{counts.map((_,i)=><Cell key={i} fill={CHART_PALETTE[i%CHART_PALETTE.length]} />)}</Pie><Legend /><Tooltip /></PieChart>
        </ResponsiveContainer>
      ) : <Empty />}
    </Card>
  );
}

function AttOneReport({ employees, attendance, empId, setEmpId, statusLabel, t }) {
  const rows = useMemo(() => empId ? attendance.filter((a) => a.employee_id === empId) : [], [attendance, empId]);
  const counts = useMemo(() => { const m = {}; rows.forEach((a) => { m[a.status] = (m[a.status] || 0) + 1; }); return Object.entries(m).map(([k,v]) => ({ name: statusLabel(k), value: v })); }, [rows, statusLabel]);
  const total = counts.reduce((s, x) => s + x.value, 0);
  const present = counts.find((c) => c.name === t.present)?.value || 0;
  const absent = counts.find((c) => c.name === t.absent)?.value || 0;
  const attRate = total ? Math.round((present / total) * 100) : 0;
  const absRate = total ? Math.round((absent / total) * 100) : 0;
  return (
    <div>
      <select value={empId} onChange={(e) => setEmpId(e.target.value)} className="mb-4 h-9 rounded-md border border-input bg-transparent px-3 text-sm">
        <option value="">{t.selectEmp}</option>
        {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
      </select>
      {empId ? (
        <Card title={t.rAttOne}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3"><div className="text-xs text-muted-foreground">{t.attRate}</div><div className="text-xl font-bold">{attRate}%</div></div>
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-3"><div className="text-xs text-muted-foreground">{t.absRate}</div><div className="text-xl font-bold">{absRate}%</div></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {counts.length ? (
              <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={counts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>{counts.map((_,i)=><Cell key={i} fill={CHART_PALETTE[i%CHART_PALETTE.length]} />)}</Pie><Legend /><Tooltip /></PieChart></ResponsiveContainer>
            ) : <Empty />}
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-xs text-muted-foreground"><th className="text-right pb-2 font-medium">تاريخ</th><th className="text-right pb-2 font-medium">حضور</th><th className="text-right pb-2 font-medium">انصراف</th><th className="text-right pb-2 font-medium">حالة</th></tr></thead>
              <tbody>{rows.slice(0,12).map((a) => (<tr key={a.id} className="border-t border-border"><td className="py-2">{a.date}</td><td className="py-2">{a.check_in||"—"}</td><td className="py-2">{a.check_out||"—"}</td><td className="py-2">{statusLabel(a.status)}</td></tr>))}</tbody>
            </table></div>
          </div>
        </Card>
      ) : <NoRows text={t.selectEmp} />}
    </div>
  );
}

function ActInactiveReport({ employees, t }) {
  const active = employees.filter((e) => e.status === "active" || e.status === "on_leave").length;
  const inactive = employees.length - active;
  const data = [{ name: t.activeE, value: active }, { name: t.inactive, value: inactive }];
  return (
    <Card title={t.statusBy}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3"><div className="text-xs text-muted-foreground">{t.activeE}</div><div className="text-xl font-bold">{active}</div></div>
        <div className="rounded-xl bg-slate-100 border border-slate-200 p-3"><div className="text-xs text-muted-foreground">{t.inactive}</div><div className="text-xl font-bold">{inactive}</div></div>
      </div>
      {employees.length ? (
        <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label><Cell fill="#10b981" /><Cell fill="#94a3b8" /></Pie><Legend /><Tooltip /></PieChart></ResponsiveContainer>
      ) : <Empty />}
    </Card>
  );
}

function LicensesReport({ records, t }) {
  const rows = records.filter((l) => !l.not_applicable && l.expiry_date && daysUntil(l.expiry_date) != null).map((l) => ({ l, d: daysUntil(l.expiry_date) })).sort((a,b) => a.d - b.d);
  const soon = rows.filter((x) => x.d <= 90);
  return (
    <Card title={t.rLicenses}>
      {soon.length ? (
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="text-xs text-muted-foreground"><th className="text-right pb-2 font-medium">{isArLabel(t,"الترخيص","License")}</th><th className="text-right pb-2 font-medium">{isArLabel(t,"الجهة","Authority")}</th><th className="text-right pb-2 font-medium">{isArLabel(t,"الانتهاء","Expiry")}</th><th className="text-left pb-2 font-medium">{t.daysLeft}</th></tr></thead>
          <tbody>{soon.map(({ l, d }) => (
            <tr key={l.id} className="border-t border-border"><td className="py-2">{l.custom_label || l.license_type}</td><td className="py-2">{l.issuing_authority || "—"}</td><td className="py-2">{l.expiry_date}</td>
              <td className="py-2"><span className={cn("text-xs px-2 py-0.5 rounded-full", d < 0 ? "bg-rose-100 text-rose-700" : d <= 30 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{d} {t.days}</span></td></tr>
          ))}</tbody>
        </table></div>
      ) : <NoRows text={t.noData} />}
    </Card>
  );
}
function isArLabel(t, ar, en) { return t.days ? ar : en; }

function VehiclesReport({ records, t }) {
  const statusCounts = useMemo(() => { const m = {}; records.forEach((v) => { m[v.status] = (m[v.status] || 0) + 1; }); return Object.entries(m).map(([k,v]) => ({ name: k, value: v })); }, [records]);
  const rows = records.filter((v) => v.insurance_expiry || v.license_expiry || v.inspection_expiry)
    .map((v) => ({ v, d: Math.min(...[v.insurance_expiry, v.license_expiry, v.inspection_expiry].filter(Boolean).map((x) => daysUntil(x) ?? Infinity)) }))
    .filter((x) => Number.isFinite(x.d) && x.d <= 90).sort((a,b) => a.d - b.d);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card title={t.vehStatus}>
        {statusCounts.length ? (
          <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{statusCounts.map((_,i)=><Cell key={i} fill={CHART_PALETTE[i%CHART_PALETTE.length]} />)}</Pie><Legend /><Tooltip /></PieChart></ResponsiveContainer>
        ) : <Empty />}
      </Card>
      <Card title={t.vehExpiry}>
        {rows.length ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-xs text-muted-foreground"><th className="text-right pb-2 font-medium">{isArLabel(t,"المركبة","Vehicle")}</th><th className="text-right pb-2 font-medium">{t.insuranceExp}</th><th className="text-right pb-2 font-medium">{t.licenseExp}</th><th className="text-right pb-2 font-medium">{t.inspectionExp}</th></tr></thead>
            <tbody>{rows.map(({ v }) => (
              <tr key={v.id} className="border-t border-border"><td className="py-2">{v.plate_number || v.brand}</td>
                <td className="py-2"><ExpCell d={daysUntil(v.insurance_expiry)} t={t} /></td>
                <td className="py-2"><ExpCell d={daysUntil(v.license_expiry)} t={t} /></td>
                <td className="py-2"><ExpCell d={daysUntil(v.inspection_expiry)} t={t} /></td></tr>
            ))}</tbody>
          </table></div>
        ) : <NoRows text={t.noData} />}
      </Card>
    </div>
  );
}
function ExpCell({ d, t }) { if (d == null) return <span>—</span>; return <span className={cn("text-xs px-2 py-0.5 rounded-full", d < 0 ? "bg-rose-100 text-rose-700" : d <= 30 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{d} {t.days}</span>; }

function TripsReport({ records, tripM, setTripM, t }) {
  const since = addMonths(-tripM);
  const rows = records.filter((r) => r.start_date && new Date(r.start_date) >= since);
  const byMonth = useMemo(() => { const m = {}; rows.forEach((r) => { const k = monthKey(r.start_date); m[k] = (m[k]||0)+1; }); return Object.entries(m).sort().map(([name, value]) => ({ name, value })); }, [rows]);
  return (
    <div>
      <div className="inline-flex rounded-lg border border-border bg-white overflow-hidden mb-4">
        {[[3,t.window3],[6,t.window6]].map(([v,l]) => (
          <button key={v} onClick={() => setTripM(v)} className={cn("px-3 py-1.5 text-sm font-medium", tripM === v ? "bg-slate-800 text-white" : "text-muted-foreground hover:bg-slate-50")}>{l}</button>
        ))}
      </div>
      <Card title={t.tripsByMonth}>
        {byMonth.length ? (
          <ResponsiveContainer width="100%" height={240}><BarChart data={byMonth} margin={{ top:10,right:10,left:0,bottom:0 }}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize:11 }} /><YAxis tick={{ fontSize:11 }} allowDecimals={false} /><Tooltip /><Bar dataKey="value" radius={[6,6,0,0]} fill="#8b5cf6" /></BarChart></ResponsiveContainer>
        ) : <Empty />}
      </Card>
      <Card title={t.tripTable}>
        {rows.length ? (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="text-xs text-muted-foreground"><th className="text-right pb-2 font-medium">{t.tripEmp}</th><th className="text-right pb-2 font-medium">{t.tripDest}</th><th className="text-right pb-2 font-medium">{t.tripDates}</th><th className="text-right pb-2 font-medium">{t.tripDays}</th><th className="text-left pb-2 font-medium">{t.tripCost}</th></tr></thead>
            <tbody>{rows.map((r) => (<tr key={r.id} className="border-t border-border"><td className="py-2">{r.employee_name || "—"}</td><td className="py-2">{r.destination || "—"}</td><td className="py-2">{r.start_date} ← {r.end_date}</td><td className="py-2">{r.days_count || 0}</td><td className="py-2">{formatCurrency(r.total_cost || 0)}</td></tr>))}</tbody>
          </table></div>
        ) : <NoRows text={t.noData} />}
      </Card>
    </div>
  );
}

const warnLevelMap = { first: { ar: "أول", en: "First" }, second: { ar: "ثاني", en: "Second" }, third: { ar: "ثالث", en: "Third" }, termination: { ar: "فصل", en: "Termination" } };
const warnTypeMap = {
  absence_short: { ar: "غياب قصير", en: "Short absence" }, absence_repeated: { ar: "غياب متكرر", en: "Repeated absence" },
  absence_long: { ar: "غياب طويل", en: "Long absence" }, tardiness: { ar: "التأخير", en: "Tardiness" },
  sleeping: { ar: "النوم", en: "Sleeping" }, product_damage: { ar: "إتلاف منتج", en: "Product damage" },
  disobedience: { ar: "العصيان", en: "Disobedience" }, disclosure: { ar: "إفشاء أسرار", en: "Disclosure" },
  assault: { ar: "اعتداء", en: "Assault" }, safety: { ar: "سلامة", en: "Safety" }, other: { ar: "أخرى", en: "Other" },
};
const recLevelMap = { none: { ar: "—", en: "—" }, maintain: { ar: "إبقاء", en: "Maintain" }, promote: { ar: "ترقية", en: "Promote" }, bonus: { ar: "مكافأة", en: "Bonus" }, warn: { ar: "إنذار", en: "Warn" }, terminate: { ar: "إنهاء", en: "Terminate" } };
const exitReasonLabel = (k, isAr) => (isAr ? { salary: "الراتب", benefits: "المزايا", work_environment: "بيئة العمل", management: "الإدارة", career_growth: "النمو", work_life_balance: "التوازن", relocation: "انتقال", personal: "شخصي", company_culture: "الثقافة", other: "أخرى" }[k] || k : k);

function AIInsights({ reportType, summary, t }) {
  const [loading, setLoading] = useState(false);
  const [ins, setIns] = useState(null);
  const [err, setErr] = useState("");
  const run = async () => {
    setLoading(true); setErr(""); setIns(null);
    try {
      const res = await base44.functions.invoke("generateReportInsights", { report_type: reportType, summary });
      const d = res?.data || res;
      setIns(d?.insights || null);
    } catch (e) { setErr(e?.message || "error"); }
    finally { setLoading(false); }
  };
  return (
    <Card title={t.aiRecs}>
      <Button onClick={run} disabled={loading} variant="outline" className="gap-2">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-violet-600" />} {t.genAI}
      </Button>
      {loading && <div className="text-sm text-muted-foreground mt-3">{t.generating}</div>}
      {err && <div className="text-sm text-rose-700 mt-3">{err}</div>}
      {ins && (
        <div className="mt-4 space-y-3">
          <div><div className="text-xs text-muted-foreground mb-1">{t.aiSummary}</div><p className="text-sm leading-relaxed">{ins.summary}</p></div>
          {Array.isArray(ins.recommendations) && ins.recommendations.length > 0 && (
            <div><div className="text-xs text-muted-foreground mb-1">{t.aiRecs}</div>
              <ul className="list-disc pr-5 space-y-1">{ins.recommendations.map((r, i) => <li key={i} className="text-sm leading-relaxed">{r}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function WarningsReport({ records, employees, empId, setEmpId, t }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const rows = empId ? records.filter((w) => w.employee_id === empId) : [];
  const byLevel = ["first", "second", "third", "termination"].map((k) => ({ name: isAr ? warnLevelMap[k].ar : warnLevelMap[k].en, value: rows.filter((w) => w.warning_level === k).length })).filter((x) => x.value > 0);
  const byType = Object.keys(warnTypeMap).map((k) => ({ name: isAr ? warnTypeMap[k].ar : warnTypeMap[k].en, value: rows.filter((w) => w.violation_category === k).length })).filter((x) => x.value > 0);
  return (
    <div>
      <select value={empId} onChange={(e) => setEmpId(e.target.value)} className="mb-4 h-9 rounded-md border border-input bg-transparent px-3 text-sm">
        <option value="">{t.selectEmp}</option>
        {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
      </select>
      <Card title={t.warnCount}>
        {empId ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {byLevel.length ? (
              <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={byLevel} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>{byLevel.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}</Pie><Legend /><Tooltip /></PieChart></ResponsiveContainer>
            ) : <Empty />}
            {byType.length ? (
              <ResponsiveContainer width="100%" height={220}><BarChart data={byType} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={70} interval={0} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} /><Tooltip /><Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#f43f5e" /></BarChart></ResponsiveContainer>
            ) : <Empty />}
          </div>
        ) : <NoRows text={t.selectEmp} />}
      </Card>
      {empId && rows.length > 0 && (
        <Card title={isAr ? "سجل الإنذارات" : "Warnings log"}>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="text-xs text-muted-foreground"><th className="text-right pb-2 font-medium">{t.warnType}</th><th className="text-right pb-2 font-medium">{t.warnLevel}</th><th className="text-right pb-2 font-medium">{t.warnDate}</th><th className="text-right pb-2 font-medium">{t.warnNote}</th></tr></thead>
            <tbody>{rows.map((w) => (<tr key={w.id} className="border-t border-border"><td className="py-2">{isAr ? (warnTypeMap[w.violation_category]?.ar || w.violation_category) : (warnTypeMap[w.violation_category]?.en || w.violation_category)}</td><td className="py-2">{isAr ? (warnLevelMap[w.warning_level]?.ar || w.warning_level) : (warnLevelMap[w.warning_level]?.en || w.warning_level)}</td><td className="py-2">{w.incident_date}</td><td className="py-2 max-w-xs truncate">{w.description}</td></tr>))}</tbody>
          </table></div>
        </Card>
      )}
    </div>
  );
}

function PerformanceReport({ records, employees, empId, setEmpId, t }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  if (!empId) {
    const m = {};
    records.forEach((r) => { if (!r.employee_id) return; const e = (m[r.employee_id] || (m[r.employee_id] = { name: r.employee_name || r.employee_id, sum: 0, n: 0 })); e.sum += (Number(r.overall_rating) || 0); e.n++; });
    const data = Object.values(m).map((e) => ({ name: e.name, value: e.n ? Math.round((e.sum / e.n) * 100) / 100 : 0 })).sort((a, b) => b.value - a.value).slice(0, 15);
    return (
      <Card title={t.perfAll}>
        {data.length ? (
          <ResponsiveContainer width="100%" height={280}><BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={80} interval={0} /><YAxis domain={[0, 5]} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#f59e0b" /></BarChart></ResponsiveContainer>
        ) : <Empty />}
      </Card>
    );
  }
  const rows = records.filter((r) => r.employee_id === empId);
  const recent = rows.slice().reverse().slice(-5);
  const radar = recent.map((r) => ({ name: r.review_period ? String(r.review_period) : "", goals: Number(r.goals_rating) || 0, comp: Number(r.competencies_rating) || 0, values: Number(r.values_rating) || 0, overall: Number(r.overall_rating) || 0 }));
  return (
    <div>
      <Card title={t.perfOne}>
        {radar.length ? (
          <ResponsiveContainer width="100%" height={260}><BarChart data={radar} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[0, 5]} tick={{ fontSize: 11 }} /><Tooltip /><Legend /><Bar dataKey="goals" name={isAr ? "الأهداف" : "Goals"} fill="#6366f1" radius={[4, 4, 0, 0]} /><Bar dataKey="comp" name={isAr ? "الكفاءات" : "Comp."} fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="values" name={isAr ? "القيم" : "Values"} fill="#f59e0b" radius={[4, 4, 0, 0]} /><Bar dataKey="overall" name={isAr ? "الكلي" : "Overall"} fill="#ef4444" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        ) : <Empty />}
      </Card>
      <Card title={isAr ? "سجل التقييمات" : "Reviews log"}>
        {rows.length ? (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="text-xs text-muted-foreground"><th className="text-right pb-2 font-medium">{t.perfPeriod}</th><th className="text-right pb-2 font-medium">{t.perfRate}</th><th className="text-right pb-2 font-medium">{t.perfRec}</th></tr></thead>
            <tbody>{rows.map((r) => (<tr key={r.id} className="border-t border-border"><td className="py-2">{r.review_period} {r.period_year || ""}</td><td className="py-2">{Number(r.overall_rating) || 0}/5</td><td className="py-2">{isAr ? (recLevelMap[r.recommendation]?.ar || r.recommendation) : (recLevelMap[r.recommendation]?.en || r.recommendation)}</td></tr>))}</tbody>
          </table></div>
        ) : <NoRows text={t.noData} />}
      </Card>
    </div>
  );
}

function ExitReport({ records, t }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const m = {};
  records.forEach((r) => { const k = r.primary_reason || "other"; m[k] = (m[k] || 0) + 1; });
  const reasons = Object.entries(m).map(([name, value]) => ({ name: exitReasonLabel(name, isAr), value }));
  const avg = (field) => { const vals = records.map((r) => Number(r[field])).filter((v) => v > 0); return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0; };
  const sat = [
    { name: isAr ? "الراتب" : "Salary", v: avg("satisfaction_salary") },
    { name: isAr ? "المزايا" : "Benefits", v: avg("satisfaction_benefits") },
    { name: isAr ? "البيئة" : "Environment", v: avg("satisfaction_environment") },
    { name: isAr ? "الإدارة" : "Management", v: avg("satisfaction_management") },
    { name: isAr ? "توصية" : "Recommend", v: avg("would_recommend") },
  ];
  const summary = { total: records.length, reasons: Object.fromEntries(Object.entries(m)), satisfaction: Object.fromEntries(sat.map((s) => [s.name, s.v])) };
  return (
    <div>
      <Card title={`${t.exitCount}: ${records.length}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {reasons.length ? (
            <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={reasons} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{reasons.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}</Pie><Legend /><Tooltip /></PieChart></ResponsiveContainer>
          ) : <Empty />}
          {sat.some((s) => s.v > 0) ? (
            <ResponsiveContainer width="100%" height={240}><BarChart data={sat} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} interval={0} /><YAxis domain={[0, 5]} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="v" name={t.exitSat} radius={[6, 6, 0, 0]} fill="#8b5cf6" /></BarChart></ResponsiveContainer>
          ) : <Empty />}
        </div>
      </Card>
      <AIInsights reportType="exit" summary={summary} t={t} />
    </div>
  );
}

function SurveysReport({ surveys, responses, t }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const sent = (k) => (isAr ? { positive: "إيجابي", neutral: "محايد", negative: "سلبي" }[k] || k : k);
  const sCounts = ["positive", "neutral", "negative"].map((k) => ({ name: sent(k), value: responses.filter((r) => r.overall_sentiment === k).length }));
  const bySurvey = surveys.map((s) => {
    const rs = responses.filter((r) => r.survey_id === s.id);
    const avg = rs.length ? Math.round((rs.reduce((a, r) => a + (Number(r.avg_rating) || 0), 0) / rs.length) * 100) / 100 : 0;
    return { id: s.id, title: s.title, count: rs.length, avg };
  });
  const summary = {
    surveys: bySurvey.map((s) => ({ title: s.title, responses: s.count, avg: s.avg })),
    sentiment: Object.fromEntries(sCounts.map((s) => [s.name, s.value])),
    totalResponses: responses.length,
  };
  return (
    <div>
      <Card title={t.survSent}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {responses.length ? (
            <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={sCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{sCounts.map((_, i) => <Cell key={i} fill={["#10b981", "#94a3b8", "#f43f5e"][i]} />)}</Pie><Legend /><Tooltip /></PieChart></ResponsiveContainer>
          ) : <Empty />}
          {bySurvey.length ? (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="text-xs text-muted-foreground"><th className="text-right pb-2 font-medium">{isAr ? "الاستبيان" : "Survey"}</th><th className="text-right pb-2 font-medium">{t.survCount}</th><th className="text-left pb-2 font-medium">{t.survAvg}</th></tr></thead>
              <tbody>{bySurvey.map((s) => (<tr key={s.id} className="border-t border-border"><td className="py-2">{s.title}</td><td className="py-2">{s.count}</td><td className="py-2">{s.avg || "—"}</td></tr>))}</tbody>
            </table></div>
          ) : <Empty />}
        </div>
      </Card>
      <AIInsights reportType="survey" summary={summary} t={t} />
    </div>
  );
}