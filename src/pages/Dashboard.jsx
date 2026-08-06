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

export default function Dashboard() {
  const [stats, setStats] = useState({ employees: 0, onLeave: 0, pending: 0, payroll: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [alerts, setAlerts] = useState([]);
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
    setAlerts(buildAlerts(emps, vehicles));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <DashboardSkeleton />;

  const expCount = alerts.length;

  return (
    <div>
      <PageHeader title="لوحة التحكم" subtitle="نظرة عامة على حالة الموارد البشرية" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="إجمالي الموظفين" value={stats.employees} tint="blue" />
        <StatCard icon={Clock} label="في إجازة" value={stats.onLeave} tint="amber" />
        <StatCard icon={AlertCircle} label="طلبات بانتظار المراجعة" value={stats.pending} tint="rose" />
        <StatCard icon={Bell} label="تنبيهات انتهاء صلاحية" value={expCount} tint="violet" />
      </div>

      {expCount > 0 && (
        <div className="bg-white rounded-2xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Bell size={18} className="text-violet-600" /> تنبيهات قرب انتهاء/انتهاء الصلاحيات</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {alerts.slice(0, 8).map((a, i) => {
              const sev = expirySeverity(a.date);
              return (
                <div key={i} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm", sev.cls)}>
                  <a.icon size={16} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{a.title}</div>
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
            <h3 className="font-semibold">أحدث طلبات الإجازة</h3>
            <Link to="/leaves" className="text-sm text-slate-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {recentLeaves.length === 0 && <EmptyRow text="لا توجد طلبات" />}
            {recentLeaves.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{l.employee_name || "موظف"}</div>
                  <div className="text-xs text-muted-foreground">{leaveTypeLabel(l.leave_type)} · {l.days_count} يوم</div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors(l.status)}`}>
                  {l.status === "pending" ? "بانتظار" : l.status === "approved" ? "موافق" : "مرفوض"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">حضور اليوم</h3>
            <Link to="/attendance" className="text-sm text-slate-600 hover:underline">عرض التفاصيل</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat icon={CheckCircle2} label="حاضر" value={todayAttendance.filter((a) => a.status === "present").length} tint="text-emerald-600 bg-emerald-50" />
            <MiniStat icon={Clock} label="متأخر" value={todayAttendance.filter((a) => a.status === "late").length} tint="text-amber-600 bg-amber-50" />
            <MiniStat icon={AlertCircle} label="غائب" value={todayAttendance.filter((a) => a.status === "absent").length} tint="text-rose-600 bg-rose-50" />
            <MiniStat icon={CalendarCheck} label="إجازة" value={todayAttendance.filter((a) => a.status === "leave").length} tint="text-blue-600 bg-blue-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildAlerts(emps, vehicles) {
  const out = [];
  emps.forEach((e) => {
    if (e.iqama_expiry) out.push({ id: e.id + "-iqama", icon: IdCard, title: `${e.employee_number} - ${e.position}`, label: "انتهاء الإقامة", date: e.iqama_expiry });
    if (e.passport_expiry) out.push({ id: e.id + "-pp", icon: IdCard, title: `${e.employee_number} - ${e.position}`, label: "انتهاء الجواز", date: e.passport_expiry });
    if (e.health_insurance_expiry) out.push({ id: e.id + "-hi", icon: Shield, title: `${e.employee_number} - ${e.position}`, label: "التأمين الطبي", date: e.health_insurance_expiry });
  });
  vehicles.forEach((v) => {
    if (v.insurance_expiry) out.push({ id: v.id + "-ins", icon: Car, title: `${v.plate_number} - ${v.brand || ""} ${v.model || ""}`, label: "تأمين المركبة", date: v.insurance_expiry });
    if (v.license_expiry) out.push({ id: v.id + "-lic", icon: FileText, title: `${v.plate_number} - ${v.brand || ""} ${v.model || ""}`, label: "رخصة السير", date: v.license_expiry });
    if (v.inspection_expiry) out.push({ id: v.id + "-fis", icon: Wrench, title: `${v.plate_number} - ${v.brand || ""} ${v.model || ""}`, label: "الفحص الفني", date: v.inspection_expiry });
  });
  return out.filter((a) => {
    const d = daysUntil(a.date);
    return d !== null && d <= 90;
  }).sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-slate-200 rounded-2xl" />)}
      </div>
    </div>
  );
}