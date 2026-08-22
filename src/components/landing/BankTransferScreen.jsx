import React from "react";
import { Landmark, Banknote, CheckCircle2 } from "lucide-react";

export default function BankTransferScreen() {
  return (
    <div dir="rtl" className="w-72 rounded-[2rem] border-4 border-primary bg-card p-3 text-foreground shadow-2xl">
      <div className="mx-auto mb-3 h-1 w-14 rounded-full bg-muted" />
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-emerald-700"><Landmark className="h-5 w-5" /><b>حوالة واردة</b></div>
        <p className="mt-3 text-sm font-bold">من: شركة الإنشاءات المتقدمة</p>
        <p className="mt-1 text-xs text-muted-foreground">البيان: مستحقات إجازة سنوية</p>
        <div className="mt-3 flex items-center justify-between border-t border-emerald-200 pt-3"><span className="text-xs">تم إيداع المبلغ</span><span className="flex items-center gap-1 text-lg font-bold"><Banknote className="h-4 w-4" /> 8,450 ر.س</span></div>
        <p className="mt-2 flex items-center justify-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="h-4 w-4" /> تمت الحوالة بنجاح</p>
      </div>
    </div>
  );
}