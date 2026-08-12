import React, { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/hr";
import { platformMeta, expiryStatus, statusBadgeOf } from "@/lib/platforms";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CHART_PALETTE } from "@/lib/analytics";

function Card({ title, children }) {
  return (<div className="bg-white rounded-2xl border border-border p-5 mb-5"><h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-slate-400" /> {title}</h3>{children}</div>);
}
function NoRows({ text }) { return <div className="p-8 text-center text-muted-foreground text-sm">{text}</div>; }
function Empty() { return <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">—</div>; }

export default function PlatformSubscriptionsReport({ records, t }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const rows = useMemo(() => records
    .map((r) => ({ r, d: r.not_applicable ? null : (r.expiry_date ? daysUntilLocal(r.expiry_date) : null) }))
    .sort((a, b) => {
      if (a.r.not_applicable) return 1;
      if (b.r.not_applicable) return -1;
      if (a.d == null) return 1;
      if (b.d == null) return -1;
      return a.d - b.d;
    }), [records]);

  const counts = useMemo(() => {
    const c = { active: 0, expiring_soon: 0, expired: 0, not_applicable: 0 };
    records.forEach((r) => {
      if (!r || !r.platform_key) return;
      if (r.not_applicable) { c.not_applicable++; return; }
      const s = expiryStatus(r.expiry_date, r.not_applicable);
      if (c[s] !== undefined) c[s]++;
    });
    return c;
  }, [records]);

  const totalCost = useMemo(() => records.reduce((s, r) => s + (Number(r.annual_cost) || 0), 0), [records]);

  const costByPlatform = useMemo(() => {
    const m = {};
    records.forEach((r) => {
      if (r.not_applicable) return;
      const label = r.platform_key === "other" ? (r.custom_label || platformMeta("other").label) : platformMeta(r.platform_key).label;
      m[label] = (m[label] || 0) + (Number(r.annual_cost) || 0);
    });
    return Object.entries(m).map(([name, value]) => ({ name, value })).filter((x) => x.value > 0);
  }, [records]);

  const labelOf = (r) => r.platform_key === "other" ? (r.custom_label || platformMeta("other").label) : platformMeta(r.platform_key).label;
  const noRecords = records.length === 0;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Mini label={t.sActive || (isAr ? "سارية" : "Active")} value={counts.active} cls="text-emerald-600" />
        <Mini label={t.sSoon || (isAr ? "قاربت الانتهاء" : "Expiring soon")} value={counts.expiring_soon} cls="text-amber-600" />
        <Mini label={t.sExpired || (isAr ? "منتهية" : "Expired")} value={counts.expired} cls="text-rose-600" />
        <Mini label={t.platTotalCost} value={formatCurrency(totalCost)} cls="text-violet-700" />
      </div>

      <Card title={t.platCostByPlatform}>
        {costByPlatform.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={costByPlatform} layout="vertical" margin={{ top: 10, right: 10, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>{costByPlatform.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty />}
      </Card>

      <Card title={t.rPlatforms}>
        {rows.length ? (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="text-xs text-muted-foreground">
              <th className="text-right pb-2 font-medium">{t.platPlatform}</th>
              <th className="text-right pb-2 font-medium">{t.platAccount}</th>
              <th className="text-right pb-2 font-medium">{t.platStart}</th>
              <th className="text-right pb-2 font-medium">{t.platExpiry}</th>
              <th className="text-right pb-2 font-medium">{t.platCost}</th>
              <th className="text-right pb-2 font-medium">{t.platStatus}</th>
              <th className="text-left pb-2 font-medium">{t.platRemaining}</th>
            </tr></thead>
            <tbody>{rows.map(({ r, d }) => {
              const status = r.not_applicable ? "not_applicable" : expiryStatus(r.expiry_date, false);
              const bd = statusBadgeOf(status);
              return (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-2 font-medium">{labelOf(r)}</td>
                  <td className="py-2">{r.account_id || "—"}</td>
                  <td className="py-2">{r.start_date || "—"}</td>
                  <td className="py-2">{r.not_applicable ? t.platNA : (r.expiry_date || "—")}</td>
                  <td className="py-2">{r.annual_cost ? formatCurrency(r.annual_cost) : "—"}</td>
                  <td className="py-2"><span className={cn("text-xs px-2 py-0.5 rounded-full", bd.cls)}>{bd.label}</span></td>
                  <td className="py-2">{r.not_applicable ? <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{t.platNA}</span> : (d == null ? "—" : <span className={cn("text-xs px-2 py-0.5 rounded-full", d < 0 ? "bg-rose-100 text-rose-700" : d <= 30 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{d} {isAr ? "يوم" : "days"}</span>)}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
        ) : <NoRows text={t.noData} />}
      </Card>
    </div>
  );
}

function Mini({ label, value, cls }) {
  return (<div className="bg-white rounded-2xl border border-border p-4"><div className="text-xs text-muted-foreground">{label}</div><div className={cn("text-xl font-bold mt-1", cls)}>{value}</div></div>);
}

const daysUntilLocal = (d) => { if (!d) return null; const t = new Date(d).getTime(); if (isNaN(t)) return null; return Math.ceil((t - Date.now()) / 86400000); };