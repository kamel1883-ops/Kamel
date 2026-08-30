import React, { useState } from "react";
import { Calculator } from "lucide-react";

// حاسبة عمولة الشركاء — 7% من أول اشتراك فقط (مرة واحدة لكل عميل)
export default function CommissionCalculator({ isAr }) {
  const [clients, setClients] = useState(10);
  const [avg, setAvg] = useState(2500);
  const rate = 0.07;
  const perClient = Math.round(avg * rate);
  const total = perClient * clients;
  const fmt = (n) => Number(n || 0).toLocaleString(isAr ? "ar-SA-u-nu-latn" : "en-US");

  return (
    <div className="bg-white border border-violet-100 rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-2">
        <Calculator size={18} className="text-violet-600" />
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          {isAr ? "حاسبة العمولات" : "Commission calculator"}
        </h2>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        {isAr
          ? "حدّد عدد العملاء الذين تُحيلهم ومتوسط قيمة أول اشتراك، لتعرف عمولتك التقديرية."
          : "Set the number of clients you refer and the average first-subscription value to see your estimated commission."}
      </p>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{isAr ? "عدد العملاء المُحالين" : "Referred clients"}</span>
            <span className="font-bold text-violet-700">{fmt(clients)}</span>
          </div>
          <input type="range" min={1} max={100} value={clients} onChange={(e) => setClients(Number(e.target.value))}
            className="w-full accent-violet-600" />
          <div className="flex justify-between text-[11px] text-muted-foreground/70 mt-1"><span>1</span><span>100</span></div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            {isAr ? "متوسط قيمة أول اشتراك (ريال)" : "Average first-subscription value (SAR)"}
          </label>
          <input type="number" min={0} value={avg} onChange={(e) => setAvg(Number(e.target.value))}
            className="w-full bg-violet-50/50 border border-violet-200 rounded-xl px-3.5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400/50" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 text-center">
            <div className="text-muted-foreground text-xs mb-1">{isAr ? "عمولتك لكل عميل (7% مرة واحدة)" : "Per client (7%, one time)"}</div>
            <div className="text-2xl font-extrabold text-violet-700">{fmt(perClient)} {isAr ? "ر.س" : "SAR"}</div>
          </div>
          <div className="bg-gradient-to-br from-violet-600 to-violet-800 border border-violet-300 rounded-2xl p-5 text-center">
            <div className="text-white/80 text-xs mb-1">{isAr ? "إجمالي عمولتك التقديرية" : "Estimated total commission"}</div>
            <div className="text-2xl font-extrabold text-white">{fmt(total)} {isAr ? "ر.س" : "SAR"}</div>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground/70 text-xs mt-5 leading-relaxed">
        {isAr
          ? "الأرقام تقديرية لأغراض التوضيح فقط. تُحتسب العمولة 7% من قيمة أول اشتراك مدفوع ومؤهل لكل عميل جديد، مرة واحدة فقط ولا تُستحق عن التجديد السنوي."
          : "Figures are estimates for illustration only. Commission is 7% of each new client's first qualified paid subscription, one time only, with no commission on annual renewals."}
      </p>
    </div>
  );
}