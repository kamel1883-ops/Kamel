import React from "react";
import { Plane } from "lucide-react";
import { FLIGHT_PROVIDERS } from "@/lib/flightDeepLinks";

/**
 * قسم عرض مزوّدي حجوزات الطيران الأربعة — يُستخدم في صفحة الهبوط.
 * يعرض شعارات المطار، المسافر، Skyscanner، Wingie مع لون هوية كل مزوّد.
 */
export default function FlightProviders({ isAr = true }) {
  const providers = ["almatar", "almosafer", "skyscanner", "wingie"].map((k) => FLIGHT_PROVIDERS[k]);

  const title = isAr ? "مزوّدو حجوزات الطيران" : "Flight Booking Providers";
  const sub = isAr
    ? "منصة جدارة توفر لك أكبر أربعة من مزوّدي الطيران الموثوقين — ابحث داخل جدارة وتُحوَّل للمزوّد لإكمال الحجز والدفع"
    : "Jadara brings you the four largest trusted flight providers — search inside Jadara, then redirect to the provider to complete booking and payment";

  return (
    <section className="max-w-[1600px] mx-auto px-6 lg:px-14 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 rounded-full px-3 py-1 text-sm text-violet-700 mb-3">
          <Plane size={14} /> {isAr ? "تكاملات السفر" : "Travel Integrations"}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h2>
        <p className="text-muted-foreground text-base mt-3 max-w-2xl mx-auto leading-relaxed">{sub}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {providers.map((p) => (
          <div
            key={p.key}
            className="group relative rounded-3xl border-2 p-6 flex flex-col items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
            style={{
              borderColor: p.brand + "30",
              background: `linear-gradient(160deg, ${p.brand}0d, ${p.brand}1a)`,
            }}
          >
            <div className="h-20 w-full flex items-center justify-center rounded-2xl overflow-hidden">
              <img
                src={p.logo}
                alt={isAr ? p.name : p.nameEn}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="text-center">
              <div className="text-lg font-extrabold" style={{ color: p.brand, fontFamily: "var(--font-display)" }}>
                {isAr ? p.name : p.nameEn}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {isAr ? "حجز الطيران عبر " + p.name : "Book flights via " + p.nameEn}
              </div>
            </div>
            {p.deepLinkSupported && (
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#16a34a1a", color: "#16a34a", border: "1px solid #16a34a30" }}>
                {isAr ? "روابط عميقة" : "Deep Links"}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}