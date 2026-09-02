import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Loader2, Users, UserCheck, Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// التحليلات والتقارير في بوابة الموظف — للموظف المُفوّض بصلاحية «analytics».
// عرض إحصائيات م агрегاة من قاعدة البيانات (قراءة فقط عبر asServiceRole).
export default function PortalAnalyticsManager({ session, isAr = true }) {
  const args = { token: session.token, employee_id: session.employee_id };
  const [stats, setStats] = useState(null);
  const [preparer, setPreparer] = useState({ name: "", id: "" });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("portalData", { ...args, action: "analytics_stats" });
      const d = res?.data || res;
      if (d?.ok) { setStats(d.stats); setPreparer(d.preparer || { name: "", id: "" }); }
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const cards = [
    { icon: Users, label: isAr ? "إجمالي الموظفين" : "Employees", value: stats?.employees ?? 0, tint: "violet" },
    { icon: UserCheck, label: isAr ? "نشط" : "Active", value: stats?.active ?? 0, tint: "emerald" },
    { icon: Building2, label: isAr ? "الإدارات" : "Departments", value: stats?.departments ?? 0, tint: "blue" },
    { icon: Users, label: isAr ? "سعوديون" : "Saudi", value: stats?.saudi ?? 0, tint: "amber" },
    { icon: Users, label: isAr ? "مقيمون" : "Expat", value: stats?.expat ?? 0, tint: "slate" },
    { icon: BarChart, label: isAr ? "سجلات الحضور" : "Attendance", value: stats?.attendanceRecords ?? 0, tint: "violet" },
    { icon: BarChart, label: isAr ? "سجلات الرواتب" : "Payroll", value: stats?.payrollRecords ?? 0, tint: "blue" },
    { icon: BarChart, label: isAr ? "الإنذارات" : "Warnings", value: stats?.warnings ?? 0, tint: "rose" },
  ];
  const tintCls = { violet: "bg-violet-50 text-violet-700", emerald: "bg-emerald-50 text-emerald-700", blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", slate: "bg-slate-100 text-slate-700", rose: "bg-rose-50 text-rose-700" };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center gap-2 mb-1"><BarChart size={18} className="text-violet-600" /><h3 className="font-bold text-sm">{isAr ? "التحليلات والتقارير" : "Analytics & reports"}</h3></div>
        {preparer.name && <div className="text-[11px] text-violet-700 flex items-center gap-1.5"><ShieldCheck size={13} />{isAr ? `بيانات حية من قاعدة المنشأة — عرض فقط.` : `Live data — read only.`}</div>}
      </div>
      {loading ? <div className="p-16 text-center text-muted-foreground flex items-center justify-center gap-2 text-sm"><Loader2 className="animate-spin" size={16} />{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
      : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {cards.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2", tintCls[c.tint])}><c.icon size={18} /></div>
                <div className="text-2xl font-bold tabular-nums">{c.value}</div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
              </div>
            ))}
          </div>
          {stats?.byDept && Object.keys(stats.byDept).length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-4">
              <h4 className="font-semibold text-sm mb-3">{isAr ? "توزيع الموظفين حسب الإدارة" : "Employees by department"}</h4>
              <div className="space-y-2">
                {Object.entries(stats.byDept).sort((a, b) => b[1] - a[1]).map(([d, n]) => {
                  const pct = stats.employees ? Math.round((n / stats.employees) * 100) : 0;
                  return (
                    <div key={d}>
                      <div className="flex items-center justify-between text-xs mb-1"><span className="font-medium">{d}</span><span className="text-muted-foreground tabular-nums">{n} ({pct}%)</span></div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}