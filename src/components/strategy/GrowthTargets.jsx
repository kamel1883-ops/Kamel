import React from "react";
import { Users, Wallet, Rocket } from "lucide-react";
import { GROWTH } from "@/lib/strategyPlan";
import { PRICING_TIERS_AR, PRICING_TIERS_EN } from "@/lib/pricing";

export default function GrowthTargets({ isAr }) {
  const money = (n) => Number(n).toLocaleString("en-US") + (isAr ? " ر.س" : " SAR");
  const tiers = isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {GROWTH.years.map((y, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2">
              <Rocket size={16} className="text-amber-600" />
              <div className="font-semibold text-sm">{isAr ? y.ar : y.en}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-bold flex items-center gap-1"><Users size={16} className="text-muted-foreground" />{y.clients}</div>
                <div className="text-[11px] text-muted-foreground">{isAr ? "عميل مشترك" : "paying clients"}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700 flex items-center gap-1"><Wallet size={16} />{(y.revenue / 1000).toFixed(0)}K</div>
                <div className="text-[11px] text-muted-foreground">{isAr ? "إيراد متوقع" : "projected revenue"}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {isAr ? "طلبات تجربة مستهدفة: " : "Target trials: "}<span className="font-medium text-foreground">{y.trials}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{isAr ? y.focus.ar : y.focus.en}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-semibold text-sm mb-1">{isAr ? "تدرّج السنة الأولى (ربع سنوي)" : "Year-one quarterly ramp"}</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {isAr ? `الحساب على متوسط قيمة اشتراك ${money(GROWTH.avgValue)} سنوياً.` : `Based on an average annual subscription of ${money(GROWTH.avgValue)}.`}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-start p-3">{isAr ? "الفترة" : "Period"}</th>
                <th className="text-start p-3">{isAr ? "عملاء جدد" : "New clients"}</th>
                <th className="text-start p-3">{isAr ? "طلبات تجربة" : "Trials"}</th>
                <th className="text-start p-3">{isAr ? "إيراد الفترة" : "Period revenue"}</th>
              </tr>
            </thead>
            <tbody>
              {GROWTH.monthlyRamp.map((q, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-3 font-medium">{isAr ? q.ar : q.en}</td>
                  <td className="p-3">{q.clients}</td>
                  <td className="p-3">{q.trials}</td>
                  <td className="p-3 font-semibold text-emerald-700">{money(q.clients * GROWTH.avgValue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#0B2545] text-white">
                <td className="p-3 font-bold">{isAr ? "إجمالي السنة الأولى" : "Year-one total"}</td>
                <td className="p-3 font-bold">{GROWTH.monthlyRamp.reduce((s, q) => s + q.clients, 0)}</td>
                <td className="p-3 font-bold">{GROWTH.monthlyRamp.reduce((s, q) => s + q.trials, 0)}</td>
                <td className="p-3 font-bold">{money(GROWTH.monthlyRamp.reduce((s, q) => s + q.clients, 0) * GROWTH.avgValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-semibold text-sm mb-3">{isAr ? "الباقات وأسعارها — أساس مستهدف الإيراد" : "Pricing tiers — revenue basis"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {tiers.map((t) => (
            <div key={t.id} className="rounded-xl border border-border p-4">
              <div className="text-sm font-semibold">{t.tier}</div>
              <div className="text-[11px] text-muted-foreground">{t.range}</div>
              <div className="mt-2 text-lg font-bold" dir="ltr">{t.yearly.toLocaleString("en-US")}</div>
              <div className="text-[11px] text-muted-foreground">{isAr ? "ر.س سنوياً" : "SAR / year"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}