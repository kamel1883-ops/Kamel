import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Briefcase, Building2, Wallet, Layers } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { formatCurrency } from "@/lib/hr";

export default function VacanciesReport() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "تقرير الوظائف الشاغرة",
    subtitle: "حصر الوظائف المفتوحة مع عدد الشواغر والراتب لكل شاغر وإجمالي تكلفة التوظيف المتوقعة.",
    loading: "جارٍ التحميل...",
    empty: "لا توجد وظائف شاغرة مفتوحة حالياً ✅",
    openPos: "وظائف مفتوحة", totalVac: "إجمالي الشواغر", totalCost: "إجمالي تكلفة التوظيف الشهرية",
    title2: "المسمى الوظيفي", dept: "الإدارة", prof: "المهنة", grade: "الدرجة",
    type: "نوع الوظيفة", natReq: "المطلوب", vacCount: "عدد الشواغر", salary: "الراتب للشاغر",
    cost: "إجمالي التكلفة", na: "—",
    typeL: { full_time: "دوام كامل", part_time: "جزئي", contract: "عقد" },
    natL: { any: "الجميع", saudi: "سعودي", resident: "مقيم" },
  } : {
    title: "Vacant Positions Report",
    subtitle: "Open jobs with vacancy counts, salary per vacancy and total expected hiring cost.",
    loading: "Loading...",
    empty: "No open vacancies at the moment ✅",
    openPos: "Open positions", totalVac: "Total vacancies", totalCost: "Total monthly hiring cost",
    title2: "Job title", dept: "Department", prof: "Profession", grade: "Grade",
    type: "Type", natReq: "Required", vacCount: "Vacancies", salary: "Salary/vacancy",
    cost: "Total cost", na: "—",
    typeL: { full_time: "Full-time", part_time: "Part-time", contract: "Contract" },
    natL: { any: "Any", saudi: "Saudi", resident: "Resident" },
  };

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await base44.entities.Job.list("-created_date", 2000);
      setJobs(all.filter((j) => j.status === "open"));
      setLoading(false);
    })();
  }, []);

  const totalVac = jobs.reduce((s, j) => s + (Number(j.vacancy_count) || 0), 0);
  const totalCost = jobs.reduce((s, j) => s + (Number(j.vacancy_count) || 0) * (Number(j.salary) || 0), 0);

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="mt-8">
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <Briefcase size={40} className="mx-auto text-emerald-400 mb-3" />
          <p className="text-muted-foreground">{t.empty}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center"><Briefcase size={20} className="text-violet-600" /></div>
              <div><div className="text-xs text-muted-foreground">{t.openPos}</div><div className="text-lg font-bold">{jobs.length}</div></div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Layers size={20} className="text-blue-600" /></div>
              <div><div className="text-xs text-muted-foreground">{t.totalVac}</div><div className="text-lg font-bold text-blue-600">{totalVac}</div></div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Wallet size={20} className="text-emerald-600" /></div>
              <div><div className="text-xs text-muted-foreground">{t.totalCost}</div><div className="text-lg font-bold text-emerald-600">{formatCurrency(totalCost)}</div></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-muted-foreground text-xs">
                  <tr>
                    <th className="text-right px-4 py-3 font-medium">{t.title2}</th>
                    <th className="text-right px-3 py-3 font-medium">{t.dept}</th>
                    <th className="text-right px-3 py-3 font-medium">{t.prof}</th>
                    <th className="text-right px-3 py-3 font-medium">{t.grade}</th>
                    <th className="text-right px-3 py-3 font-medium">{t.type}</th>
                    <th className="text-right px-3 py-3 font-medium">{t.natReq}</th>
                    <th className="text-right px-3 py-3 font-medium">{t.vacCount}</th>
                    <th className="text-right px-3 py-3 font-medium">{t.salary}</th>
                    <th className="text-right px-3 py-3 font-medium">{t.cost}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((j) => {
                    const vac = Number(j.vacancy_count) || 0;
                    const sal = Number(j.salary) || 0;
                    const cost = vac * sal;
                    return (
                      <tr key={j.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium">{j.title}</td>
                        <td className="px-3 py-2 text-xs">{j.department || t.na}</td>
                        <td className="px-3 py-2 text-xs">{j.profession || t.na}</td>
                        <td className="px-3 py-2 text-xs">{j.grade || t.na}</td>
                        <td className="px-3 py-2 text-xs">{t.typeL[j.job_type] || t.na}</td>
                        <td className="px-3 py-2 text-xs">{t.natL[j.nationality_req] || t.na}</td>
                        <td className="px-3 py-2 font-semibold tabular-nums text-blue-600">{vac}</td>
                        <td className="px-3 py-2 tabular-nums">{formatCurrency(sal)}</td>
                        <td className="px-3 py-2 font-semibold tabular-nums text-emerald-600">{formatCurrency(cost)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold">
                  <tr>
                    <td className="px-4 py-3" colSpan={6}>{t.totalVac}: {totalVac}</td>
                    <td className="px-3 py-3 text-blue-600 tabular-nums">{totalVac}</td>
                    <td className="px-3 py-3"></td>
                    <td className="px-3 py-3 text-emerald-600 tabular-nums">{formatCurrency(totalCost)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}