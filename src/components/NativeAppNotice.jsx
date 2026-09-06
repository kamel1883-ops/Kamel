import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";
import { isNativeApp } from "@/lib/nativeApp";
import { useI18n } from "@/lib/i18n";

export { isNativeApp };

const SITE_URL = "jadara-hr.com";

// خطّاف يُرجع دالة gate: إن كنّا داخل التطبيق الأصلي يفتح تنبيه توجيه ولا ينفّذ الإجراء،
// وإلا ينفّذ callback المُمرّر. كما يُرجع عنصر التنبيه لعرضه في الصفحة.
export function useNativeGate() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);

  const gate = useCallback((cb) => {
    if (isNativeApp()) {
      setOpen(true);
      return true;
    }
    if (typeof cb === "function") cb();
    return false;
  }, []);

  const notice = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md text-center" dir={isAr ? "rtl" : "ltr"}>
        <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center mb-3">
          <Monitor className="text-violet-600" size={28} />
        </div>
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isAr ? "غير متاح داخل التطبيق" : "Not available in-app"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed pt-2 text-muted-foreground">
            {isAr
              ? "لا يمكن إتمام التسجيل أو الاشتراك أو طلب التجربة من داخل تطبيق App Store. يرجى فتح المنصة من متصفح الكمبيوتر أو اللابتوب على العنوان:"
              : "Registration, subscription and trial requests can't be completed inside the App Store app. Please open the platform from a desktop or laptop browser at:"}
            <br />
            <b dir="ltr" className="text-violet-700 text-base">{SITE_URL}</b>
          </DialogDescription>
        </DialogHeader>
        <Button className="w-full mt-2" onClick={() => setOpen(false)}>
          {isAr ? "حسناً" : "OK"}
        </Button>
      </DialogContent>
    </Dialog>
  );

  return { gate, notice };
}

// شاشة منع كاملة تُعرض عند محاولة الوصول المباشر لصفحات التسجيل/الشراء داخل التطبيق
export function NativeAppBlocked({ title, subtitle }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-md w-full text-center border border-violet-100 rounded-3xl bg-white p-8 shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center mb-4">
          <Monitor className="text-violet-600" size={30} />
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{subtitle}</p>
        <p className="mt-4 text-lg font-bold text-violet-700" dir="ltr">{SITE_URL}</p>
      </div>
    </div>
  );
}