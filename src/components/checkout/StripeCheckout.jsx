import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldCheck } from "lucide-react";

// بوابة دفع Stripe: حقول البطاقة (مدى/فيزا/ماستركارد) وأبل باي تُعرض مباشرة على الصفحة
// دون أي إعادة توجيه لتسجيل دخول PayPal. لا حاجة لحساب PayPal — الدفع يدخل مباشرة في حسابنا.
// Apple Pay / Google Pay يظهران تلقائياً في Payment Element عند الأهلية (متصفح/جهاز مؤهّل ومرتّب).

function StripeForm({ piId, tenantId, contractProof, amount, onPaid, lang }) {
  const isAr = lang === "ar";
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setErr("");
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });
      if (result.error) {
        setErr(result.error.message || (isAr ? "تعذّر إتمام الدفع" : "Payment failed"));
        setBusy(false);
        return;
      }
      const conf = await base44.functions.invoke("stripeCheckout", {
        action: "confirm",
        payment_intent_id: piId,
        tenant_id: tenantId,
        contract_proof: contractProof,
      });
      if (!conf?.data?.ok) throw new Error(conf?.data?.error || "confirm_failed");
      onPaid?.({ method: "stripe_card", capture_id: conf.data.capture_id, paid: conf.data.paid });
    } catch (e2) {
      const msg = String(e2?.message || "");
      setErr(msg === "forbidden" ? (isAr ? "تعذّر التحقق من جلستك، أعد المحاولة" : "Session error, retry") : (msg || (isAr ? "تعذّر تأكيد الدفع" : "Confirm failed")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="rounded-xl border border-input bg-white p-3">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      {err && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{err}</div>
      )}
      <button
        type="submit"
        disabled={busy || !stripe || !elements}
        className="w-full h-12 rounded-lg bg-[#181c25] text-white text-sm font-medium disabled:opacity-50 hover:bg-[#242a37] transition-colors"
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> {isAr ? "جاري تأكيد الدفع…" : "Processing…"}
          </span>
        ) : (
          isAr ? `ادفع الآن ${amount ? amount.toLocaleString("ar-EG") + " ر.س" : ""}` : `Pay now ${amount ? amount.toLocaleString() + " SAR" : ""}`
        )}
      </button>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <ShieldCheck size={13} /> {isAr ? "الدفع آمن ومشفّر عبر Stripe — بطاقتك (مدى/فيزا/ماستركارد) أو أبل باي مباشرة، دون تسجيل دخول PayPal." : "Secure Stripe checkout — your card (mada/Visa/Mastercard) or Apple Pay directly."}
      </p>
    </form>
  );
}

export default function StripeCheckout({ employeeCount, discountCode, tenantId, contractProof, amount, onPaid, lang = "ar" }) {
  const isAr = lang === "ar";
  const [clientSecret, setClientSecret] = useState("");
  const [piId, setPiId] = useState("");
  const [stripePromise, setStripePromise] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await base44.functions.invoke("stripeCheckout", { action: "config" });
        if (cancelled) return;
        const pkey = cfg?.data?.publishable_key;
        if (!pkey) {
          setErr(isAr ? "لم يُعَدّ Stripe بعد" : "Stripe not configured");
          setLoading(false);
          return;
        }
        const cr = await base44.functions.invoke("stripeCheckout", {
          action: "create",
          employee_count: employeeCount,
          discount_code: discountCode || undefined,
          tenant_id: tenantId || undefined,
        });
        if (cancelled) return;
        if (!cr?.data?.ok) throw new Error(cr?.data?.error || "create_failed");
        setClientSecret(cr.data.client_secret);
        setPiId(cr.data.payment_intent_id);
        setStripePromise(loadStripe(pkey));
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setErr(e?.message || (isAr ? "تعذّر تهيئة الدفع" : "Init failed"));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [employeeCount, discountCode, tenantId, isAr]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 size={16} className="animate-spin" /> {isAr ? "تحميل بوابة الدفع…" : "Loading payment…"}
      </div>
    );
  }
  if (err) {
    return (
      <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 mt-3">{err}</div>
    );
  }
  if (!clientSecret || !stripePromise) return null;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">{isAr ? "طرق الدفع المقبولة:" : "Accepted methods:"}</span>
        <Logo>Apple Pay</Logo>
        <Logo>mada</Logo>
        <Logo>Visa</Logo>
        <Logo>Mastercard</Logo>
      </div>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: { colorPrimary: "#8E24AA", borderRadius: "10px" },
          },
        }}
      >
        <StripeForm piId={piId} tenantId={tenantId} contractProof={contractProof} amount={amount} onPaid={onPaid} lang={lang} />
      </Elements>
    </div>
  );
}

function Logo({ children }) {
  return (
    <span className="inline-flex items-center text-[11px] font-semibold text-foreground bg-white border border-input rounded-md px-2 h-6">
      {children}
    </span>
  );
}