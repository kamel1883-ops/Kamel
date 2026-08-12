import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { base44 } from "@/api/base44Client";
import TurnstileWidget from "@/components/TurnstileWidget";
import { useI18n } from "@/lib/i18n";
import { Mail, MessageCircle, MapPin, Send, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";

const WHATSAPP = "https://wa.me/966594700782";
const SALES_EMAIL = "info@jadara-hr.com";

export default function Contact() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    dir: "rtl", navAbout: "من نحن", navLogin: "تسجيل الدخول",
    badge: "نحن هنا لمساعدتك", h1: "تواصل معنا",
    intro: "يسعدنا تواصلك مع فريق جدارة لأي استفسار حول المنصة، الباقات، أو تفعيل تجربتك المجانية. اختر الوسيلة الأنسب لك وسنرد عليك في أقرب وقت.",
    wa: "واتساب مباشر", email: "البريد الإلكتروني", loc: "الموقع", locVal: "السعودية - الرياض - المركز المالي KAFD",
    sending: "جارٍ الإرسال…", sent: "تم إرسال رسالتك بنجاح، سنرد عليك قريباً.", failed: "تعذّر الإرسال، حاول مرة أخرى أو راسلنا مباشرة عبر واتساب.",
    name: "الاسم", namePh: "اسمك الكامل", emailL: "البريد الإلكتروني", msg: "رسالتك", msgPh: "كيف يمكننا مساعدتك؟", send: "إرسال الرسالة",
    note: "ستصل رسالتك مباشرةً إلى فريق جدارة وسيتم الرد عليك عبر بريدك الإلكتروني.",
    home: "العودة للرئيسية", copy: "© 2027 جدارة — جميع الحقوق محفوظة",
    subject: (n) => `رسالة من ${n || "زائر"} عبر موقع جدارة`, body: (f) => `${f.message}\n\nالاسم: ${f.name}\nالبريد: ${f.email}`,
  } : {
    dir: "ltr", navAbout: "About", navLogin: "Sign in",
    badge: "We're here to help", h1: "Contact us",
    intro: "We're happy to hear from the Jadara team for any inquiry about the platform, plans, or activating your free trial. Pick the channel that suits you and we'll reply shortly.",
    wa: "WhatsApp directly", email: "Email", loc: "Location", locVal: "Saudi Arabia - Riyadh - KAFD Financial Center",
    sending: "Sending…", sent: "Your message was sent successfully. We'll reply soon.", failed: "Could not send. Please try again or reach us via WhatsApp.",
    name: "Name", namePh: "Your full name", emailL: "Email", msg: "Your message", msgPh: "How can we help?", send: "Send message",
    note: "Your message will go directly to the Jadara team and we'll reply by email.",
    home: "Back home", copy: "© 2027 Jadara — All rights reserved",
    subject: (n) => `Message from ${n || "a visitor"} via Jadara site`, body: (f) => `${f.message}\n\nName: ${f.name}\nEmail: ${f.email}`,
  };

  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | failed
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      await base44.functions.invoke("submitContactMessage", {
        name: f.name,
        email: f.email,
        message: f.message,
        captcha_token: captcha,
      });
      setStatus("sent");
      setF({ name: "", email: "", message: "" });
      setCaptcha("");
      setCaptchaKey((k) => k + 1);
    } catch (err) {
      setStatus("failed");
      setCaptcha("");
      setCaptchaKey((k) => k + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white antialiased" dir={t.dir}>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/"><Logo tone="light" size={40} /></Link>
          <nav className="flex items-center gap-3 text-sm text-white/70">
            <LanguageToggle />
            <Link to="/about" className="hover:text-white transition">{t.navAbout}</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-14">
        <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80 mb-4">
            <ShieldCheck size={14} className="text-violet-300" /> {t.badge}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{t.h1}</h1>
          <p className="text-white/70 mt-3 text-lg leading-relaxed max-w-2xl">{t.intro}</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-400/20 rounded-3xl p-6 text-center transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3"><MessageCircle size={22} className="text-emerald-300" /></div>
            <div className="font-semibold">{t.wa}</div>
            <div className="text-white/60 text-sm mt-1" dir="ltr">+966 594700782</div>
          </a>
          <a href={`mailto:${SALES_EMAIL}`} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-6 text-center transition">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-3"><Mail size={22} className="text-violet-200" /></div>
            <div className="font-semibold">{t.email}</div>
            <div className="text-white/60 text-sm mt-1" dir="ltr">{SALES_EMAIL}</div>
          </a>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3"><MapPin size={22} className="text-blue-200" /></div>
            <div className="font-semibold">{t.loc}</div>
            <div className="text-white/60 text-sm mt-1">{t.locVal}</div>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 mt-10 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/60">{t.name}</label>
              <input value={f.name} onChange={(e) => set("name", e.target.value)} required
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/50" placeholder={t.namePh} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/60">{t.emailL}</label>
              <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} required
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/50" placeholder="name@example.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/60">{t.msg}</label>
            <textarea value={f.message} onChange={(e) => set("message", e.target.value)} required rows={4}
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/50" placeholder={t.msgPh} />
          </div>
          <div className="flex justify-center">
            <TurnstileWidget key={captchaKey} onToken={setCaptcha} className="rounded-xl overflow-hidden" />
          </div>
          <button type="submit" disabled={status === "sending" || !captcha} className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 disabled:opacity-60 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-xl shadow-violet-500/30 transition">
            <Send size={18} /> {status === "sending" ? t.sending : t.send}
          </button>
          {status === "sent" && (
            <div className="flex items-center justify-center gap-2 text-emerald-300 text-sm">
              <CheckCircle2 size={16} /> {t.sent}
            </div>
          )}
          {status === "failed" && (
            <div className="flex items-center justify-center gap-2 text-rose-300 text-sm">{t.failed}</div>
          )}
          <p className="text-white/40 text-xs text-center">{t.note}</p>
        </form>
      </main>

      <footer className="border-t border-white/10 mt-10">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/55">
          <Link to="/"><Logo tone="light" size={36} /></Link>
          <Link to="/" className="hover:text-white inline-flex items-center gap-1.5"><ArrowLeft size={14} style={{ transform: isAr ? "none" : "scaleX(-1)" }} /> {t.home}</Link>
          <div>{t.copy}</div>
        </div>
      </footer>
    </div>
  );
}