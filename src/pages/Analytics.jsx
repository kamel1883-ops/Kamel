import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { BarChart3, Users, TrendingUp, TrendingDown, Clock, Building2, Award, Shield, Puzzle, Briefcase, Wallet, Heart, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  headcountByDept, saudizationStats, genderSplit, statusSplit,
  tenureDistribution, avgSalaryByDept, attendanceRate, avgPerformanceByDept, CHART_PALETTE,
  turnoverWindow, exitReasonsBreakdown, avgTenureAtExit, exitSatisfaction, highRiskDepartments,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/hr";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import ReportsPanel from "@/components/ReportsPanel";

const PERIODS = [
  { key: "year", months: 12 },
  { key: "half", months: 6 },
  { key: "quarter", months: 3 },
];

export default function Analytics() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "تحليلات الموارد البشرية", subtitle: "مؤشرات قياسية عميقة لاتخاذ قرارات قائمة على البيانات",
    loading: "جارٍ تحميل التحليلات...",
    sHeadcount: "إجمالي القوى العاملة", sSaudization: "نسبة التوطين", sTurnover: "معدل الدوران", sAtt: "معدل الحضور",
    period: "الفترة:", yearL: "سنوي", halfL: "نصف سنوي", quarterL: "ربع سنوي",
    hires: "تعيينات", exits: "مغادرات", activeNow: "على رأس العمل", retention: "معدل الاحتفاظ", tenureExit: "متوسط خدمة المغادر (يوم)", riskDept: "إدارات عالية المخاطر",
    dept: "توزيع القوى العاملة حسب الإدارة", saudi: "التوطين (سعوديون / مقيمون)", saudiL: "سعوديون", expatL: "مقيمون",
    gender: "التوزيع حسب الجنس", status: "توزيع الحالات الوظيفية", tenure: "توزيع مدة الخدمة",
    salary: "متوسط الراتب حسب الإدارة", perf: "متوسط الأداء حسب الإدارة (من 5)",
    turnByDept: "معدل الدوران حسب الإدارة (%)", retByDept: "معدل الاستبقاء حسب الإدارة (%)", exitReasons: "أسباب المغادرة", exitSat: "متوسط رضا المغادرين عند الخروج",
    stratsH: "توصيات لخفض معدل الدوران", satSal: "الراتب", satBen: "المزايا", satEnv: "البيئة", satMng: "الإدارة", recommend: "توصية بالعمل",
    deepKpis: "مؤشرات قرار متقدمة", avgPerf: "متوسط الأداء", saudiRatio: "نسبة التوطين", payrollCost: "تكلفة الرواتب الشهرية",
  } : {
    title: "HR analytics", subtitle: "Deep KPIs for data-driven decisions",
    loading: "Loading analytics...",
    sHeadcount: "Total workforce", sSaudization: "Saudization rate", sTurnover: "Turnover rate", sAtt: "Attendance rate",
    period: "Period:", yearL: "Annual", halfL: "Semi-annual", quarterL: "Quarterly",
    hires: "Hires", exits: "Exits", activeNow: "Active", retention: "Retention rate", tenureExit: "Avg tenure at exit (days)", riskDept: "High-risk departments",
    dept: "Headcount by department", saudi: "Saudization (Saudis / Expats)", saudiL: "Saudis", expatL: "Expats",
    gender: "By gender", status: "Employment status", tenure: "Tenure distribution",
    salary: "Avg salary by department", perf: "Avg performance by department (of 5)",
    turnByDept: "Turnover rate by department (%)", retByDept: "Retention rate by department (%)", exitReasons: "Exit reasons", exitSat: "Average exit satisfaction",
    stratsH: "Turnover reduction recommendations", satSal: "Salary", satBen: "Benefits", satEnv: "Environment", satMng: "Management", recommend: "Would recommend",
    deepKpis: "Advanced decision KPIs", avgPerf: "Avg performance", saudiRatio: "Saudization", payrollCost: "Monthly payroll cost",
  };
  const rL = (k) => isAr ? ({ salary:"الراتب", benefits:"المزايا", work_environment:"بيئة العمل", management:"الإدارة", career_growth:"النمو الوظيفي", work_life_balance:"التوازن", relocation:"انتقال", personal:"شخصي", company_culture:"الثقافة", other:"أخرى", resignation:"استقالة", employer_termination:"إنهاء", end_of_contract:"انتهاء العقد", dismissal_for_cause:"فصل", force_majeure:"قوة قاهرة", none:"—" }[k] || k) : ({ salary:"Salary", benefits:"Benefits", work_environment:"Work environment", management:"Management", career_growth:"Career growth", work_life_balance:"Work-life balance", relocation:"Relocation", personal:"Personal", company_culture:"Company culture", other:"Other", resignation:"Resignation", employer_termination:"Termination", end_of_contract:"End of contract", dismissal_for_cause:"Dismissal", force_majeure:"Force majeure", none:"—" }[k] || k);

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [exits, setExits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodKey, setPeriodKey] = useState("year");

  const load = async () => {
    setLoading(true);
    const [e, a, r, x] = await Promise.all([
      base44.entities.Employee.list("-created_date", 1000),
      base44.entities.Attendance.list("-created_date", 1000),
      base44.entities.Performance.list("-created_date", 1000),
      base44.entities.ExitInterview.list("-interview_date", 1000),
    ]);
    setEmployees(e); setAttendance(a); setReviews(r); setExits(x); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="p-10 text-center text-muted-foreground" dir={isAr ? "rtl" : "ltr"}>{t.loading}</div>;

  const months = PERIODS.find((p) => p.key === periodKey).months;
  const headcount = employees.length;
  const saudi = saudizationStats(employees);
  const turn = turnoverWindow(employees, months);
  const attRate = attendanceRate(attendance);
  const deptData = headcountByDept(employees);
  const genderData = genderSplit(employees);
  const statusData = statusSplit(employees);
  const tenureData = tenureDistribution(employees);
  const salaryData = avgSalaryByDept(employees);
  const perfData = avgPerformanceByDept(reviews);
  const exitReasons = exitReasonsBreakdown(employees, exits);
  const sat = exitSatisfaction(exits);
  const riskDepts = highRiskDepartments(employees, months);
  const tenureExit = avgTenureAtExit(employees);
  const maxReason = Math.max(1, ...exitReasons.map((r) => r.value));
  const payrollCost = employees.filter((e) => e.status === "active" || e.status === "on_leave").reduce((s, e) => s + (Number(e.base_salary)||0)+(Number(e.housing_allowance)||0)+(Number(e.transport_allowance)||0)+(Number(e.other_allowances)||0), 0);
  const avgPerf = reviews.length ? Math.round((reviews.reduce((s, r) => s + (Number(r.overall_rating)||0), 0) / reviews.length) * 100) / 100 : 0;

  // توصيات خفض الدوران مبنية على البيانات
  const strats = [];
  if (turn.turnoverRate > 0) {
    strats.push({ icon: TrendingDown, sev: turn.turnoverRate > 15 ? "high" : turn.turnoverRate > 8 ? "med" : "low",
      text: isAr ? `معدل الدوران الحالي ${turn.turnoverRate}% خلال الفترة — ${turn.turnoverRate > 15 ? "مرتفع جداً ويتطلب تدخلاً عاجلاً" : turn.turnoverRate > 8 ? "مرتفع نسبياً" : "ضمن الحدود المقبولة"}.` : `Current turnover is ${turn.turnoverRate}% — ${turn.turnoverRate > 15 ? "very high, urgent action needed" : turn.turnoverRate > 8 ? "relatively high" : "within acceptable range"}.` });
  }
  const topReason = exitReasons[0];
  if (topReason) {
    const reasonStrats = {
      salary: { ar: "وظّف هيكل رواتب تنافسي وراجع معدلات السوق (خاصة للمسميات الحرجة).", en: "Benchmark salaries against the market and review compensation for critical roles." },
      benefits: { ar: "طوّر حزمة المزايا (تأمين، بدلات، مكافآت، تذاكر).", en: "Enhance the benefits package (insurance, allowances, bonuses, tickets)." },
      work_environment: { ar: "حسّن بيئة العمل ومرفقاتها وقلّل من مصادر الإزعاج.", en: "Improve workplace conditions, facilities and reduce friction." },
      management: { ar: "درّب القادة والمديرين على إدارة الفرق وإعطاء التغذية الراجعة.", en: "Train managers on leadership, feedback and team management." },
      career_growth: { ar: "اعرض مسارات ترقية وخطط تطوير واضحة لكل مستوى وظيفي.", en: "Define clear promotion paths and development plans per job level." },
      work_life_balance: { ar: "وفّر مرونة في الدوام والقدرة على العمل عن بُعد عند الإمكان.", en: "Offer flexible hours and remote-work options where feasible." },
      company_culture: { ar: "اعمل على تعزيز الثقافة التنظيمية والاندماج بين الموظفين.", en: "Strengthen company culture and team integration." },
      relocation: { ar: "اعرض بدل انتقال أو خيار عمل عن بُعد لمن يضطر للانتقال.", en: "Offer relocation allowance or remote options for relocating staff." },
      personal: { ar: "حسّن تجربة الموظف ودوّر لقاءات تقدمية لرصد الحالات المبكرة.", en: "Improve employee experience and run regular 1:1 check-ins." },
      other: { ar: "عمّق مقابلات المغادرة لفهم الأسباب الدقيقة.", en: "Deepen exit interviews to capture precise reasons." },
    }[topReason.name] || { ar: "", en: "" };
    if (reasonStrats.ar) strats.push({ icon: Wallet, sev: "med", text: isAr ? `السبب الأبرز للمغادرة: ${rL(topReason.name)} — ${reasonStrats.ar}` : `Top exit reason: ${rL(topReason.name)} — ${reasonStrats.en}` });
  }
  riskDepts.filter((d) => d.rate >= 25).slice(0, 2).forEach((d) => {
    strats.push({ icon: Building2, sev: "high", text: isAr ? `إدارة «${d.name}» بمعدل دوران ${d.rate}% — افحص ظروفها الإدارية والقيادية فوراً.` : `Department "${d.name}" has ${d.rate}% turnover — investigate its leadership and conditions.` });
  });
  if (sat.overall > 0 && sat.overall < 3) {
    strats.push({ icon: Heart, sev: "med", text: isAr ? `متوسط رضا المغادرين منخفض (${sat.overall}/5) — راجع تجربة الموظف وفقده الأقل من 3.` : `Exiting employees' satisfaction is low (${sat.overall}/5) — review the experience items scoring under 3.` });
  }
  if (strats.length === 0) strats.push({ icon: TrendingUp, sev: "low", text: isAr ? "لا توجد مؤشرات سلبية واضحة — استمر في رصد المؤشرات دورياً." : "No major negative signals — keep monitoring KPIs periodically." });
  const sevCls = { high: "bg-rose-50 text-rose-700 border-rose-200", med: "bg-amber-50 text-amber-700 border-amber-200", low: "bg-emerald-50 text-emerald-700 border-emerald-200" };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard icon={Users} label={t.sHeadcount} value={headcount} tint="blue" />
        <StatCard icon={TrendingUp} label={t.retention} value={`${turn.retentionRate}%`} tint="green" />
        <StatCard icon={TrendingDown} label={t.sTurnover} value={`${turn.turnoverRate}%`} tint="rose" />
        <StatCard icon={Clock} label={t.sAtt} value={`${attRate}%`} tint="amber" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm text-muted-foreground">{t.period}</span>
        <div className="inline-flex rounded-lg border border-border bg-white overflow-hidden">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriodKey(p.key)} className={cn("px-3 py-1.5 text-sm font-medium transition", periodKey === p.key ? "bg-slate-800 text-white" : "text-muted-foreground hover:bg-slate-50")}>
              {p.key === "year" ? t.yearL : p.key === "half" ? t.halfL : t.quarterL}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{t.hires}: {turn.hires} · {t.exits}: {turn.exits} · {t.activeNow}: {turn.activeNow} · {t.retention}: {turn.retentionRate}%</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KPICard icon={Building2} label={t.sSaudiRatio} value={`${saudi.rate}%`} />
        <KPICard icon={Clock} label={t.tenureExit} value={tenureExit} />
        <KPICard icon={AlertTriangle} label={t.riskDept} value={riskDepts.length} />
        <KPICard icon={Wallet} label={t.payrollCost} value={formatCurrency(payrollCost)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title={t.turnByDept}>
          {riskDepts.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskDepts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]}>{riskDepts.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title={t.exitReasons}>
          {exitReasons.length ? (
            <div className="space-y-2 pt-1">
              {exitReasons.slice(0, 8).map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <span className="text-xs w-28 shrink-0 truncate">{rL(r.name)}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded-lg overflow-hidden"><div className="h-full bg-rose-400" style={{ width: `${(r.value / maxReason) * 100}%` }} /></div>
                  <span className="text-xs font-bold w-6 text-end">{r.value}</span>
                </div>
              ))}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                <SatMini label={t.satSal} v={sat.salary} />
                <SatMini label={t.satBen} v={sat.benefits} />
                <SatMini label={t.satEnv} v={sat.environment} />
                <SatMini label={t.satMng} v={sat.management} />
                <SatMini label={t.recommend} v={sat.recommend} />
              </div>
            </div>
          ) : <EmptyChart />}
        </ChartCard>

        <div className="bg-white rounded-2xl border border-border p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Puzzle size={16} className="text-violet-600" /> {t.stratsH}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {strats.map((s, i) => (
              <div key={i} className={cn("flex items-start gap-3 rounded-xl border p-3 text-sm", sevCls[s.sev])}>
                <s.icon size={18} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title={t.retByDept}>
          {riskDepts.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={riskDepts.map((d) => ({ name: d.name, retention: Math.max(0, 100 - d.rate) }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="retention" radius={[6, 6, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title={t.dept}>
          <ResponsiveContainer width="100%" height={260}>
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
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={[{ name: t.saudiL, value: saudi.saudi }, { name: t.expatL, value: saudi.expat }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                <Cell fill="#10b981" /><Cell fill="#4f46e5" />
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t.tenure}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tenureData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t.salary}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={salaryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={70} interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#10b998" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t.gender}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                {genderData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t.status}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                {statusData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {perfData.length > 0 && (
          <ChartCard title={t.perf}>
            <ResponsiveContainer width="100%" height={260}>
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

      <ReportsPanel employees={employees} attendance={attendance} />
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
function KPICard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0"><Icon size={20} /></div>
      <div className="min-w-0"><div className="text-xs text-muted-foreground truncate">{label}</div><div className="text-lg font-bold truncate">{value}</div></div>
    </div>
  );
}
function SatMini({ label, v }) { return <div className="rounded-lg bg-slate-50 p-2 text-center"><div className="text-[10px] text-muted-foreground truncate">{label}</div><div className="text-sm font-bold">{v || "—"}/5</div></div>; }
function EmptyChart() { return <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">—</div>; }