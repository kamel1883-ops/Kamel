import React from "react";
import { BarChart3, TrendingDown, UserCheck, CalendarCheck, FileBadge, Building2, ShieldAlert, Wallet, ShieldCheck, FileSignature } from "lucide-react";

const NAVY = "#0A1629";
const NAVY2 = "#0e1f3a";
const CYAN = "#00B8D4";
const GOLD = "#C9A961";

export default function ReportsAnalytics({ Section, Heading }) {
  const reports = [
    {
      icon: TrendingDown,
      label: "معدل الدوران",
      desc: "نسبة مغادرة الموظفين شهرياً",
      render: () => (
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <div className="flex items-end gap-1.5 h-24 mb-2">
            {[4.2, 3.1, 5.5, 2.8, 3.6, 4.9, 3.2].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${(h / 6) * 100}%`, background: h > 4.5 ? "#fbbf24" : CYAN, opacity: .85 }} />
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">المتوسط السنوي</span>
            <span className="font-extrabold" style={{ color: NAVY }}>3.9%</span>
          </div>
          <div className="text-[10px] text-amber-600 mt-1">تنبيه: ارتفاع في يونيو</div>
        </div>
      )
    },
    {
      icon: UserCheck,
      label: "معدل الاستبقاء",
      desc: "نسبة بقاء الموظفين بالمنشأة",
      render: () => (
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <div className="relative flex items-center justify-center h-24">
            <svg viewBox="0 0 100 100" className="w-24 h-24" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={CYAN} strokeWidth="10" strokeLinecap="round" strokeDasharray="263.9" strokeDashoffset="42" />
            </svg>
            <div className="absolute text-center">
              <div className="text-lg font-extrabold" style={{ color: NAVY }}>84%</div>
              <div className="text-[9px] text-slate-400">استبقاء</div>
            </div>
          </div>
          <div className="text-[11px] text-center text-slate-500">من أصل 120 موظف</div>
        </div>
      )
    },
    {
      icon: CalendarCheck,
      label: "الحضور والغياب",
      desc: "ملخّص شهري بالتغيب والتأخر",
      render: () => (
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <div className="grid grid-cols-3 gap-2 text-center mb-2">
            {[{ l: "حاضر", v: "92%", c: "#16a34a" }, { l: "متأخر", v: "5%", c: "#fbbf24" }, { l: "غائب", v: "3%", c: "#dc2626" }].map((x, i) => (
              <div key={i} className="rounded-lg py-2" style={{ background: `${x.c}14` }}>
                <div className="text-sm font-extrabold" style={{ color: x.c }}>{x.v}</div>
                <div className="text-[9px] text-slate-500">{x.l}</div>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-1 h-12">
            {[88, 92, 79, 95, 90, 85, 93].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: CYAN, opacity: .8 }} />
            ))}
          </div>
        </div>
      )
    },
    {
      icon: FileBadge,
      label: "تراخيص حكومية غاربة على الانتهاء",
      desc: "تنبيه استباقي قبل انتهاء الرخص",
      render: () => (
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <div className="text-[10px] text-slate-400 mb-2">تراخيص قاربت الانتهاء</div>
          {[
            { n: "رخصة بلدي", d: "بعد 6 أيام", warn: true },
            { n: "آمنة", d: "بعد 12 يوم", warn: true },
            { n: "تجاري", d: "نشطة", warn: false }
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between text-[11px] py-1.5 border-b border-slate-100 last:border-0">
              <span className="text-slate-700 font-medium">{r.n}</span>
              <span className="font-bold" style={{ color: r.warn ? "#dc2626" : "#16a34a" }}>{r.d}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      icon: Building2,
      label: "الاشتراكات الحكومية غاربة على الانتهاء",
      desc: "تنبيه استباقي قبل انتهاء الاشتراك",
      render: () => (
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <div className="text-[10px] text-slate-400 mb-2">اشتراكات قاربت الانتهاء</div>
          {[
            { n: "مقيم", d: "بعد 8 أيام", warn: true },
            { n: "مدد", d: "بعد 15 يوم", warn: true },
            { n: "أبشر أعمال", d: "بعد 21 يوم", warn: true }
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between text-[11px] py-1.5 border-b border-slate-100 last:border-0">
              <span className="text-slate-700 font-medium">{r.n}</span>
              <span className="font-bold" style={{ color: "#fbbf24" }}>{r.d}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      icon: FileSignature,
      label: "عقود العمل غاربة على الانتهاء",
      desc: "تنبيه استباقي قبل انتهاء العقود",
      render: () => (
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <div className="text-[10px] text-slate-400 mb-2">عقود قاربت الانتهاء</div>
          {[
            { n: "خالد المغربي", d: "بعد 12 يوم", warn: true },
            { n: "سارة العتيبي", d: "بعد 30 يوم", warn: true },
            { n: "فهد النعيمي", d: "بعد 45 يوم", warn: false }
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between text-[11px] py-1.5 border-b border-slate-100 last:border-0">
              <span className="text-slate-700 font-medium">{r.n}</span>
              <span className="font-bold" style={{ color: r.warn ? "#dc2626" : "#fbbf24" }}>{r.d}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      icon: ShieldAlert,
      label: "الإنذارات",
      desc: "عدد الإنذارات حسب الدرجة",
      render: () => (
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <div className="flex items-end gap-2 h-24 justify-center">
            {[{ d: "أولى", v: 18, c: "#fbbf24" }, { d: "ثانية", v: 7, c: "#fb923c" }, { d: "ثالثة", v: 2, c: "#dc2626" }].map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1" style={{ width: 38 }}>
                <div className="rounded-t w-full" style={{ height: `${(b.v / 20) * 70}px`, background: b.c }} />
                <div className="text-[9px] text-slate-600 font-bold">{b.v}</div>
                <div className="text-[8px] text-slate-400">{b.d}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-center text-slate-500 mt-1">إجمالي 27 إنذار هذا الربع</div>
        </div>
      )
    },
    {
      icon: Wallet,
      label: "الرواتب للأشهر الماضية",
      desc: "إجمالي صرف الرواتب شهرياً",
      render: () => (
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <div className="text-[10px] text-slate-400 mb-2">الرواتب بالريال (آخر 7 أشهر)</div>
          <svg viewBox="0 0 200 70" className="w-full h-20">
            <polyline points="0,50 33,44 66,48 100,38 133,34 166,30 200,26" fill="none" stroke={CYAN} strokeWidth="2.5" />
            {[50, 44, 48, 38, 34, 30, 26].map((y, i) => (
              <circle key={i} cx={i * 33} cy={y} r="2.5" fill={CYAN} />
            ))}
          </svg>
          <div className="flex justify-between text-[8px] text-slate-400 mt-1">
            <span>فبراير</span><span>مارس</span><span>أبريل</span><span>مايو</span><span>يونيو</span><span>يوليو</span><span>أغسطس</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1">
            <span className="text-slate-400">آخر صرف</span>
            <span className="font-extrabold" style={{ color: NAVY }}>31,494 ر.س</span>
          </div>
        </div>
      )
    },
    {
      icon: ShieldCheck,
      label: "التأمينات للأشهر الماضية",
      desc: "مساهمة التأمينات شهرياً",
      render: () => (
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <div className="text-[10px] text-slate-400 mb-2">التأمينات بالريال (آخر 7 أشهر)</div>
          <svg viewBox="0 0 200 70" className="w-full h-20">
            <polyline points="0,55 33,52 66,50 100,46 133,44 166,40 200,38" fill="none" stroke="#7c3aed" strokeWidth="2.5" />
            {[55, 52, 50, 46, 44, 40, 38].map((y, i) => (
              <circle key={i} cx={i * 33} cy={y} r="2.5" fill="#7c3aed" />
            ))}
          </svg>
          <div className="flex justify-between text-[8px] text-slate-400 mt-1">
            <span>فبراير</span><span>مارس</span><span>أبريل</span><span>مايو</span><span>يونيو</span><span>يوليو</span><span>أغسطس</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1">
            <span className="text-slate-400">آخر قسط</span>
            <span className="font-extrabold" style={{ color: "#7c3aed" }}>3,016 ر.س</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <Section tint="light" heading={<Heading icon={<BarChart3 />} title="التقارير والتحليلات" sub="لوحة قيادة تحليلية متكاملة لصانع القرار — صور شاشة فعلية لكل تقرير" />}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r, k) => {
          const I = r.icon;
          return (
            <div key={k} className="rounded-2xl p-3 border border-slate-200 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${CYAN}1A`, color: CYAN, border: `1px solid ${CYAN}40` }}><I size={18} /></div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: NAVY }}>{r.label}</h4>
                  <div className="text-[11px] text-slate-500">{r.desc}</div>
                </div>
              </div>
              <r.render />
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-500 mt-4">
        كل تقرير قابل للتصفية بالفرع والإدارة والفترة — وتصديره كملف إلكتروني للمشاركة أو الأرشفة
      </p>
    </Section>
  );
}