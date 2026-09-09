import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import AirportCombobox from "@/components/flights/AirportCombobox";
import { FLIGHT_PROVIDERS, buildFlightSearchUrl } from "@/lib/flightDeepLinks";
import { findAirport, airportLabel } from "@/lib/airports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, PlaneTakeoff, ArrowRight, Search, Minus, Plus, Info, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function Stepper({ value, onChange, min = 0, max = 9, label }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-violet-200 bg-white">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center hover:bg-violet-200 disabled:opacity-40"
          disabled={value <= min}>
          <Minus size={15} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-slate-800">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center hover:bg-violet-200 disabled:opacity-40"
          disabled={value >= max}>
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

function ProviderCard({ providerKey, onSelect, isAr }) {
  const p = FLIGHT_PROVIDERS[providerKey];
  return (
    <button
      type="button"
      onClick={() => onSelect(providerKey)}
      className="group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: p.brand + "40", background: `linear-gradient(160deg, ${p.brand}0d, ${p.brand}1a)` }}
    >
      <div className="h-16 flex items-center justify-center px-6 rounded-xl bg-white shadow-sm border" style={{ borderColor: p.brand + "22" }}>
        <img src={p.logo} alt={isAr ? p.name : p.nameEn} className="max-h-12 w-auto object-contain" />
      </div>
      <div className="text-center">
        <div className="text-2xl font-extrabold" style={{ color: p.brand }}>
          {isAr ? p.name : p.nameEn}
        </div>
        <div className="text-sm text-slate-500 mt-1">
          {isAr ? "حجز الطيران عبر " + p.name : "Book via " + p.nameEn}
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 group-hover:text-slate-900">
        {isAr ? "اختيار" : "Select"} <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" style={{ transform: "scaleX(-1)" }} />
      </span>
    </button>
  );
}

export default function FlightBookings() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [provider, setProvider] = useState(null);
  const [tripType, setTripType] = useState("oneway");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabin, setCabin] = useState("economy");
  const [errors, setErrors] = useState({});

  const t = isAr ? {
    title: "حجوزات الطيران",
    subtitle: "ابحث عن رحلات الطيران داخل منصة جدارة، ثم أكمِل الحجز والدفع مباشرة على موقع المزوّد المختار.",
    pick: "اختر مزوّد الحجز",
    pickSub: "ستنتقل إلى موقع المزوّد لإتمام الحجز والدفع. جدارة لا تتلقى أي مبالغ ولا تتحمل مسؤولية الحجز.",
    back: "تغيير المزوّد",
    tripType: "نوع الرحلة",
    oneway: "ذهاب فقط",
    round: "ذهاب وعودة",
    origin: "مطار المغادرة",
    destination: "مطار الوصول",
    depart: "تاريخ المغادرة",
    return: "تاريخ العودة",
    passengers: "الركاب",
    adults: "بالغ",
    children: "طفل (2-11)",
    infants: "رضيع (<2)",
    cabin: "درجة السفر",
    economy: "اقتصادية",
    business: "أعمال",
    first: "درجة أولى",
    search: "بحث عن الرحلات",
    errOrigin: "اختر مطار المغادرة",
    errDest: "اختر مطار الوصول",
    errSame: "لا يمكن أن يكون المطاران متطابقين",
    errDepart: "اختر تاريخ المغادرة",
    errReturn: "اختر تاريخ العودة",
    noteTitleAuto: "نتائج فورية",
    noteBodyAuto: "عند الضغط على «بحث» تُفتح نافذة جديدة لصفحة نتائج الرحلات لدى المسافر مع تعبئة بياناتك تلقائياً — استعرض الرحلات وأكمل الحجز والدفع مباشرةً هناك.",
    noteTitleManual: "ملاحظة مهمة",
    noteBodyManual: "عند الضغط على «بحث» تُفتح نافذة جديدة لصفحة البحث في المطار. نظراً لأن المطار لا يدعم التعبئة التلقائية عبر الرابط، راجِع «ملخص البحث» بجوارك وانسخ منه المطارات والتاريخ والركاب والدرجة، ثم أدخلها في نموذج المطار وابحث.",
    summary: "ملخص البحث",
    opened: "تم فتح موقع المزوّد في نافذة جديدة",
  } : {
    title: "Flight Bookings",
    subtitle: "Search flights inside Jadara, then complete booking and payment directly on the chosen provider's site.",
    pick: "Choose booking provider",
    pickSub: "You'll be redirected to the provider's site to complete booking and payment. Jadara does not collect funds and is not responsible for the booking.",
    back: "Change provider",
    tripType: "Trip type",
    oneway: "One-way",
    round: "Round-trip",
    origin: "Departure airport",
    destination: "Destination airport",
    depart: "Departure date",
    return: "Return date",
    passengers: "Passengers",
    adults: "Adults",
    children: "Children (2-11)",
    infants: "Infants (<2)",
    cabin: "Cabin class",
    economy: "Economy",
    business: "Business",
    first: "First",
    search: "Search flights",
    errOrigin: "Select departure airport",
    errDest: "Select destination airport",
    errSame: "Airports cannot be the same",
    errDepart: "Select departure date",
    errReturn: "Select return date",
    noteTitleAuto: "Instant results",
    noteBodyAuto: "Clicking 'Search' opens Almosafer's flight results page in a new tab with your data pre-filled — browse flights and complete booking and payment directly there.",
    noteTitleManual: "Important note",
    noteBodyManual: "Clicking 'Search' opens Almatar's search page in a new tab. Since Almatar doesn't support auto-fill via URL, refer to the 'Search summary' next to you and copy the airports, date, passengers, and cabin into Almatar's form, then search.",
    summary: "Search summary",
    opened: "Provider site opened in a new tab",
  };

  const handleSearch = () => {
    const e = {};
    if (!origin) e.origin = t.errOrigin;
    if (!destination) e.destination = t.errDest;
    if (origin && destination && origin === destination) e.same = t.errSame;
    if (!departDate) e.depart = t.errDepart;
    if (tripType === "round" && !returnDate) e.return = t.errReturn;
    setErrors(e);
    if (Object.keys(e).length) return;
    const url = buildFlightSearchUrl(provider, {
      origin, destination, departDate, returnDate,
      adults, children, infants, cabin, tripType,
    });
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!provider) {
    return (
      <div>
        <PageHeader title={t.title} subtitle={t.subtitle} />
        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 mb-6 flex items-start gap-3">
          <Info className="text-violet-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-slate-600 leading-relaxed">{t.pickSub}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
          <ProviderCard providerKey="almatar" onSelect={setProvider} isAr={isAr} />
          <ProviderCard providerKey="almosafer" onSelect={setProvider} isAr={isAr} />
        </div>
      </div>
    );
  }

  const p = FLIGHT_PROVIDERS[provider];
  const brand = p.brand;

  return (
    <div className="relative">
      {/* علامة مائية بشعار المزوّد تملأ الصفحة */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${p.logo})`,
          backgroundRepeat: "repeat",
          backgroundSize: "300px",
          opacity: 0.06,
        }}
        aria-hidden="true"
      />
      {/* نسخة كبيرة مركزية من الشعار */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0" aria-hidden="true">
        <img src={p.logo} alt="" className="w-[520px] max-w-[70%] opacity-[0.07]" style={{ transform: "rotate(-6deg)" }} />
      </div>

      <div className="relative z-10">
        <PageHeader
          title={t.title}
          subtitle={t.subtitle}
          action={
            <Button variant="outline" onClick={() => setProvider(null)} className="gap-2">
              <ArrowRight size={16} style={{ transform: "scaleX(-1)" }} /> {t.back}
            </Button>
          }
        />

        {/* رأس المزوّد */}
        <div className="flex items-center gap-3 mb-6 rounded-2xl p-4 border bg-white/90" style={{ borderColor: brand + "40" }}>
          <div className="h-12 px-3 rounded-xl flex items-center justify-center bg-white border shrink-0" style={{ borderColor: brand + "22" }}>
            <img src={p.logo} alt={isAr ? p.name : p.nameEn} className="max-h-9 w-auto object-contain" />
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: brand }}>{isAr ? p.name : p.nameEn}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <ExternalLink size={12} /> {p.site}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* النموذج */}
          <div className="lg:col-span-2 rounded-2xl border border-violet-200 bg-white/90 p-6 space-y-5">
            {/* نوع الرحلة */}
            <div>
              <Label className="mb-2 block">{t.tripType}</Label>
              <div className="grid grid-cols-2 gap-2">
                {[["oneway", t.oneway], ["round", t.round]].map(([k, label]) => (
                  <button key={k} type="button" onClick={() => setTripType(k)}
                    className={cn("h-11 rounded-lg border text-sm font-semibold transition-all",
                      tripType === k ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-violet-200 hover:bg-violet-50")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* المطارات */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">{t.origin}</Label>
                <AirportCombobox value={origin} onChange={(v) => { setOrigin(v); setErrors((x) => ({ ...x, origin: "", same: "" })); }}
                  placeholder={isAr ? "ابحث عن مدينة أو كود مطار" : "Search city or airport code"} lang={lang} error={errors.origin || errors.same} />
                {(errors.origin || errors.same) && <p className="text-xs text-rose-500 mt-1">{errors.origin || errors.same}</p>}
              </div>
              <div>
                <Label className="mb-2 block">{t.destination}</Label>
                <AirportCombobox value={destination} onChange={(v) => { setDestination(v); setErrors((x) => ({ ...x, destination: "", same: "" })); }}
                  placeholder={isAr ? "ابحث عن مدينة أو كود مطار" : "Search city or airport code"} lang={lang} error={errors.destination || errors.same} />
                {(errors.destination || errors.same) && <p className="text-xs text-rose-500 mt-1">{errors.destination || errors.same}</p>}
              </div>
            </div>

            {/* التواريخ */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">{t.depart}</Label>
                <Input type="date" min={todayStr()} value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="h-11" />
                {errors.depart && <p className="text-xs text-rose-500 mt-1">{errors.depart}</p>}
              </div>
              {tripType === "round" && (
                <div>
                  <Label className="mb-2 block">{t.return}</Label>
                  <Input type="date" min={departDate || todayStr()} value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="h-11" />
                  {errors.return && <p className="text-xs text-rose-500 mt-1">{errors.return}</p>}
                </div>
              )}
            </div>

            {/* الركاب */}
            <div>
              <Label className="mb-2 block">{t.passengers}</Label>
              <div className="grid sm:grid-cols-3 gap-2">
                <Stepper value={adults} onChange={setAdults} min={1} max={9} label={t.adults} />
                <Stepper value={children} onChange={setChildren} min={0} max={9} label={t.children} />
                <Stepper value={infants} onChange={setInfants} min={0} max={4} label={t.infants} />
              </div>
            </div>

            {/* الدرجة */}
            <div>
              <Label className="mb-2 block">{t.cabin}</Label>
              <div className="grid grid-cols-3 gap-2">
                {[["economy", t.economy], ["business", t.business], ["first", t.first]].map(([k, label]) => (
                  <button key={k} type="button" onClick={() => setCabin(k)}
                    className={cn("h-11 rounded-lg border text-sm font-semibold transition-all",
                      cabin === k ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-violet-200 hover:bg-violet-50")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full h-12 text-base font-semibold gap-2">
              <Search size={18} /> {t.search}
            </Button>
          </div>

          {/* ملخص + ملاحظة */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-violet-200 bg-white/90 p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <PlaneTakeoff size={16} className="text-violet-600" /> {t.summary}
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">{t.origin}</dt>
                  <dd className="font-semibold text-slate-700 text-left">{origin ? airportLabel(findAirport(origin), lang) : "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">{t.destination}</dt>
                  <dd className="font-semibold text-slate-700 text-left">{destination ? airportLabel(findAirport(destination), lang) : "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">{t.depart}</dt>
                  <dd className="font-semibold text-slate-700 text-left" dir="ltr">{departDate || "—"}</dd>
                </div>
                {tripType === "round" && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-400">{t.return}</dt>
                    <dd className="font-semibold text-slate-700 text-left" dir="ltr">{returnDate || "—"}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">{t.passengers}</dt>
                  <dd className="font-semibold text-slate-700 text-left">{adults + children + infants}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">{t.cabin}</dt>
                  <dd className="font-semibold text-slate-700">{t[cabin]}</dd>
                </div>
              </dl>
            </div>

            <div className={cn("rounded-2xl border p-4 flex items-start gap-3",
              p.deepLinkSupported ? "border-emerald-200 bg-emerald-50/80" : "border-amber-200 bg-amber-50/80")}>
              <Info className={cn("shrink-0 mt-0.5", p.deepLinkSupported ? "text-emerald-600" : "text-amber-600")} size={18} />
              <div>
                <p className={cn("text-sm font-bold", p.deepLinkSupported ? "text-emerald-700" : "text-amber-700")}>
                  {p.deepLinkSupported ? t.noteTitleAuto : t.noteTitleManual}
                </p>
                <p className={cn("text-xs leading-relaxed mt-1", p.deepLinkSupported ? "text-emerald-700/90" : "text-amber-700/90")}>
                  {p.deepLinkSupported ? t.noteBodyAuto : t.noteBodyManual}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}