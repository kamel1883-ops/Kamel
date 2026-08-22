import React from "react";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { LaptopFrame } from "@/components/landing/DeviceFrames";

export default function ApprovalPortalScreen() {
  return (
    <LaptopFrame>
      <div dir="rtl" className="text-slate-900">
        <div className="flex items-center justify-between bg-[#0B2545] px-4 py-3 text-white">
          <div><p className="text-xs text-amber-300">جدارة | بوابة الشركات</p><p className="font-bold">الإجازات والموافقات</p></div>
          <CalendarCheck className="text-amber-300" />
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500"><span>الموظف</span><span>نوع الطلب</span><span>الحالة</span></div>
          <div className="mt-2 grid grid-cols-3 items-center gap-2 rounded-xl border p-3 text-xs"><b>أحمد محمد</b><span>إجازة سنوية</span><span className="flex items-center gap-1 font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> تمت الموافقة</span></div>
          <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-700">تم اعتماد طلب الإجازة بنجاح</div>
        </div>
      </div>
    </LaptopFrame>
  );
}