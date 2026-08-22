import React from "react";
import { Crown, CalendarDays, ChevronLeft, Send, Check } from "lucide-react";

// شاشة جوال بوابة الموظف — نموذج تقديم طلب إجازة سنوية بواجهة جدارة الحقيقية
export default function EmployeeLeaveRequestPhone({ employeeName = "أحمد العتيبي" }) {
  return (
    <div className="flex flex-col h-[36rem] bg-[#F4F6FB] text-right" dir="rtl">
      {/* رأس البوابة */}
      <div className="bg-[#0B2545] px-4 pt-3 pb-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0b0f19] to-[#2e2448] ring-1 ring-amber-300/30 flex items-center justify-center">
              <Crown size={16} className="text-amber-300" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-bold" style={{ fontFamily: "var(--font-display)" }}>جدارة</div>
              <div className="text-[8px] text-white/55">بوابة الموظف</div>
            </div>
          </div>
          <ChevronLeft size={16} className="text-white/70" />
        </div>
        <div className="mt-3 text-center">
          <div className="text-[10px] text-white/55">مرحباً</div>
          <div className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>{employeeName}</div>
        </div>
      </div>

      {/* بطاقة الطلب */}
      <div className="px-4 -mt-3 flex-1 overflow-hidden">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <CalendarDays size={14} className="text-[#B6901F]" />
            </div>
            <div className="text-[13px] font-bold text-[#0B2545]" style={{ fontFamily: "var(--font-display)" }}>طلب إجازة جديد</div>
          </div>

          {/* نوع الإجازة */}
          <Label>نوع الإجازة</Label>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <TypeChip active label="سنوية" />
            <TypeChip label="مرضية" />
            <TypeChip label="طارئة" />
            <TypeChip label="استثنائية" />
          </div>

          {/* التواريخ */}
          <div className="mt-3">
            <Label>تاريخ البداية</Label>
            <DateBox value="1447/02/10" sub="الأحد 10 صفر" />
          </div>
          <div className="mt-2.5">
            <Label>تاريخ النهاية</Label>
            <DateBox value="1447/02/14" sub="الخميس 14 صفر" />
          </div>

          <div className="mt-2.5 flex items-center justify-between bg-[#F4F6FB] rounded-lg px-3 py-2">
            <span className="text-[10px] text-slate-500">عدد الأيام</span>
            <span className="text-xs font-bold text-[#0B2545]">5 أيام</span>
          </div>

          {/* السبب */}
          <div className="mt-2.5">
            <Label>السبب</Label>
            <div className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-600 leading-relaxed h-12">
              إجازة سنوية لزيارة العائلة والراحة.
            </div>
          </div>

          {/* رصيد الإجازات */}
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
            <Check size={12} className="text-emerald-600" />
            <span className="text-[10px] text-emerald-700">رصيدك المتاح: <b>18 يوماً</b></span>
          </div>
        </div>
      </div>

      {/* زر الإرسال */}
      <div className="px-4 pb-4">
        <button className="w-full rounded-xl bg-gradient-to-r from-[#CBA83A] to-[#B6901F] text-[#0B2545] text-xs font-bold py-3 flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20">
          <Send size={14} /> تقديم الطلب
        </button>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div className="text-[10px] font-medium text-slate-500">{children}</div>;
}

function TypeChip({ active, label }) {
  return (
    <div className={`rounded-lg px-2 py-2 text-center text-[10px] font-semibold border ${active ? "bg-[#0B2545] text-white border-[#0B2545]" : "bg-white text-slate-500 border-slate-200"}`}>
      {label}
    </div>
  );
}

function DateBox({ value, sub }) {
  return (
    <div className="mt-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] font-bold text-[#0B2545]">{value}</div>
      <div className="text-[9px] text-slate-400">{sub}</div>
    </div>
  );
}