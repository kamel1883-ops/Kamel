import React, { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { GOV_INTEGRATIONS, STATUS_META } from "@/lib/govIntegrations";
import { Building2, ShieldCheck, Zap, PlugZap, KeyRound, Info } from "lucide-react";

export default function GovIntegrations() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");

  const t = isAr ? {
    title: "خارطة الربط الحكومي الذكي",
    subtitle: "كل جهة حكومية وغرض الربط وأين تُستخرج بيانات اعتمادها — بانتظار اتفاقيات/API رسمية للتفعيل التلقائي تماماً",
    search: "ابحث عن جهة أو غرض...",
    allGroups: "كل الجهات",
    thEntity: "الجهة الحكومية",
    thPurpose: "غرض الربط",
    thSource: "المنصة المصدر",
    thCreds: "بيانات الاعتماد المطلوبة",
    thStatus: "حالة الربط",
    thActions: "أعمال الأتمتة",
    count: "جهة",
    unfulfilled: "بانتظار اعتماد رسمي مع كل جهة حكومية — عند تزويد بيانات الاعتماد يتم تفعيل الربط الآلي ونزول الأزرار (تحديث/إرسال) في أماكنها تلقائياً.",
    unfulfilledTitle: "اعتمادات معلّقة",
    readyHint: "كل الربط سيكون آلياً 100% بمجرد تسليم الاعتمادات — لا تدخّل يدوي.",
  } : {
    title: "Smart Government Integrations Roadmap",
    subtitle: "Each government entity, its integration purpose and where its credentials come from — awaiting official agreements for full automation.",
    search: "Search entity or purpose...",
    allGroups: "All entities",
    thEntity: "Entity",
    thPurpose: "Purpose",
    thSource: "Source platform",
    thCreds: "Credentials required",
    thStatus: "Status",
    thActions: "Automation actions",
    count: "entities",
    unfulfilled: "Pending official accreditation with each government entity — once credentials are provided, automation activates and action buttons appear in their places.",
    unfulfilledTitle: "Pending accreditations",
    readyHint: "100% automation once credentials are delivered — no manual steps.",
  };

  const groups = useMemo(() => {
    const set = Array.from(new Set(GOV_INTEGRATIONS.map((g) => g.group)));
    return set;
  }, []);

  const filtered = useMemo(() => {
    return GOV_INTEGRATIONS.filter((g) => {
      if (group !== "all" && g.group !== group) return false;
      if (!q.trim()) return true;
      const needle = q.trim();
      const hay = [g.entity.ar, g.entity.en, g.authority.ar, g.purpose.ar, g.purpose.en, g.key].join(" ");
      return hay.includes(needle);
    });
  }, [q, group]);

  const pendingCount = GOV_INTEGRATIONS.filter((g) => g.status === "pending").length;

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {/* Status banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 mb-6 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><KeyRound size={20} /></div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-amber-900 flex items-center gap-2">
            {t.unfulfilledTitle}
            <span className="text-xs font-mono bg-amber-200/70 text-amber-800 px-2 py-0.5 rounded-full">{pendingCount} {t.count}</span>
          </div>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">{t.unfulfilled}</p>
          <p className="text-[11px] text-emerald-700 mt-2 font-medium flex items-center gap-1"><Zap size={13} /> {t.readyHint}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.search}
          className="flex-1 h-10 rounded-lg border border-input bg-white px-3 text-sm"
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="h-10 rounded-lg border border-input bg-white px-3 text-sm min-w-[180px]"
        >
          <option value="all">{t.allGroups}</option>
          {groups.map((g) => (<option key={g} value={g}>{g}</option>))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70 text-muted-foreground">
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase">{t.thEntity}</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase">{t.thPurpose}</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase">{t.thSource}</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase">{t.thCreds}</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase">{t.thActions}</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase">{t.thStatus}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => {
                const st = STATUS_META[g.status] || STATUS_META.pending;
                return (
                  <tr key={g.key} className="border-t border-border/70 hover:bg-slate-50/50 transition-colors">
                    {/* Entity */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                          <Building2 size={17} />
                        </div>
                        <div className="leading-tight">
                          <div className="font-semibold text-foreground">{isAr ? g.entity.ar : g.entity.en}</div>
                          <div className="text-[11px] text-muted-foreground">{isAr ? g.authority.ar : g.authority.en}</div>
                        </div>
                      </div>
                    </td>
                    {/* Purpose */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-1.5">
                        <PlugZap size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="leading-relaxed text-foreground/90">{isAr ? g.purpose.ar : g.purpose.en}</span>
                      </div>
                    </td>
                    {/* Source platform */}
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                        <ShieldCheck size={12} className="text-slate-500" />
                        {isAr ? g.authority.ar : g.authority.en}
                      </span>
                    </td>
                    {/* Credentials needed */}
                    <td className="px-4 py-3 align-top max-w-[280px]">
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] text-slate-700 leading-relaxed flex items-start gap-1.5">
                        <KeyRound size={12} className="text-amber-600 mt-0.5 shrink-0" />
                        <span>{isAr ? g.needed.ar : g.needed.en}</span>
                      </div>
                    </td>
                    {/* Automation actions */}
                    <td className="px-4 py-3 align-top">
                      <ul className="space-y-1">
                        {g.autoActions.map((a, i) => (
                          <li key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0"></span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3 align-top">
                      <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border", st.cls)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)}></span>
                        {isAr ? st.ar : st.en}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    <Info size={18} className="inline ml-1.5" /> {t.search}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        <span className="font-semibold">{filtered.length}</span> {t.count}
      </div>
    </div>
  );
}