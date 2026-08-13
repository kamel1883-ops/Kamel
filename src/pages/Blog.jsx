import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Clock, Zap, MessageCircle } from "lucide-react";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";

const WHATSAPP = "https://wa.me/966594700782";

const CAT_AR = {
  labor_law: "القانون العمالي", payroll: "الرواتب وحماية الأجور", attendance: "الحضور والإجازات",
  eos: "نهاية الخدمة", hr_management: "إدارة الموارد البشرية", saudization: "السعودة",
  contracts: "العقود واللوائح", general: "عام",
};
const CAT_EN = {
  labor_law: "Labor Law", payroll: "Payroll & WPS", attendance: "Attendance & Leave",
  eos: "End of Service", hr_management: "HR Management", saudization: "Saudization",
  contracts: "Contracts & Policies", general: "General",
};

export default function Blog() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const payload = { action: "list" };
        if (cat) payload.category = cat;
        const res = await base44.functions.invoke("blogPublic", payload);
        setArticles(res.data.articles || []);
        setFeatured(cat ? null : res.data.featured || null);
      } catch (e) {
        setErr(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [cat]);

  useEffect(() => {
    const arDesc = "مدونة جدارة للموارد البشرية والقانون العمالي السعودي 2026 — مقالات عملية لمدراء الموارد البشرية وأصحاب المنشآت: حماية الأجور (مدد/WPS)، نهاية الخدمة، الإجازات، السعودة ونطاقات، التأمينات الاجتماعية (GOSI)، ودعم المنشآت (هدف/Hadaf)، والعقود واللوائح، والامتثال لنظام العمل السعودي.";
    const enDesc = "Jadara blog on Saudi HR and labor law (2026): practical guides for HR managers and business owners — Wage Protection (Mudad/WPS), end of service, leave, Saudization (Nitaqat), GOSI, HRDF (Hadaf) subsidies, contracts, and Saudi Labor Law compliance.";
    const arKeywords = "مدونة الموارد البشرية, القانون العمالي السعودي, نظام العمل السعودي, حماية الأجور, مدد, WPS, نهاية الخدمة, السعودة, نطاقات, التأمينات الاجتماعية, جوسي, GOSI, هدف, هدف, إدارة الموارد البشرية, الإجازات, الرواتب, العقود واللوائح, الامتثال, HR Saudi Arabia, Saudi labor law, HR blog, جدارة";
    const enKeywords = "Saudi HR blog, Saudi labor law blog, HR Saudi Arabia, WPS, Mudad, end of service Saudi, Saudization, Nitaqat, GOSI Saudi, HRDF, Hadaf, HR compliance KSA, Jadara blog, HR articles Saudi Arabia, Saudi payroll";
    const url = "https://jadara-hr.com/blog";
    const img = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/4d935b232_generated_image.png";

    document.title = isAr ? "مدونة الموارد البشرية والقانون العمالي السعودي 2026 | جدارة" : "Saudi HR & Labor Law Blog 2026 | Jadara";
    setMeta("description", isAr ? arDesc : enDesc);
    setMeta("keywords", isAr ? arKeywords : enKeywords);
    setMeta("robots", "index, follow, max-image-preview:large");
    setMeta("author", "جدارة لإدارة الموارد البشرية");
    setProp("og:title", document.title);
    setProp("og:description", isAr ? arDesc : enDesc);
    setProp("og:type", "website");
    setProp("og:locale", isAr ? "ar_SA" : "en_US");
    setProp("og:site_name", "جدارة");
    setProp("og:url", url);
    setProp("og:image", img);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", document.title);
    setMeta("twitter:description", isAr ? arDesc : enDesc);
    setMeta("twitter:image", img);
    setLink("canonical", url);
    setJsonLd("blog-schema", {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: isAr ? "مدونة جدارة للموارد البشرية" : "Jadara HR Blog",
      description: isAr ? arDesc : enDesc,
      url,
      inLanguage: isAr ? "ar-SA" : "en-US",
      publisher: { "@type": "Organization", name: "جدارة", logo: { "@type": "ImageObject", url: img } },
      blogPost: articles.slice(0, 12).map((a) => ({
        "@type": "BlogPosting",
        headline: a.title,
        description: a.excerpt || "",
        datePublished: a.published_date || undefined,
        author: { "@type": "Organization", name: a.author_name || "جدارة" },
        url: `https://jadara-hr.com/blog/${a.slug}`,
      })),
    });
  }, [isAr, articles]);

  const cats = isAr ? CAT_AR : CAT_EN;
  const t = isAr ? {
    badge: "مدونة جدارة", title: "مدونة الموارد البشرية والقانون العمالي السعودي",
    subtitle: "مقالات عملية لمدراء الموارد البشرية وأصحاب المنشآت — حماية الأجور (مدد)، نهاية الخدمة، الإجازات، والامتثال للأنظمة.",
    all: "كل التصنيفات", read: "اقرأ المقال", empty: "لا توجد مقالات بعد.",
    featured: "مقال مميّز",
    ctaTitle: "حوّل معرفتك إلى أتمتة", ctaDesc: "ابدأ تجربتك المجانية على جدارة لمدة 30 يوماً — بدون بطاقة ائتمان.", ctaBtn: "جرّب مجاناً",
  } : {
    badge: "Jadara Blog", title: "Saudi HR & Labor Law Blog",
    subtitle: "Practical articles for HR managers and business owners — Wage Protection (Mudad), end of service, leave, and regulatory compliance.",
    all: "All categories", read: "Read article", empty: "No articles yet.",
    featured: "Featured",
    ctaTitle: "Turn knowledge into automation", ctaDesc: "Start your 30-day free trial on Jadara — no credit card.", ctaBtn: "Try free",
  };

  return (
    <div className="min-h-screen bg-[#0a0c14] text-white antialiased" dir={isAr ? "rtl" : "ltr"}>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/25 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Logo tone="light" size={42} /></Link>
          <nav className="hidden md:flex items-center gap-5 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition">{isAr ? "الرئيسية" : "Home"}</Link>
            <Link to="/quote" className="hover:text-white transition">{isAr ? "عرض السعر" : "Quote"}</Link>
            <Link to="/about" className="hover:text-white transition">{isAr ? "من نحن" : "About"}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/quote" className="text-sm bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 px-4 py-2 rounded-xl font-medium shadow-lg shadow-violet-500/30 transition inline-flex items-center gap-1.5">
              <Zap size={15} /> {isAr ? "ابدأ الآن" : "Get Started"}
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-5 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80 mb-5">{t.badge}</div>
        <h1 className="text-3xl sm:text-5xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{t.title}</h1>
        <p className="text-white/70 text-lg mt-5 max-w-3xl mx-auto leading-relaxed">{t.subtitle}</p>
      </section>

      <section className="max-w-7xl mx-auto px-5 pb-6">
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => setCat(null)} className={`text-sm px-4 py-2 rounded-full border transition ${!cat ? "bg-[#452a7a] text-white border-transparent shadow-lg shadow-violet-900/40" : "bg-[#1a1e2a] text-[#a0a0a0] border-[#2f3342] hover:text-white hover:border-[#452a7a]"}`}>{t.all}</button>
          {Object.entries(cats).map(([k, v]) => (
            <button key={k} onClick={() => setCat(k)} className={`text-sm px-4 py-2 rounded-full border transition whitespace-nowrap ${cat === k ? "bg-[#452a7a] text-white border-transparent shadow-lg shadow-violet-900/40" : "bg-[#1a1e2a] text-[#a0a0a0] border-[#2f3342] hover:text-white hover:border-[#452a7a]"}`}>{v}</button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 pb-14">
        {loading ? (
          <div className="py-20 text-center text-white/50"><Loader2 className="animate-spin mx-auto" size={28} /></div>
        ) : err ? (
          <div className="py-20 text-center text-rose-300">{err}</div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center text-white/50">{t.empty}</div>
        ) : (
          <>
            {featured && !cat && (
              <Link to={`/blog/${featured.slug}`} className="group block mb-8">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 grid lg:grid-cols-2">
                  <div className="relative h-56 lg:h-auto">
                    <img src={featured.cover_image_url || "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80"} alt={featured.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-[#0b1120] via-[#0b1120]/40 to-transparent" />
                  </div>
                  <div className="p-7 sm:p-10 bg-[#0f1322]">
                    <div className="inline-flex items-center gap-1.5 bg-violet-500/15 border border-violet-400/25 text-violet-200 rounded-full px-3 py-1 text-xs mb-4">{t.featured} • {cats[featured.category]}</div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold group-hover:text-violet-200 transition" style={{ fontFamily: "var(--font-display)" }}>{featured.title}</h2>
                    <p className="text-white/65 mt-3 leading-relaxed">{featured.excerpt}</p>
                    <div className="flex items-center gap-3 mt-5 text-xs text-white/50">
                      {featured.author_name && <span>{featured.author_name}</span>}
                      {featured.published_date && <span>• {featured.published_date}</span>}
                      <span className="inline-flex items-center gap-1"><Clock size={12} /> {featured.reading_minutes || 3} {isAr ? "د" : "min"}</span>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-1.5 text-violet-300 text-sm font-medium">{t.read} <ArrowLeft size={16} style={{ transform: isAr ? "none" : "scaleX(-1)" }} /></div>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((a) => (
                <motion.div key={a.id} initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
                  <Link to={`/blog/${a.slug}`} className="group block h-full bg-[#13161f] hover:bg-[#171b29] border border-white/10 rounded-3xl overflow-hidden transition hover:-translate-y-1">
                    <div className="h-40 overflow-hidden">
                      <img src={a.cover_image_url || "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="p-5">
                      <div className="text-xs text-violet-300 mb-2">{cats[a.category]}</div>
                      <h3 className="font-bold text-lg leading-snug group-hover:text-violet-200 transition">{a.title}</h3>
                      <p className="text-white/55 text-sm mt-2 leading-relaxed line-clamp-3">{a.excerpt}</p>
                      <div className="flex items-center gap-2 mt-4 text-xs text-white/40">
                        {a.published_date && <span>{a.published_date}</span>}
                        <span className="inline-flex items-center gap-1"><Clock size={12} /> {a.reading_minutes || 3} {isAr ? "د" : "min"}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-14">
        <div className="relative overflow-hidden rounded-[2rem] border border-violet-400/30 bg-gradient-to-l from-violet-600/25 via-indigo-600/15 to-blue-600/25 p-8 sm:p-10 text-center">
          <div className="absolute -top-12 -left-12 w-60 h-60 rounded-full bg-violet-500/20 blur-3xl" />
          <h2 className="relative text-2xl sm:text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{t.ctaTitle}</h2>
          <p className="relative text-white/70 mt-3 max-w-2xl mx-auto">{t.ctaDesc}</p>
          <div className="relative flex flex-wrap justify-center gap-3 mt-7">
            <Link to="/quote" className="bg-white text-[#0b1120] hover:bg-white/90 px-6 py-3.5 rounded-2xl font-semibold shadow-xl inline-flex items-center gap-2 transition"><Zap size={18} /> {t.ctaBtn}</Link>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/15 border border-white/15 px-6 py-3.5 rounded-2xl font-medium inline-flex items-center gap-2 transition"><MessageCircle size={18} /> {isAr ? "واتساب مباشر" : "WhatsApp"}</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
  el.setAttribute("content", content);
}

function setProp(prop, content) {
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
  el.setAttribute("href", href);
}

function setJsonLd(id, obj) {
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("script"); el.id = id; el.setAttribute("type", "application/ld+json"); document.head.appendChild(el); }
  el.textContent = JSON.stringify(obj);
}