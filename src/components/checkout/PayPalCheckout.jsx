import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldCheck } from "lucide-react";
import PaymentMethods from "@/components/checkout/PaymentMethods";

// يحمّل PayPal SDK (Singleton) ثم يعرض أزرار الدفع المتاحة: أبل باي + بطاقة (مدى/فيزا/ماستركارد) + PayPal.
// كل الأزرار تُكمل عبر paypalCheckout الخلفية، والمبلغ يُحصّل في حساب PayPal.
let sdkPromise = null;
function loadPayPalSdk(clientId, currency) {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src =
      "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(clientId) +
      "&currency=" + encodeURIComponent(currency) +
      "&intent=capture&components=buttons&enable-funding=applepay,card,venmo,paylater";
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
  const instancesRef = useRef([]);
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
        containerRef.current.innerHTML = "";
        instancesRef.current = [];

        const createOrder = async () => {
          const r = await base44.functions.invoke("paypalCheckout", {
            action: "create",
            employee_count: employeeCount,
            discount_code: discountCode || undefined,
          });
          if (!r?.data?.ok) throw new Error(r?.data?.error || "create_failed");
          return r.data.id;
        };

        const onApprove = async (data) => {
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
          } finally {
            setBusy(false);
          }
        };

        const onError = () => { setErr(isAr ? "حدث خطأ أثناء الدفع، حاول مرة أخرى" : "Payment error, retry"); setState("error"); };

        // أزرار الدفع بالترتيب: أبل باي ثم البطاقة ثم PayPal — كل ما هو مؤهل (eligible) فقط يُعرض.
        const sources = [paypal.FUNDING.APPLEPAY, paypal.FUNDING.CARD, paypal.FUNDING.PAYPAL];
        let rendered = 0;
        for (const fs of sources) {
          try {
            const btn = paypal.Buttons({
              fundingSource: fs,
              style: { layout: "vertical", color: "gold", shape: "rect", height: 48 },
              createOrder,
              onApprove,
              onError,
            });
            const eligible = typeof btn.isEligible === "function" ? btn.isEligible() : true;
            if (!eligible) continue;
            const holder = document.createElement("div");
            holder.className = "paypal-funding-btn mb-2";
            containerRef.current.appendChild(holder);
            await btn.render(holder);
            if (cancelled) { try { btn.close(); } catch (_) {} return; }
            instancesRef.current.push(btn);
            rendered++;
          } catch (_) { /* skip ineligible */ }
        }

        if (!cancelled) setState(rendered > 0 ? "ready" : "error");
      } catch (e) {
        if (!cancelled) { setErr(e?.message || "init_failed"); setState("error"); }
      }
    })();

    return () => {
      cancelled = true;
      instancesRef.current.forEach((b) => { try { b.close(); } catch (_) {} });
      instancesRef.current = [];
      if (containerRef.current) { try { containerRef.current.innerHTML = ""; } catch (_) {} }
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
          <ShieldCheck size={13} /> {isAr ? "الدفع آمن ومشفّر عبر PayPal — اختر أبل باي أو بطاقتك (مدى/فيزا/ماستركارد) أو حساب PayPal." : "Secure checkout via PayPal — Apple Pay, your card (mada/Visa/Mastercard), or PayPal account."}
        </p>
      )}
    </div>
  );
}