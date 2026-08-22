import React from "react";
import { CalendarDays, CheckCircle2 } from "lucide-react";

export default function EmployeePortalScreen() {
  return (
    <div dir="rtl" className="w-64 rounded-[2rem] border-4 border-primary bg-card p-3 text-foreground shadow-2xl">
      <div className="mx-auto mb-3 h-1 w-14 rounded-full bg-muted" />
      <div className="rounded-2xl bg-primary p-3 text-primary-foreground">
        <p className="text-[10px] text-violet-300">جدارة | بوابة الموظف</p>
        <p className="mt-1 text-sm font-bold">طلب إجازة جديد</p>
      </div>
      <div className="my-3 space-y-2 text-[10px]">
        <div className="flex items-center gap-2 rounded-lg bg-muted p-2"><CalendarDays className="h-4 w-4 text-violet-600" /> إجازة سنوية</div>
        <div className="grid grid-cols-2 gap-2"><span className="rounded-lg border p-2">تاريخ البداية</span><span className="rounded-lg border p-2">تاريخ النهاية</span></div>
        <div className="rounded-lg bg-violet-500 p-2 text-center font-bold text-primary">رفع طلب الإجازة</div>
        <div className="flex items-center justify-center gap-1 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> تم إرسال الطلب بنجاح</div>
      </div>
    </div>
  );
}