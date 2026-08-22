import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import {
  Users, CalendarCheck, ClipboardList, Wallet, Clock, CheckCircle2, AlertCircle,
  Bell, IdCard, Shield, Car, FileText, Wrench
} from "lucide-react";
import { formatCurrency, leaveTypeLabel, statusColors, todayISO } from "@/lib/hr";
import { cn } from "@/lib/utils";
import { expirySeverity, daysUntil } from "@/lib/eos";
import { useI18n } from "@/lib/i18n";
import PullToRefresh from "@/components/PullToRefresh";

export default function Dashboard() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "لوحة التحكم", subtitle: "نظرة عامة على حالة الموارد البشرية",
    sEmp: "إجمالي الموظفين", sOnLeave: "في إجازة", sPending: "طلبات بانتظار المراجعة", sAlerts: "تنبيهات انتهاء صلاحية",
    alertsH: "تنبيهات قرب انتهاء/انتهاء الصلاحيات",
    recentH: "أحدث طلبات الإجازة", viewAll: "عرض الكل", empty: "لا توجد طلبات", emp: "موظف", day: (n) => `${n} يوم`,
    todayH: "حضور اليوم", viewDet: "عرض التفاصيل",
    present: "حاضر", late: "متأخر", absent: "غائب", leave: "إجازة",
    pend: "بانتظار", appr: "موافق", rej: "مرفوض",
    iqama: "انتهاء الإقامة", passp: "انتهاء الجواز", med: "التأمين الطبي",
    vIns: "تأمين المركبة", vLic: "رخصة السير", vFis: "الفحص الفني",
  } : {
    title: "Dashboard", subtitle: "Overview of HR status",
    sEmp: "Total employees", sOnLeave: "On leave", sPending: "Requests pending review", sAlerts: "Expiry alerts",
    alertsH: "Upcoming / expired document alerts",
    recentH: "Recent leave requests", viewAll: "View all", empty: "No requests", emp: "Employee", day: (n) => `${n} days`,
    todayH: "Today's attendance", viewDet: "View details",
    present: "Present", late: "Late", absent: "Absent", leave: "Leave",
    pend: "Pending", appr: "Approved", rej: "Rejected",
    iqama: "Iqama expiry", passp: "Passport expiry", med: "Health insurance",
    vIns: "Vehicle insurance", vLic: "Vehicle license", vFis: "Technical inspection",
  };

  const [stats, setStats] = useState({ employees: 0, onLeave: 0, pending: 0, payroll: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [emps, leaves, attendance, vehicles] = await Promise.all([
      base44.entities.Employee.list("-created_date", 500),
      base44.entities.LeaveRequest.list("-created_date", 10),
      base44.entities.Attendance.filter({ date: todayISO() }, "-created_date", 100),
      base44.entities.Vehicle.list("-created_date", 500),
    ]);
    const activePay = await base44.entities.Payroll.filter({ status: "paid" }, "-created_date", 100);
    setStats({
      employees: emps.length,
      onLeave: emps.filter((e) => e.status === "on_leave").length,
      pending: leaves.filter((l) => l.status === "pending").length,
      payroll: activePay.reduce((s, p) => s + (p.net_salary || 0), 0),
    });
    setRecentLeaves(leaves.slice(0, 5));
    setTodayAttendance(attendance);
    setEmployees(emps);
    setAlerts(buildAlerts(emps, vehicles, isAr, t));
    setLoading(false);
  };
  useEffect(() => { load(); }, [lang]);

  if (loading) return <DashboardSkeleton />;

  const expCount = alerts.length;

  return (
    <PullToRefresh onRefresh={load}>
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label={t.sEmp} value={stats.employees} tint="blue" />
        <StatCard icon={Clock} label={t.sOnLeave} value={stats.onLeave} tint="amber" />
        <StatCard icon={AlertCircle} label={t.sPending} value={stats.pending} tint="rose" />
        <StatCard icon={Bell} label={t.sAlerts} value={expCount} tint="violet" />
      </div>

      {expCount > 0 && (
        <div className="bg-white rounded-2xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Bell size={18} className="text-violet-600" /> {t.alertsH}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {alerts.slice(0, 8).map((a, i) => {
              const sev = expirySeverity(a.date);
              return (
                <div key={i} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm", sev.cls)}>
                  <a.icon size={16} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{a.title}</div>
                    {a.nat ? <div className="text-[11px] opacity-70 tabular-nums" dir="ltr">{a.nat}</div> : null}
                    <div className="text-xs opacity-80">{a.label} · {a.date}</div>
                  </div>
                  <span className="text-xs font-bold shrink-0">{sev.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t.recentH}</h3>
            <Link to="/leaves" className="text-sm text-slate-600 hover:underline">{t.viewAll}</Link>
          </div>
          <div className="space-y-3">
            {recentLeaves.length === 0 && <EmptyRow text={t.empty} />}
            {recentLeaves.map((l) => {
              const ee = employees.find((q) => q.id === l.employee_id);
              return (
                <div key={l.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 text-sm font-semibold">
                      {((ee?.full_name || l.employee_name || t.emp).trim()[0] || "—")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{ee?.full_name || l.employee_name || t.emp}</div>
                      <div className="text-xs text-muted-foreground truncate">{leaveTypeLabel(l.leave_type)} · {t.day(l.days_count)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs tabular-nums px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border" dir="ltr">{ee?.national_id || "—"}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors(l.status)}`}>
                      {l.status === "pending" ? t.pend : l.status === "approved" ? t.appr : t.rej}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t.todayH}</h3>
            <Link to="/attendance" className="text-sm text-slate-600 hover:underline">{t.viewDet}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat icon={CheckCircle2} label={t.present} value={todayAttendance.filter((a) => a.status === "present").length} tint="text-emerald-600 bg-emerald-50" />
            <MiniStat icon={Clock} label={t.late} value={todayAttendance.filter((a) => a.status === "late").length} tint="text-amber-600 bg-amber-50" />
            <MiniStat icon={AlertCircle} label={t.absent} value={todayAttendance.filter((a) => a.status === "absent").length} tint="text-rose-600 bg-rose-50" />
            <MiniStat icon={CalendarCheck} label={t.leave} value={todayAttendance.filter((a) => a.status === "leave").length} tint="text-blue-600 bg-blue-50" />
          </div>
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}

function buildAlerts(emps, vehicles, isAr, t) {
  const out = [];
  const vTitle = (v) => {
    const plate = isAr ? v.plate_number : (v.plate_number_en || v.plate_number);
    const brand = isAr ? v.brand : (v.brand_en || v.brand);
    const model = isAr ? v.model : (v.model_en || v.model);
    return `${plate || ""} - ${brand || ""} ${model || ""}`.trim();
  };
  emps.forEach((e) => {
    if (e.iqama_expiry) out.push({ id: e.id + "-iqama", icon: IdCard, title: `${e.full_name}`, nat: e.national_id || "", label: t.iqama, date: e.iqama_expiry });
    if (e.passport_expiry) out.push({ id: e.id + "-pp", icon: IdCard, title: `${e.full_name}`, nat: e.national_id || "", label: t.passp, date: e.passport_expiry });
    if (e.health_insurance_expiry) out.push({ id: e.id + "-hi", icon: Shield, title: `${e.full_name}`, nat: e.national_id || "", label: t.med, date: e.health_insurance_expiry });
  });
  vehicles.forEach((v) => {
    const title = vTitle(v);
    if (v.insurance_expiry) out.push({ id: v.id + "-ins", icon: Car, title, label: t.vIns, date: v.insurance_expiry });
    if (v.license_expiry) out.push({ id: v.id + "-lic", icon: FileText, title, label: t.vLic, date: v.license_expiry });
    if (v.inspection_expiry) out.push({ id: v.id + "-fis", icon: Wrench, title, label: t.vFis, date: v.inspection_expiry });
  });
  return out.filter((a) => { const d = daysUntil(a.date); return d !== null && d <= 90; }).sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
}

function MiniStat({ icon: Icon, label, value, tint }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tint}`}><Icon size={18} /></div>
      <div><div className="text-lg font-bold tabular-nums">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
    </div>
  );
}
function EmptyRow({ text }) { return <div className="text-center text-sm text-muted-foreground py-6">{text}</div>; }
function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-64 bg-slate-200 rounded-xl mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}</div>
      <div className="grid grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-slate-200 rounded-2xl" />)}</div>
    </div>
  );
}