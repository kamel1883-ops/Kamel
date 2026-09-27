import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Globe2, Settings2, TrendingUp, AlertTriangle, ShieldCheck, Gauge as GaugeIcon } from "lucide-react";
import {
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, ReferenceLine, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { BAND_META, computeNitaqat, saudisNeededForSafe, activityByKey } from "@/lib/nitaqat";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const EMPTY = { saudis: 0, expats: 0, pct: 0, band: null, activity: null };

export default function Nitaqat() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "النطاقات (نسبة التوطين)", subtitle: "تقدير تقريبي لنطاق منشأتك في برنامج نطاقات بناءً على النشاط والعمالة النشطة",
    setActivity: "حدّد النشاط أولاً", setActivityNote: "لتحصل على نتائج حقيقية لنطاق منشأتك، اختر النشاط الصحيح من الإعدادات في ملف المنشأة.",
    goSettings: "فتح الإعدادات",
    saudis: "سعوديون نشطون", expats: "مقيمون نشطون", total: "إجمالي العمالة النشطة", pct: "نسبة التوطين",
    currentBand: "النطاق الحالي", approximate: "تقدير تقريبي — استرشاد فقط وليس قراراً نهائياً",
    bandsH: "نسب النطاقات لنشاطك", saudNeeded: "السعوديون المطلوبون للخروج من النطاق الخطر",
    benefits: "المزايا المتاحة في هذا النطاق", risks: "الإشكاليات والمخاطر",
    noBenefits: "لا توجد مزايا في هذا النطاق", noRisks: "لا توجد مخاطر تذكر في هذا النطاق",
    target: "نسبتك", greenLine: "حد الأخضر المنخفض",
  } : {
    title: "Nitaqat (Saudization)", subtitle: "An approximate estimate of your Nitaqat band based on activity and active workforce",
    setActivity: "Set the activity first", setActivityNote: "To get real Nitaqat results, pick the correct activity from your organization profile settings.",
    goSettings: "Open settings",
    saudis: "Active Saudis", expats: "Active expats", total: "Total active workforce", pct: "Saudization %",
    currentBand: "Current band", approximate: "Approximate estimate — guidance only, not a final decision",
    bandsH: "Nitaqat thresholds for your activity", saudNeeded: "Saudis needed to leave the danger band",
    benefits: "Benefits available in this band", risks: "Issues & risks",
    noBenefits: "No benefits in this band", noRisks: "No notable risks in this band",
    target: "Your rate", greenLine: "Low-green threshold",
  };

  const [org, setOrg] = useState(null);
  const [counts, setCounts] = useState({ saudis: 0, expats: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let activityKey = "other";
      try {
        const list = await base44.entities.Organization.list("-created_date", 1);
        if (list && list[0]) { setOrg(list[0]); activityKey = list[0].nitaqat_activity || "other"; }
      } catch (_) {}
      try {
        const emps = await base44.entities.Employee.list("-created_date", 1000);
        const active = emps.filter((e) => e.status !== "terminated" && e.status !== "resigned");
        setCounts({
          saudis: active.filter((e) => e.is_saudi).length,
          expats: active.filter((e) => !e.is_saudi).length,
        });
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-10 text-center text-muted-foreground">{t.subtitle}</div>;

  const activityKey = org?.nitaqat_activity || "other";
  const result = computeNitaqat(counts.saudis, counts.expats, activityKey);
  const noActivity = !org?.nitaqat_activity;
  const need = saudisNeededForSafe(result);

  const bandBars = [
    { name: isAr ? "أحمر" : "Red", from: 0, to: result.thresholds.red, color: BAND_META.red.color },
    { name: isAr ? "أصفر" : "Yellow", from: result.thresholds.red, to: result.thresholds.yellow, color: BAND_META.yellow.color },
    { name: isAr ? "أخضر منخفض" : "Low green", from: result.thresholds.yellow, to: result.thresholds.greenLow, color: BAND_META.green_low.color },
    { name: isAr ? "أخضر متوسط" : "Med green", from: result.thresholds.greenLow, to: result.thresholds.greenMed, color: BAND_META.green_medium.color },
    { name: isAr ? "أخضر مرتفع" : "High green", from: result.thresholds.greenMed, to: result.thresholds.greenHigh, color: BAND_META.green_high.color },
    { name: isAr ? "بلاتيني" : "Platinum", from: result.thresholds.greenHigh, to: 100, color: BAND_META.platinum.color },
  ].map((b) => ({ ...b, width: b.to - b.from }));

  const gaugeData = [{ name: t.pct, value: result.saudizationPct, fill: result.band.color }];

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {noActivity && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <Settings2 size={22} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-amber-800">{t.setActivity}</div>
            <div className="text-sm text-amber-700 mt-1">{t.setActivityNote}</div>
          </div>
          <Link to="/settings"><Button size="sm" variant="outline">{t.goSettings}</Button></Link>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
          <GaugeIcon size={14} /> {isAr ? "النشاط المعتمد" : "Selected activity"}: <b className="text-foreground">{isAr ? activityByKey(activityKey).ar : activityByKey(activityKey).en}</b>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Gauge */}
          <div className="flex flex-col items-center">
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: "#f1f5f9" }} dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="-mt-16 text-center">
              <div className="text-3xl font-extrabold tabular-nums" style={{ color: result.band.color }}>{result.saudizationPct}%</div>
              <div className="text-xs text-muted-foreground">{t.pct}</div>
            </div>
          </div>

          {/* Band badge */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">{t.currentBand}</div>
            <div
              className="inline-flex flex-col items-center justify-center w-40 h-40 rounded-3xl border-4"
              style={{ borderColor: result.band.ring, background: result.band.bg }}
            >
              <span className="text-2xl font-extrabold" style={{ color: result.band.color }}>
                {isAr ? result.band.ar : result.band.en}
              </span>
              <span className="text-[11px] mt-1 px-3 py-0.5 rounded-full font-semibold text-white" style={{ background: result.band.color }}>
                {result.band.tier === "safe" ? (isAr ? "آمن" : "Safe") : result.band.tier === "warning" ? (isAr ? "تحذير" : "Warning") : (isAr ? "خطر" : "Danger")}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox icon={UserCheck} label={t.saudis} value={counts.saudis} tint="text-emerald-700 bg-emerald-50" />
            <StatBox icon={Globe2} label={t.expats} value={counts.expats} tint="text-sky-700 bg-sky-50" />
            <StatBox icon={Users} label={t.total} value={result.total} tint="text-violet-700 bg-violet-50" />
            <StatBox icon={TrendingUp} label={t.pct} value={`${result.saudizationPct}%`} tint="text-amber-700 bg-amber-50" />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-4">⚠️ {t.approximate}</p>
      </div>

      {/* Thresholds bar */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-violet-600" /> {t.bandsH}</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bandBars} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={isAr ? 90 : 110} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v, n, p) => [`${p.payload.from}% — ${p.payload.to}%`, isAr ? "النسبة" : "Range"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="width" radius={[6, 6, 6, 6]} minPointSize={2}>
                {bandBars.map((b, i) => <Cell key={i} fill={b.color} />)}
              </Bar>
              <ReferenceLine x={result.saudizationPct} stroke="#7c3aed" strokeWidth={2} strokeDasharray="6 4"
                label={{ value: `${result.saudizationPct}%`, position: "top", fill: "#7c3aed", fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Implications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-emerald-700"><ShieldCheck size={18} /> {t.benefits}</h3>
          {result.band.benefits_ar.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noBenefits}</p>
          ) : (
            <ul className="space-y-2">
              {result.band.benefits_ar.map((b, i) => (
                <li key={i} className="text-sm flex gap-2 items-start"><span className="text-emerald-600 mt-0.5">✓</span><span>{b}</span></li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className={cn("font-semibold mb-3 flex items-center gap-2", result.band.tier === "danger" ? "text-rose-700" : "text-amber-700")}>
            <AlertTriangle size={18} /> {t.risks}
          </h3>
          {result.band.risks_ar.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noRisks}</p>
          ) : (
            <ul className="space-y-2">
              {result.band.risks_ar.map((r, i) => (
                <li key={i} className="text-sm flex gap-2 items-start"><span className={cn("mt-0.5", result.band.tier === "danger" ? "text-rose-600" : "text-amber-600")}>⚠</span><span>{r}</span></li>
              ))}
            </ul>
          )}
          {need > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800">
              {t.saudNeeded}: <b className="text-lg">{need}</b> {isAr ? "سعودي/سعودية إضافي" : "more Saudis"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, tint }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", tint)}><Icon size={20} /></div>
      <div><div className="text-xl font-bold tabular-nums">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
    </div>
  );
}