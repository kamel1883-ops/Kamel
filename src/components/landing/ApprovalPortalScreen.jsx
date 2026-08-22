import React from "react";
import { CalendarCheck, CheckCircle2, Clock3 } from "lucide-react";

export default function ApprovalPortalScreen() {
  return (
    <div dir="rtl" className="w-[28rem] overflow-hidden rounded-2xl border border-white/20 bg-card text-foreground shadow-2xl">
      <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
        <div><p className="text-xs text-violet-300">جدارة | بوابة الشركات</p><p className="font-bold">الإجازات والموافقات</p></div>
        <CalendarCheck className="text-violet-300" />
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground"><span>الموظف</span><span>نوع الطلب</span><span>الحالة</span></div>
        <div className="mt-2 grid grid-cols-3 items-center gap-2 rounded-xl border p-3 text-xs"><b>أحمد محمد</b><span>إجازة سنوية</span><span className="flex items-center gap-1 text-amber-600"><Clock3 className="h-3 w-3" /> بالانتظار</span></div>
        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 p-2 text-sm font-bold text-primary"><CheckCircle2 className="h-4 w-4" /> الموافقة على الطلب</button>
        <div className="mt-3 rounded-lg bg-emerald-50 p-2 text-center text-xs font-semibold text-emerald-700">تمت الموافقة — بانتظار المالية للسداد</div>
      </div>
    </div>
  );
}