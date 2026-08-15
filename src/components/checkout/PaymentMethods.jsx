import React from "react";

// شريط خيارات الدفع المعتمدة — كلها تُحصّل عبر حساب PayPal (بطاقات مدى/فيزا/ماستركارد أو رصيد PayPal).
// الشعارات SVG مبسّطة عالية الوضوح، بدون اعتماد على مصادر خارجية.
export default function PaymentMethods({ lang = "ar" }) {
  const isAr = lang === "ar";
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">
        {isAr ? "طرق الدفع المقبولة (كلها عبر PayPal)" : "Accepted payment methods (all via PayPal)"}
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <MadaLogo />
        <VisaLogo />
        <MastercardLogo />
        <PayPalLogo />
      </div>
      <p className="text-[11px] text-muted-foreground text-center mt-2">
        {isAr
          ? "اختر زر PayPal بالأسفل، ثم ادفع ببطاقتك (مدى/فيزا/ماستركارد) أو حساب PayPal — المبلغ يُحوّل لحسابنا تلقائياً."
          : "Tap the PayPal button below, then pay with your card (mada/Visa/Mastercard) or PayPal balance — funds settle to our account automatically."}
      </p>
    </div>
  );
}

function Chip({ children, bg, border }) {
  return (
    <div
      className="inline-flex items-center justify-center h-9 px-3 rounded-lg border bg-white shadow-sm"
      style={{ borderColor: border || "#e2e8f0", minWidth: 56 }}
    >
      {children}
    </div>
  );
}

function MadaLogo() {
  // شعار مدى — أخضر (اللون الرسمي) مع كلمة mada
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