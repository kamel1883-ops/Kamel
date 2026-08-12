import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { usePortalI18n, usePortalT, portalDir } from "@/lib/portalI18n";

// حارس انتهاء الجلسة: بعد 15 دقيقة من الخمول تظهر نافذة عدّ تنازلي 60 ثانية،
// يختار المستخدم المتابعة وإلا يُسجَّل خروجه تلقائياً.
const IDLE_MS = 15 * 60 * 1000;
const COUNT_S = 60;

export default function IdleSessionGuard({ onTimeout, enabled = true }) {
  const { lang } = usePortalI18n();
  const t = usePortalT("idle");
  const [show, setShow] = useState(false);
  const [left, setLeft] = useState(COUNT_S);
  const lastAct = useRef(Date.now());
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!enabled) return;
    const onAct = () => { if (!show) lastAct.current = Date.now(); };
    const evs = ["mousemove", "keydown", "click", "scroll", "touchstart", "wheel"];
    evs.forEach((e) => window.addEventListener(e, onAct, { passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, onAct));
  }, [show, enabled]);

  useEffect(() => {
    if (!enabled || show) return;
    const id = setInterval(() => {
      if (Date.now() - lastAct.current >= IDLE_MS) {
        setShow(true);
        setLeft(COUNT_S);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [enabled, show]);

  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setShow(false);
          try { onTimeoutRef.current?.(); } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [show]);

  const cont = () => { lastAct.current = Date.now(); setShow(false); setLeft(COUNT_S); };

  return (
    <Dialog open={show} onOpenChange={(o) => { if (o) return; cont(); }}>
      <DialogContent className="max-w-sm text-center" dir={portalDir(lang) === "rtl" ? "rtl" : "ltr"}>
        <DialogHeader className="items-center text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
            <Clock className="text-amber-600" size={28} />
          </div>
          <DialogTitle>{t.stay}</DialogTitle>
          <DialogDescription className="leading-relaxed">
            {t.body(left)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2 pt-2">
          <Button onClick={cont} className="gap-2">
            <Clock size={16} /> {t.cont}
          </Button>
          <Button variant="outline" onClick={() => { setShow(false); try { onTimeoutRef.current?.(); } catch {} }} className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50">
            <LogOut size={16} /> {t.outNow}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}