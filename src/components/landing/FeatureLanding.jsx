import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowLeft, Zap, ChevronLeft, Mail, MessageCircle, Linkedin, Twitter } from "lucide-react";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

const WHATSAPP = "https://wa.me/966594700782";
const SALES_EMAIL = "info@jadara-hr.com";
const SOCIAL = {
  linkedin: "https://www.linkedin.com/company/%D8%AC%D8%AF%D8%A7%D8%B1%D8%A9-%D9%84%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%B1%D8%AF-%D8%A7%D9%84%D8%A8%D8%B4%D8%B1%D9%8A%D8%A9",
  twitter: "https://x.com/jadarahr",
};

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

// صفحة هبوط متخصصة بمحتوى موجه (SEO) — تُمرَّر عبر `content` ثمار وثنائية اللغة.
export default function FeatureLanding({ content }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const c = isAr ? content.ar : content.en;

  useEffect(() => {
    document.title = c.seo.title;
    setMeta("description", c.seo.description);
    setMeta("keywords", c.seo.keywords);
    setMetaProp("og:title", c.seo.title);
    setMetaProp("og:description", c.seo.description);
    setMetaProp("og:type", "website");
    setMetaProp("og:url", `https://jadara-hr.com${content.path}`);
    setLink("canonical", `https://jadara-hr.com${content.path}`);
  }, [c, content.path]);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white antialiased" dir={isAr ? "rtl" : "ltr"}>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      {/* شريط علوي */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo tone="light" size={42} />
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition">{isAr ? "الرئيسية" : "Home"}</Link>
            <Link to="/quote" className="hover:text-white transition">{isAr ? "عرض السعر" : "Quote"}</Link>
            <Link to="/about" className="hover:text-white transition">{isAr ? "من نحن" : "About"}</Link>
            <Link to="/contact" className="hover:text-white transition">{isAr ? "تواصل" : "Contact"}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/company-login" className="text-sm text-white/80 hover:text-white px-3 py-2 rounded-lg hidden sm:block">{isAr ? "بوابة الشركات" : "Company Portal"}</Link>
            <Link to="/quote" className="text-sm bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 px-4 py-2 rounded-xl font-medium shadow-lg shadow-violet-500/30 transition inline-flex items-center gap-1.5">
              <Zap size={15} /> {isAr ? "ابدأ الآن" : "Get Started"}
            </Link>
          </div>
        </div>
      </header>

      {/* فتاحة الموقع */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-12 text-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80 mb-5">
            {c.badge}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            {c.titlePre}{" "}
            <span className="bg-gradient-to-l from-violet-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent">{c.titleHi}</span>
          </h1>
          <p className="text-white/70 text-lg mt-6 max-w-3xl mx-auto leading-relaxed">{c.hero}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/quote" className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 px-6 py-3.5 rounded-2xl font-semibold shadow-xl shadow-violet-500/30 inline-flex items-center gap-2 transition">
              <Zap size={18} /> {c.ctaPrimary}
            </Link>
            <Link to="/" className="bg-white/10 hover:bg-white/15 border border-white/15 px-6 py-3.5 rounded-2xl font-medium transition inline-flex items-center gap-1.5">
              {isAr ? "كل المميزات" : "All features"} <ArrowLeft size={16} style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
            </Link>
          </div>
        </motion.div>

        {c.heroImg && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative mt-12 max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-blue-500/20 rounded-[2rem] blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
              <img src={c.heroImg} alt={c.titleHi} className="w-full h-[340px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent" />
            </div>
          </motion.div>
        )}
      </section>

      {/* نقاط الألم / الكلمات المفتاحية */}
      {c.painPoints?.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 py-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-7">
            <div className="font-semibold mb-3 text-white/90">{c.painTitle}</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {c.painPoints.map((p) => (
                <div key={p} className="flex items-start gap-2 text-sm text-white/80">
                  <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" /> <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* المميزات */}
      {c.features?.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80">{c.featuresTag}</div>
            <h2 className="text-3xl font-extrabold mt-4" style={{ fontFamily: "var(--font-display)" }}>{c.featuresTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.features.map((f) => {
              const I = f.icon;
              return (
                <motion.div key={f.t} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                  className="bg-[#13161f] hover:bg-[#171b29] border border-white/10 rounded-3xl p-6 transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#37376c] border border-white/10 flex items-center justify-center mb-4 shadow-lg shadow-indigo-950/50">
                    <I size={22} className="text-white" />
                  </div>
                  <div className="font-semibold text-lg">{f.t}</div>
                  <div className="text-white/60 text-sm mt-2 leading-relaxed">{f.d}</div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* خطوات العمل */}
      {c.steps?.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{c.stepsTitle}</h2>
          </div>
          <div className="space-y-4">
            {c.steps.map((s, i) => (
              <motion.div key={s.t} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="flex gap-4 items-start bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/20 flex items-center justify-center font-bold text-violet-200 shrink-0">{i + 1}</div>
                <div>
                  <div className="font-semibold">{s.t}</div>
                  <div className="text-white/60 text-sm mt-1 leading-relaxed">{s.d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* الأسئلة الشائعة */}
      {c.faqs?.length > 0 && (
        <section className="max-w-3xl mx-auto px-5 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{c.faqTitle}</h2>
          </div>
          <div className="space-y-3">
            {c.faqs.map((f) => (
              <details key={f.q} className="group bg-white/5 border border-white/10 rounded-2xl p-5">
                <summary className="cursor-pointer font-semibold flex items-center justify-between gap-2 list-none">
                  {f.q}
                  <ChevronLeft size={18} className="text-white/50 group-open:-rotate-45 transition shrink-0" style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
                </summary>
                <p className="text-white/60 text-sm mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* دعوة لاتخاذ إجراء */}
      <section className="max-w-5xl mx-auto px-5 py-14">
        <div className="relative overflow-hidden rounded-[2rem] border border-violet-400/30 bg-gradient-to-l from-violet-600/25 via-indigo-600/15 to-blue-600/25 p-8 sm:p-10 text-center">
          <div className="absolute -top-12 -left-12 w-60 h-60 rounded-full bg-violet-500/20 blur-3xl" />
          <h2 className="relative text-2xl sm:text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{c.ctaTitle}</h2>
          <p className="relative text-white/70 mt-3 max-w-2xl mx-auto">{c.ctaDesc}</p>
          <div className="relative flex flex-wrap justify-center gap-3 mt-7">
            <Link to="/quote" className="bg-white text-[#0b1120] hover:bg-white/90 px-6 py-3.5 rounded-2xl font-semibold shadow-xl inline-flex items-center gap-2 transition">
              <Zap size={18} /> {c.ctaPrimary}
            </Link>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/15 border border-white/15 px-6 py-3.5 rounded-2xl font-medium inline-flex items-center gap-2 transition">
              <MessageCircle size={18} /> {isAr ? "واتساب مباشر" : "WhatsApp"}
            </a>
          </div>
        </div>
      </section>

      {/* التذييل */}
      <footer className="border-t border-white/10 mt-6">
        <div className="max-w-7xl mx-auto px-5 py-10 grid sm:grid-cols-3 gap-8 text-sm text-white/60">
          <div>
            <div className="mb-2"><Logo tone="light" size={36} /></div>
            <p>{isAr ? "منصة الموارد البشرية السعودية المتكاملة." : "The integrated Saudi HR platform."}</p>
            <div className="flex items-center gap-2 mt-4">
              <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-colors"><Linkedin size={17} /></a>
              <a href={SOCIAL.twitter} target="_blank" rel="noreferrer" aria-label="X" className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-colors"><Twitter size={17} /></a>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="font-medium text-white mb-1">{isAr ? "تواصل معنا" : "Contact"}</div>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><MessageCircle size={14} /> WhatsApp: +966 594700782</a>
            <a href={`mailto:${SALES_EMAIL}`} className="flex items-center gap-2 hover:text-white"><Mail size={14} /> {SALES_EMAIL}</a>
          </div>
          <div className="space-y-1.5">
            <div className="font-medium text-white mb-1">{isAr ? "روابط المنصة" : "Platform"}</div>
            <Link to="/" className="block hover:text-white">{isAr ? "الرئيسية" : "Home"}</Link>
            <Link to="/quote" className="block hover:text-white">{isAr ? "عرض السعر" : "Quote"}</Link>
            <Link to="/about" className="block hover:text-white">{isAr ? "من نحن" : "About"}</Link>
            <Link to="/contact" className="block hover:text-white">{isAr ? "تواصل" : "Contact"}</Link>
          </div>
        </div>
        <div className="text-center text-white/40 text-xs pb-6">© 2027 {isAr ? "جدارة" : "Jadara"} — {isAr ? "جميع الحقوق محفوظة" : "All rights reserved"}</div>
      </footer>
    </div>
  );
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
function setMetaProp(prop, content) {
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
  el.setAttribute("href", href);
}