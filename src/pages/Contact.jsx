import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { Mail, MessageCircle, MapPin, Send, ArrowLeft, ShieldCheck } from "lucide-react";

const WHATSAPP = "https://wa.me/966594700782";
const SALES_EMAIL = "sales@jadara.sa";

export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`رسالة من ${f.name || "زائر"} عبر موقع جدارة`);
    const body = encodeURIComponent(`${f.message}\n\nالاسم: ${f.name}\nالبريد: ${f.email}`);
    window.location.href = `mailto:${SALES_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white antialiased" dir="rtl">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/"><Logo tone="light" size={40} /></Link>
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <Link to="/about" className="hover:text-white transition">من نحن</Link>
            <Link to="/login?returnTo=/app" className="hover:text-white transition">تسجيل الدخول</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-14">
        <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80 mb-4">
            <ShieldCheck size={14} className="text-violet-300" /> نحن هنا لمساعدتك
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>تواصل معنا</h1>
          <p className="text-white/70 mt-3 text-lg leading-relaxed max-w-2xl">
            يسعدنا تواصلك مع فريق جدارة لأي استفسار حول المنصة، الباقات، أو تفعيل تجربتك المجانية. اختر الوسيلة الأنسب لك وسنرد عليك في أقرب وقت.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-400/20 rounded-3xl p-6 text-center transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3"><MessageCircle size={22} className="text-emerald-300" /></div>
            <div className="font-semibold">واتساب مباشر</div>
            <div className="text-white/60 text-sm mt-1" dir="ltr">+966 594700782</div>
          </a>
          <a href={`mailto:${SALES_EMAIL}`} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-6 text-center transition">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-3"><Mail size={22} className="text-violet-200" /></div>
            <div className="font-semibold">البريد الإلكتروني</div>
            <div className="text-white/60 text-sm mt-1" dir="ltr">{SALES_EMAIL}</div>
          </a>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3"><MapPin size={22} className="text-blue-200" /></div>
            <div className="font-semibold">الموقع</div>
            <div className="text-white/60 text-sm mt-1">المملكة العربية السعودية</div>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 mt-10 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/60">الاسم</label>
              <input value={f.name} onChange={(e) => set("name", e.target.value)} required
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/50" placeholder="اسمك الكامل" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/60">البريد الإلكتروني</label>
              <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} required
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/50" placeholder="name@example.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/60">رسالتك</label>
            <textarea value={f.message} onChange={(e) => set("message", e.target.value)} required rows={4}
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/50" placeholder="كيف يمكننا مساعدتك؟" />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-xl shadow-violet-500/30 transition">
            <Send size={18} /> إرسال الرسالة
          </button>
          <p className="text-white/40 text-xs text-center">ستفتح رسالتك عبر تطبيق البريد الإلكتروني لديك مباشرةً</p>
        </form>
      </main>

      <footer className="border-t border-white/10 mt-10">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/55">
          <Link to="/"><Logo tone="light" size={36} /></Link>
          <Link to="/" className="hover:text-white inline-flex items-center gap-1.5"><ArrowLeft size={14} /> العودة للرئيسية</Link>
          <div>© 2027 جدارة — جميع الحقوق محفوظة</div>
        </div>
      </footer>
    </div>
  );
}