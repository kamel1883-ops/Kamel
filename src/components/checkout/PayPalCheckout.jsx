import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";
import PaymentMethods from "@/components/checkout/PaymentMethods";

// يحمّل PayPal SDK (Singleton) ثم يُفعّل أبل باي + حقول البطاقة المباشرة (مدى/فيزا/ماستركارد)
// مباشرةً على الصفحة — دون أي إعادة توجيه أو تسجيل دخول لحساب PayPal.
// كل العمليات تُكمل عبر paypalCheckout الخلفية، والمبلغ يُحصّل في حساب PayPal التاجر.
let sdkPromise = null;
function loadPayPalSdk(clientId, currency) {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src =
      "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(clientId) +
      "&currency=" + encodeURIComponent(currency) +
      "&intent=capture&components=buttons,card-fields&enable-funding=applepay,card&disable-funding=paylater,venmo,paypal";
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
  const appleRef = useRef(null);
  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvvRef = useRef(null);
  const cardFieldsRef = useRef(null);
  const cardBtnRef = useRef(null);
  const instancesRef = useRef([]);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [cardValid, setCardValid] = useState(false);
  const [cardErr, setCardErr] = useState("");
  const [appleShown, setAppleShown] = useState(false);
  const [cardShown, setCardShown] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await base44.functions.invoke("paypalCheckout", { action: "config" });
        const cfg = res?.data || {};
        if (!cfg.client_id) {
          if (!cancelled) { setErr(isAr ? "لم يتم إعداد بوابة الدفع بعد" : "Payment gateway not configured"); setState("error"); }
          return;
        }
        const paypal = await loadPayPalSdk(cfg.client_id, cfg.currency || "SAR");
        if (cancelled) return;

        // تنظيف أي نسخ سابقة قبل إعادة التهيئة
        instancesRef.current.forEach((x) => { try { x.close?.(); } catch (_) {} });
        instancesRef.current = [];
        if (appleRef.current) appleRef.current.innerHTML = "";
        cardFieldsRef.current = null;

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

        const onError = (e) => {
          const msg = e?.message || (isAr ? "حدث خطأ أثناء الدفع، حاول مرة أخرى" : "Payment error, retry");
          if (cancelled) return;
          setErr(msg); setState("error");
        };

        let rendered = 0;

        // 1) أبل باي — زر مباشر يفتح sheet أبل باي (بدون أي إعادة توجيه)
        try {
          if (appleRef.current && paypal.Buttons && paypal.FUNDING?.APPLEPAY) {
            const ap = paypal.Buttons({
              fundingSource: paypal.FUNDING.APPLEPAY,
              style: { layout: "vertical", color: "black", shape: "rect", height: 48 },
              createOrder, onApprove, onError,
            });
            const eligible = typeof ap.isEligible === "function" ? ap.isEligible() : true;
            if (eligible) {
              appleRef.current.innerHTML = "";
              await ap.render(appleRef.current);
              if (cancelled) { try { ap.close(); } catch (_) {} return; }
              instancesRef.current.push(ap);
              setAppleShown(true);
              rendered++;
            }
          }
        } catch (_) { /* جهاز/متصفح غير مؤهّل لأبل باي — يُخفى تلقائياً */ }

        // 2) حقول البطاقة المباشرة (مدى/فيزا/ماستركارد) — مُدمجة بالصفحة بدون إعادة توجيه
        try {
          if (paypal.CardFields && paypal.CardField && cardNumberRef.current) {
            const cardFields = paypal.CardFields({
              style: {
                input: { "font-size": "16px", color: "#1a1a1a" },
                ".invalid": { color: "#dc2626", "color.field-error": "#dc2626" },
              },
              inputEvents: {
                onChange: (s) => { if (cancelled) return; setCardValid(!!s?.isCardValid); if (s?.isCardValid) setCardErr(""); },
                onInputSubmitError: (e) => { if (cancelled) return; setCardErr(e?.message || (isAr ? "تحقق من بيانات البطاقة" : "Check card details")); },
              },
              createOrder, onApprove, onError,
            });
            const eligible = typeof cardFields.isEligible === "function" ? cardFields.isEligible() : true;
            if (eligible) {
              const numberField = paypal.CardField.NumberField({ placeholder: "1234 1234 1234 1234" });
              const expiryField = paypal.CardField.ExpiryField({ placeholder: "MM / YY" });
              const cvvField = paypal.CardField.CVVField({ placeholder: "CVV" });
              await numberField.render(cardNumberRef.current);
              if (cancelled) { try { numberField.close?.(); } catch (_) {} return; }
              await expiryField.render(cardExpiryRef.current);
              if (cancelled) { try { expiryField.close?.(); } catch (_) {} return; }
              await cvvField.render(cardCvvRef.current);
              if (cancelled) { try { cvvField.close?.(); } catch (_) {} return; }
              cardFieldsRef.current = cardFields;
              instancesRef.current.push({
                close: () => { try { numberField.close?.(); } catch (_) {} try { expiryField.close?.(); } catch (_) {} try { cvvField.close?.(); } catch (_) {} try { cardFields.close?.(); } catch (_) {} },
              });
              setCardShown(true);
              rendered++;
            }
          }
        } catch (_) { /* card-fields غير مؤهّل — يُخفى القسم */ }

        if (!cancelled) setState(rendered > 0 ? "ready" : "error");
      } catch (e) {
        if (!cancelled) { setErr(e?.message || "init_failed"); setState("error"); }
      }
    })();

    return () => {
      cancelled = true;
      instancesRef.current.forEach((b) => { try { b.close?.(); } catch (_) {} });
      instancesRef.current = [];
      cardFieldsRef.current = null;
    };
  }, [employeeCount, discountCode, tenantId, contractProof, amount, onPaid, isAr]);

  const payByCard = async (e) => {
    e.preventDefault();
    setCardErr("");
    const cf = cardFieldsRef.current;
    if (!cf || typeof cf.submit !== "function") {
      setCardErr(isAr ? "تعذّر تهيئة البطاقة، أعد المحاولة" : "Card form not ready, retry");
      return;
    }
    setBusy(true);
    try {
      await cf.submit();
    } catch (e) {
      setCardErr(e?.message || (isAr ? "تعذّر إتمام الدفع بالبطاقة" : "Card payment failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full">
      <PaymentMethods lang={lang} />

      {/* أبل باي */}
      {appleShown && (
        <div className="mb-3">
          <div ref={appleRef} className="paypal-apple-btn min-h-[48px]" />
        </div>
      )}
      {appleShown && cardShown && (
        <div className="relative flex items-center my-3">
          <div className="flex-1 h-px bg-border" />
          <span className="px-3 text-xs text-muted-foreground">{isAr ? "أو" : "OR"}</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* حقول البطاقة المباشرة */}
      {cardShown && (
        <form onSubmit={payByCard} className="space-y-3">
          <div className="rounded-xl border border-input bg-white p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CreditCard size={16} /> {isAr ? "ادفع بالبطاقة (مدى / فيزا / ماستركارد)" : "Pay by card (mada / Visa / Mastercard)"}
            </div>
            <div className="rounded-lg border border-input overflow-hidden">
              <div ref={cardNumberRef} className="px-3 py-3" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-input overflow-hidden">
                <div ref={cardExpiryRef} className="px-3 py-3" />
              </div>
              <div className="rounded-lg border border-input overflow-hidden">
                <div ref={cardCvvRef} className="px-3 py-3" />
              </div>
            </div>
          </div>
          {cardErr && <div className="text-sm text-rose-600">{cardErr}</div>}
          <button
            ref={cardBtnRef}
            type="submit"
            disabled={busy || !cardValid}
            className="w-full h-12 rounded-lg bg-[#181c25] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#242a37] transition-colors"
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> {isAr ? "جاري تأكيد الدفع…" : "Processing…"}
              </span>
            ) : (
              isAr ? `ادفع الآن ${amount ? amount.toLocaleString("ar-EG") + " ر.س" : ""}` : `Pay now ${amount ? amount.toLocaleString() + " SAR" : ""}`
            )}
          </button>
        </form>
      )}

      {busy && !cardShown && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-3">
          <Loader2 size={16} className="animate-spin" />
          {isAr ? "جاري تأكيد الدفع وتوليد العقد…" : "Confirming payment & generating contract…"}
        </div>
      )}
      {state === "error" && !busy && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 mt-3">
          {err || (isAr ? "تعذّر تهيئة بوابة الدفع" : "Payment gateway failed to load")}
        </div>
      )}
      {state === "loading" && !appleShown && !cardShown && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-6">
          <Loader2 size={16} className="animate-spin" /> {isAr ? "تحميل بوابة الدفع…" : "Loading payment…"}
        </div>
      )}
      {(state === "ready" || appleShown || cardShown) && !busy && (
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <ShieldCheck size={13} /> {isAr ? "الدفع آمن ومشفّر — أبل باي أو بطاقتك (مدى/فيزا/ماستركارد) مباشرة، دون تسجيل دخول PayPal." : "Secure checkout — Apple Pay or your card directly, no PayPal login."}
        </p>
      )}
    </div>
  );
}