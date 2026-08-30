import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import TurnstileWidget from "@/components/TurnstileWidget";
import { Send, CheckCircle2 } from "lucide-react";

// نموذج الانضمام لبرنامج شركاء جدارة — يُرسل الطلب لبريد الفريق الرسمي
export default function AffiliateJoinForm({ isAr }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", channel: "", note: "" });
  const [status, setStatus] = useState("idle");
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    const message = isAr
      ? `طلب انضمام لبرنامج شركاء جدارة (عمولة 7% من أول اشتراك)\n\nالاسم: ${f.name}\nالبريد: ${f.email}\nالجوال: ${f.phone}\nقناة الترويج: ${f.channel}\n\nنبذة:\n${f.note}`
      : `Jadara affiliate program application (7% of first subscription)\n\nName: ${f.name}\nEmail: ${f.email}\nPhone: ${f.phone}\nPromotion channel: ${f.channel}\n\nAbout:\n${f.note}`;
    try {
      await base44.functions.invoke("submitContactMessage", { name: f.name, email: f.email, message, captcha_token: captcha });
      setStatus("sent");
      setF({ name: "", email: "", phone: "", channel: "", note: "" });
    } catch (err) {
      setStatus("failed");
    }
    setCaptcha("");
    setCaptchaKey((k) => k + 1);
  };

  const cls = "w-full bg-violet-50/50 border border-violet-200 rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-400/50";

  return (
    <form onSubmit={submit} className="bg-white border border-violet-100 rounded-3xl p-6 sm:p-8 space-y-4">
      <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        {isAr ? "انضم لبرنامج الشركاء" : "Join the affiliate program"}
      </h2>
      <p className="text-muted-foreground text-sm">
        {isAr ? "أرسل بياناتك وسيتواصل معك فريق جدارة لتزويدك برابط الإحالة الخاص بك واعتماد شراكتك." : "Send your details and the Jadara team will contact you with your referral link and approve your partnership."}
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <input value={f.name} onChange={(e) => set("name", e.target.value)} required className={cls} placeholder={isAr ? "الاسم الكامل *" : "Full name *"} />
        <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} required className={cls} placeholder={isAr ? "البريد الإلكتروني *" : "Email *"} />
        <input value={f.phone} onChange={(e) => set("phone", e.target.value)} required className={cls} placeholder={isAr ? "رقم الجوال *" : "Phone *"} dir="ltr" />
        <input value={f.channel} onChange={(e) => set("channel", e.target.value)} className={cls} placeholder={isAr ? "قناة الترويج (لينكدإن، إكس، شبكة علاقات…)" : "Promotion channel (LinkedIn, X, network…)"} />
      </div>
      <textarea value={f.note} onChange={(e) => set("note", e.target.value)} rows={3} className={cls}
        placeholder={isAr ? "نبذة عنك وعن جمهورك المستهدف" : "About you and your target audience"} />

      <div className="flex justify-center">
        <TurnstileWidget key={captchaKey} onToken={setCaptcha} className="rounded-xl overflow-hidden" />
      </div>
      <button type="submit" disabled={status === "sending" || !captcha}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-xl shadow-violet-600/30 transition">
        <Send size={18} /> {status === "sending" ? (isAr ? "جارٍ الإرسال…" : "Sending…") : (isAr ? "إرسال طلب الانضمام" : "Submit application")}
      </button>
      {status === "sent" && (
        <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm">
          <CheckCircle2 size={16} /> {isAr ? "تم إرسال طلبك، سنتواصل معك قريباً." : "Your application was sent. We'll contact you soon."}
        </div>
      )}
      {status === "failed" && (
        <div className="text-center text-rose-600 text-sm">{isAr ? "تعذّر الإرسال، حاول مرة أخرى." : "Could not send. Please try again."}</div>
      )}
    </form>
  );
}