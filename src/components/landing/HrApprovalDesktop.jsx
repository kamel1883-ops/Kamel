import React from "react";
import { Crown, Bell, Search, Check, X, Clock, CalendarDays, User2, FileText } from "lucide-react";

// شاشة كمبيوتر بوابة الشركات — قائمة الموافقات، طلب إجازة بانتظار الموافقة (واجهة جدارة)
export default function HrApprovalDesktop() {
  return (
    <div className="flex h-[22rem] bg-[#F4F6FB] text-right" dir="rtl">
      {/* الشريط الجانبي */}
      <aside className="w-40 bg-[#0B2545] text-white flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0b0f19] to-[#2e2448] ring-1 ring-amber-300/30 flex items-center justify-center">
            <Crown size={14} className="text-amber-300" />
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-bold" style={{ fontFamily: "var(--font-display)" }}>جدارة</div>
            <div className="text-[8px] text-white/50">بوابة الشركات</div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1 text-[10px]">
          {[
            { l: "لوحة التحكم" },
            { l: "الموظفون" },
            { l: "الموافقات", active: true, count: 3 },
            { l: "الإجازات" },
            { l: "الرواتب" },
            { l: "الحضور" },
            { l: "نهاية الخدمة" },
          ].map((i) => (
            <div key={i.l} className={`flex items-center justify-between rounded-lg px-2.5 py-2 ${i.active ? "bg-white/10 text-white font-semibold" : "text-white/60"}`}>
              <span>{i.l}</span>
              {i.count && <span className="rounded-full bg-amber-400 text-[#0B2545] text-[9px] font-bold px-1.5">{i.count}</span>}
            </div>
          ))}
        </nav>
      </aside>

      {/* المحتوى */}
      <main className="flex-1 flex flex-col">
        {/* الترويسة */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold text-[#0B2545]" style={{ fontFamily: "var(--font-display)" }}>الموافقات</div>
            <span className="text-[10px] text-slate-400">طلبات بانتظار الاعتماد</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-200">
              <Search size={12} className="text-slate-400" />
              <span className="text-[10px] text-slate-400">بحث…</span>
            </div>
            <Bell size={14} className="text-slate-500" />
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#B6901F]">ع.م</span>
            </div>
          </div>
        </div>

        {/* بطاقة الطلب */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="rounded-2xl border border-amber-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <CalendarDays size={15} className="text-[#B6901F]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B2545]">طلب إجازة — أحمد العتيبي</div>
                  <div className="text-[10px] text-slate-400">إجازة سنوية • 5 أيام</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-[10px] font-semibold">
                <Clock size={11} /> بانتظار الموافقة
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 px-4 py-3 text-[10px]">
              <Field icon={<CalendarDays size={11} />} label="البداية" value="10 صفر" />
              <Field icon={<CalendarDays size={11} />} label="النهاية" value="14 صفر" />
              <Field icon={<FileText size={11} />} label="الرصيد" value="18 يوماً" />
            </div>

            <div className="px-4 py-2.5 bg-slate-50 rounded-b-2xl flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <User2 size={11} /> طُلب من الموظف عبر بوابة الموظف
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1 rounded-lg bg-[#0B2545] text-white text-[10px] font-semibold px-3 py-1.5">
                  <Check size={12} /> اعتماد
                </button>
                <button className="inline-flex items-center gap-1 rounded-lg border border-rose-200 text-rose-600 text-[10px] font-semibold px-3 py-1.5">
                  <X size={12} /> رفض
                </button>
              </div>
            </div>
          </div>

          {/* مسار الاعتماد */}
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500">
            <Stage done label="الموظف" />
            <Line />
            <Stage active label="المدير المباشر" />
            <Line />
            <Stage label="الموارد البشرية" />
            <Line />
            <Stage label="المالية" />
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
      <div className="flex items-center gap-1 text-slate-400">{icon}<span>{label}</span></div>
      <div className="mt-0.5 text-[11px] font-bold text-[#0B2545]">{value}</div>
    </div>
  );
}

function Stage({ done, active, label }) {
  const cls = done
    ? "bg-emerald-500 text-white"
    : active
    ? "bg-amber-400 text-[#0B2545] ring-2 ring-amber-200"
    : "bg-slate-200 text-slate-400";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center ${cls}`}>
        {done && <Check size={9} />}
      </span>
      <span className={done ? "text-emerald-600" : active ? "text-[#0B2545] font-semibold" : "text-slate-400"}>{label}</span>
    </div>
  );
}

function Line() {
  return <div className="flex-1 h-px bg-slate-200" />;
}