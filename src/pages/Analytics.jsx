import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { BarChart3, Users, TrendingUp, TrendingDown, Clock, Building2, Award } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  headcountByDept, saudizationStats, genderSplit, statusSplit, turnoverStats,
  tenureDistribution, avgSalaryByDept, attendanceRate, avgPerformanceByDept, CHART_PALETTE,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/hr";
import { useI18n } from "@/lib/i18n";

export default function Analytics() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "تحليلات الموارد البشرية", subtitle: "مؤشرات بصرية حية للقوى العاملة ومعدلات الدوران",
    loading: "جارٍ تحميل التحليلات...",
    sHeadcount: "إجمالي القوى العاملة", sSaudization: "نسبة السعودة", sTurnover: "معدل الدوران", sAtt: "معدل الحضور",
    yearL: "سنة تحليل الدوران:", hires: "تعيينات", exits: "مغادرات", activeNow: "على رأس العمل",
    dept: "توزيع القوى العاملة حسب الإدارة", saudi: "السعودة (سعوديون / مقيمون)", saudiL: "سعوديون", expatL: "مقيمون",
    gender: "التوزيع حسب الجنس", status: "توزيع الحالات الوظيفية", tenure: "توزيع مدة الخدمة",
    salary: "متوسط الراتب حسب الإدارة", perf: "متوسط الأداء حسب الإدارة (من 5)",
  } : {
    title: "HR analytics", subtitle: "Live visual KPIs for the workforce and turnover rates",
    loading: "Loading analytics...",
    sHeadcount: "Total workforce", sSaudization: "Saudization rate", sTurnover: "Turnover rate", sAtt: "Attendance rate",
    yearL: "Turnover analysis year:", hires: "Hires", exits: "Exits", activeNow: "Active",
    dept: "Headcount by department", saudi: "Saudization (Saudis / Expats)", saudiL: "Saudis", expatL: "Expats",
    gender: "By gender", status: "Employment status", tenure: "Tenure distribution",
    salary: "Avg salary by department", perf: "Avg performance by department (of 5)",
  };

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const load = async () => {
    setLoading(true);
    const [e, a, r] = await Promise.all([
      base44.entities.Employee.list("-created_date", 1000),
      base44.entities.Attendance.list("-created_date", 1000),
      base44.entities.Performance.list("-created_date", 1000),
    ]);
    setEmployees(e); setAttendance(a); setReviews(r); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="p-10 text-center text-muted-foreground" dir={isAr ? "rtl" : "ltr"}>{t.loading}</div>;

  const headcount = employees.length;
  const saudi = saudizationStats(employees);
  const turnover = turnoverStats(employees, year);
  const attRate = attendanceRate(attendance);
  const deptData = headcountByDept(employees);
  const genderData = genderSplit(employees);
  const statusData = statusSplit(employees);
  const tenureData = tenureDistribution(employees);
  const salaryData = avgSalaryByDept(employees);
  const perfData = avgPerformanceByDept(reviews);

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label={t.sHeadcount} value={headcount} tint="blue" />
        <StatCard icon={Building2} label={t.sSaudization} value={`${saudi.rate}%`} tint="green" />
        <StatCard icon={TrendingDown} label={t.sTurnover} value={`${turnover.turnoverRate}%`} tint="rose" />
        <StatCard icon={Clock} label={t.sAtt} value={`${attRate}%`} tint="amber" />
      </div>

      <div className="mb-5 flex items-center gap-3">
        <label className="text-sm text-muted-foreground">{t.yearL}</label>
        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28 px-3 py-1.5 text-sm border border-border rounded-lg bg-white" />
        <span className="text-xs text-muted-foreground">{t.hires}: {turnover.hires} • {t.exits}: {turnover.exits} • {t.activeNow}: {turnover.activeNow}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title={t.dept}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={70} interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>{deptData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t.saudi}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={[{ name: t.saudiL, value: saudi.saudi }, { name: t.expatL, value: saudi.expat }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                <Cell fill="#10b981" /><Cell fill="#4f46e5" />
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t.gender}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {genderData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t.status}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {statusData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t.tenure}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={tenureData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t.salary}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salaryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={70} interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {perfData.length > 0 && (
          <ChartCard title={t.perf}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={perfData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={70} interval={0} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} /><Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-slate-400" /> {title}</h3>
      {children}
    </div>
  );
}