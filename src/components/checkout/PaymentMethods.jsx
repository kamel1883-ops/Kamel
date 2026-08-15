import React from "react";

// شريط خيارات الدفع المعتمدة — كلها تُحصّل عبر حساب PayPal (أبل باي / مدى / فيزا / ماستركارد / رصيد PayPal).
export default function PaymentMethods({ lang = "ar" }) {
  const isAr = lang === "ar";
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">
        {isAr ? "طرق الدفع المقبولة (كلها عبر PayPal)" : "Accepted payment methods (all via PayPal)"}
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <ApplePayLogo />
        <MadaLogo />
        <VisaLogo />
        <MastercardLogo />
        <PayPalLogo />
      </div>
      <p className="text-[11px] text-muted-foreground text-center mt-2">
        {isAr
          ? "اختر زر الدفع بالأسفل — أبل باي أو بطاقتك (مدى/فيزا/ماستركارد) أو حساب PayPal — وسيدخل المبلغ في حسابنا مباشرة."
          : "Pick a button below — Apple Pay, your card (mada/Visa/Mastercard), or PayPal balance — funds settle to our account directly."}
      </p>
    </div>
  );
}

function Chip({ children, border }) {
  return (
    <div
      className="inline-flex items-center justify-center h-9 px-3 rounded-lg border bg-white shadow-sm"
      style={{ borderColor: border || "#e2e8f0", minWidth: 56 }}
    >
      {children}
    </div>
  );
}

function ApplePayLogo() {
  return (
    <Chip border="#000000">
      <svg width="60" height="20" viewBox="0 0 60 20" aria-label="Apple Pay">
        <path d="M9 7c1.2 0 2-0.9 2-2 0-1.2-0.9-2-2-2-1.1 0-2 0.9-2 2 0 1.1 0.9 2 2 2zM4 8c-1.4 0-2.5 1.1-2.5 2.7 0 1.9 1.7 4.6 3.4 4.6 0.8 0 1.2-0.5 2.1-0.5 0.9 0 1.3 0.5 2.1 0.5 1.7 0 3.4-2.7 3.4-4.6 0-1.6-1.1-2.7-2.5-2.7-0.9 0-1.8 0.6-2.1 0.6-0.3 0-1.2-0.6-2-0.6z" transform="translate(1 0)" fill="#000" />
        <text x="34" y="15" fontSize="12" fontWeight="800" fontFamily="-apple-system, 'Helvetica Neue', sans-serif" fill="#000">Pay</text>
      </svg>
    </Chip>
  );
}

function MadaLogo() {
  return (
    <Chip bg="#fff" border="#16a34a33">
      <svg width="52" height="18" viewBox="0 0 52 18" aria-label="mada">
        <rect x="0" y="2" width="52" height="14" rx="3" fill="#1B8F4E" />
        <text x="26" y="13" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.5">mada</text>
      </svg>
    </Chip>
  );
}

function VisaLogo() {
  return (
    <Chip bg="#fff" border="#1a1f71">
      <svg width="48" height="18" viewBox="0 0 48 18" aria-label="Visa">
        <text x="24" y="14" textAnchor="middle" fill="#1A1F71" fontSize="13" fontWeight="800" fontStyle="italic" fontFamily="sans-serif" letterSpacing="0.5">VISA</text>
      </svg>
    </Chip>
  );
}

function MastercardLogo() {
  return (
    <Chip bg="#fff" border="#eb001b33">
      <svg width="40" height="18" viewBox="0 0 40 18" aria-label="Mastercard">
        <circle cx="15" cy="9" r="7" fill="#EB001B" />
        <circle cx="25" cy="9" r="7" fill="#F79E1B" />
        <path d="M20 3.5a7 7 0 0 0 0 11 7 7 0 0 0 0-11z" fill="#FF5F00" />
      </svg>
    </Chip>
  );
}

function PayPalLogo() {
  return (
    <Chip bg="#fff" border="#00308733">
      <svg width="60" height="18" viewBox="0 0 60 18" aria-label="PayPal">
        <text x="30" y="14" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="sans-serif" fontStyle="italic">
          <tspan fill="#003087">Pay</tspan><tspan fill="#009CDE">Pal</tspan>
        </text>
      </svg>
    </Chip>
  );
}