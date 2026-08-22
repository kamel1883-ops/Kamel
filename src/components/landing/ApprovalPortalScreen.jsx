import React from "react";
import { CalendarCheck, CheckCircle2 } from "lucide-react";

export default function ApprovalPortalScreen() {
  return (
    <div dir="rtl" className="w-[30rem] text-foreground drop-shadow-2xl">
      <div className="overflow-hidden rounded-xl border-[8px] border-primary bg-card">
        <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
          <div><p className="text-xs text-violet-300">جدارة | بوابة الشركات</p><p className="font-bold">الإجازات والموافقات</p></div>
          <CalendarCheck className="text-violet-300" />
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground"><span>الموظف</span><span>نوع الطلب</span><span>الحالة</span></div>
          <div className="mt-2 grid grid-cols-3 items-center gap-2 rounded-xl border p-3 text-xs"><b>أحمد محمد</b><span>إجازة سنوية</span><span className="flex items-center gap-1 font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> تمت الموافقة</span></div>
          <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-700">تم اعتماد طلب الإجازة بنجاح</div>
        </div>
      </div>
      <div className="mx-auto h-8 w-20 bg-primary" />
      <div className="mx-auto h-2 w-40 rounded-full bg-primary" />
    </div>
  );
}