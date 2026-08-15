import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldCheck } from "lucide-react";
import PaymentMethods from "@/components/checkout/PaymentMethods";

// يحمّل PayPal SDK مرة واحدة (Singleton) ثم يعرض أزرار PayPal + بطاقة الفيزا/الماستر كارد/مدى.
// createOrder/onApprove يطلبان دالة paypalCheckout الخلفية. عند النجاح يُستدعى onPaid(results).
let sdkPromise = null;
function loadPayPalSdk(clientId, currency) {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src =
      "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(clientId) +
      "&currency=" + encodeURIComponent(currency) +
      "&intent=capture&components=buttons&enable-funding=card,venmo,paylater";
    s.onload = () => {
      if (window.paypal) resolve(window.paypal);
      else { sdkPromise = null; reject(new Error("sdk_load_failed")); }
    };
    s.onerror = () => { sdkPromise = null; reject(new Error("sdk_load_failed")); };
    document.head.appendChild(s);
  });
  return sdkPromise;
}

export default function PayPalCheckout({ employeeCount, discountCode, tenantId, contractProof, amount, onPaid, lang = "ar" }) {
  const isAr = lang === "ar";
  const containerRef = useRef(null);
  const buttonsRef = useRef(null);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("paypalCheckout", { action: "config" });
        const cfg = res?.data || {};
        if (!cfg.client_id) {
          if (!cancelled) { setErr(isAr ? "لم يتم إعداد PayPal بعد" : "PayPal not configured"); setState("error"); }
          return;
        }
        const paypal = await loadPayPalSdk(cfg.client_id, cfg.currency || "SAR");
        if (cancelled || !containerRef.current) return;
        if (buttonsRef.current) { try { buttonsRef.current.close(); } catch (_) {} }
        buttonsRef.current = paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 48 },
          createOrder: async () => {
            const r = await base44.functions.invoke("paypalCheckout", {
              action: "create",
              employee_count: employeeCount,
              discount_code: discountCode || undefined,
            });
            if (!r?.data?.ok) throw new Error(r?.data?.error || "create_failed");
            return r.data.id;
          },
          onApprove: async (data) => {
            setBusy(true);
            try {
              const r = await base44.functions.invoke("paypalCheckout", {
                action: "capture",
                order_id: data.orderID,
                tenant_id: tenantId,
                contract_proof: contractProof,
                employee_count: employeeCount,
                amount: amount,
              });
              if (!r?.data?.ok) throw new Error(r?.data?.error || "capture_failed");
              onPaid?.(r.data);
            } catch (e) {
              setErr(e?.message === "forbidden" ? (isAr ? "تعذّر التحقق من جلستك، أعد المحاولة" : "Session error, retry") : (isAr ? "تعذّر تأكيد الدفع" : "Capture failed"));
              setState("error");
            } finally { setBusy(false); }
          },
          onError: () => { setErr(isAr ? "حدث خطأ أثناء الدفع، حاول مرة أخرى" : "Payment error, retry"); setState("error"); },
        });
        try { containerRef.current.innerHTML = ""; } catch (_) {}
        buttonsRef.current.render(containerRef.current);
        if (!cancelled) setState("ready");
      } catch (e) {
        if (!cancelled) { setErr(e?.message || "init_failed"); setState("error"); }
      }
    })();
    return () => {
      cancelled = true;
      if (buttonsRef.current) { try { buttonsRef.current.close(); } catch (_) {} buttonsRef.current = null; }
    };
  }, [employeeCount, discountCode, tenantId, contractProof, amount, onPaid, isAr]);

  return (
    <div className="w-full">
      <PaymentMethods lang={lang} />
      <div ref={containerRef} className="paypal-buttons min-h-[120px]" />
      {busy && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-3">
          <Loader2 size={16} className="animate-spin" />
          {isAr ? "جاري تأكيد الدفع وتوليد العقد…" : "Confirming payment & generating contract…"}
        </div>
      )}
      {state === "error" && !busy && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 mt-3">
          {err || (isAr ? "تعذّر تهيئة PayPal" : "PayPal failed to load")}
        </div>
      )}
      {state === "loading" && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-6">
          <Loader2 size={16} className="animate-spin" /> {isAr ? "تحميل بوابة الدفع…" : "Loading PayPal…"}
        </div>
      )}
      {state === "ready" && !busy && (
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <ShieldCheck size={13} /> {isAr ? "الدفع آمن ومشفّر عبر PayPal — يمكنك الدفع ببطاقة فيزا/ماستر كارد/مدى أو حساب PayPal." : "Secure checkout via PayPal — Visa/Mastercard/mada or PayPal account."}
        </p>
      )}
    </div>
  );
}