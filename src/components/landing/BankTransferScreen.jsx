import React from "react";
import { Landmark, Banknote, CheckCircle2 } from "lucide-react";
import { PhoneFrame } from "@/components/landing/DeviceFrames";

export default function BankTransferScreen() {
  return (
    <PhoneFrame>
      <div dir="rtl" className="p-3 text-slate-900">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700"><Landmark className="h-5 w-5" /><b>حوالة واردة</b></div>
          <p className="mt-3 text-sm font-bold">حوالة واردة من شركة الإنشاءات المتقدمة</p>
          <p className="mt-1 text-xs text-slate-500">مستحقات إجازة سنوية</p>
          <div className="mt-3 flex items-center justify-between border-t border-emerald-200 pt-3"><span className="text-xs">تم إيداع المبلغ</span><span className="flex items-center gap-1 text-lg font-bold"><Banknote className="h-4 w-4" /> 8,450 ر.س</span></div>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="h-4 w-4" /> تمت الحوالة بنجاح</p>
        </div>
        <div className="mt-3 h-24 rounded-2xl bg-slate-100" />
      </div>
    </PhoneFrame>
  );
}