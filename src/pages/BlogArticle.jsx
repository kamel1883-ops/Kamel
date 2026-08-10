import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowRight, Clock, Loader2, Zap, MessageCircle } from "lucide-react";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";

const WHATSAPP = "https://wa.me/966594700782";
const CAT_AR = { labor_law: "القانون العمالي", payroll: "الرواتب وحماية الأجور", attendance: "الحضور والإجازات", eos: "نهاية الخدمة", hr_management: "إدارة الموارد البشرية", saudization: "السعودة", contracts: "العقود واللوائح", general: "عام" };
const CAT_EN = { labor_law: "Labor Law", payroll: "Payroll & WPS", attendance: "Attendance & Leave", eos: "End of Service", hr_management: "HR Management", saudization: "Saudization", contracts: "Contracts & Policies", general: "General" };

export default function BlogArticle() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await base44.functions.invoke("blogPublic", { action: "get", slug });
        setArticle(res.data.article || null);
        if (res.data.article?.category) {
          const list = await base44.functions.invoke("blogPublic", { action: "list", category: res.data.article.category });
          setRelated((list.data.articles || []).filter((a) => a.slug !== slug).slice(0, 3));
        }
      } catch (e) {
        setErr(e?.response?.data?.error || e?.message || "error");
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : undefined });
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    document.title = article.seo_title || `${article.title} | جدارة`;
    setMeta("description", article.meta_description || article.excerpt || "");
    if (article.meta_keywords) setMeta("keywords", article.meta_keywords);
    setMetaProp("og:title", article.seo_title || article.title);
    setMetaProp("og:description", article.meta_description || article.excerpt || "");
    setMetaProp("og:type", "article");
    setLink("canonical", `https://jadara-hr.com/blog/${article.slug}`);
  }, [article]);

  const cats = isAr ? CAT_AR : CAT_EN;
  const t = isAr ? {
    back: "العودة للمدونة", notFound: "المقال غير موجود",
    ctaTitle: "أتمت هذه العملية مع جدارة", ctaDesc: "جرّب جدارة مجاناً 30 يوماً — كل مميزات إدارة الموارد البشرية في منصة واحدة.", ctaBtn: "ابدأ الآن مجاناً",
    related: "مقالات ذات صلة", minutes: "د",
  } : {
    back: "Back to blog", notFound: "Article not found",
    ctaTitle: "Automate this with Jadara", ctaDesc: "Try Jadara free for 30 days — all HR features in one platform.", ctaBtn: "Start free",
    related: "Related Articles", minutes: "min",
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white antialiased" dir={isAr ? "rtl" : "ltr"}>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Logo tone="light" size={38} /></Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/blog" className="text-sm text-white/80 hover:text-white px-3 py-2 rounded-lg hidden sm:block">{isAr ? "كل المقالات" : "All articles"}</Link>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-24 text-center text-white/50"><Loader2 className="animate-spin mx-auto" size={28} /></div>
      ) : err || !article ? (
        <div className="max-w-3xl mx-auto px-5 py-24 text-center">
          <div className="text-rose-300 mb-4">{err || t.notFound}</div>
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-violet-300 hover:text-violet-200">{t.back}</Link>
        </div>
      ) : (
        <>
          <article className="max-w-3xl mx-auto px-5 pt-10 pb-6">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-5">
              <ArrowRight size={16} style={{ transform: isAr ? "none" : "scaleX(-1)" }} /> {t.back}
            </Link>
            <div className="text-xs text-violet-300 mb-3">{cats[article.category] || article.category}</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)" }}>{article.title}</h1>
            <div className="flex items-center gap-3 mt-4 text-xs text-white/50">
              {article.author_name && <span>{article.author_name}</span>}
              {article.published_date && <span>• {article.published_date}</span>}
              <span className="inline-flex items-center gap-1"><Clock size={12} /> {article.reading_minutes || 3} {t.minutes}</span>
            </div>

            {article.cover_image_url && (
              <div className="mt-6 rounded-2xl overflow-hidden border border-white/10">
                <img src={article.cover_image_url} alt={article.title} className="w-full h-64 object-cover" />
              </div>
            )}

            <div className="mt-8 bg-white rounded-3xl border border-border p-7 sm:p-9 text-slate-800 blog-content">
              <ReactMarkdown>{article.content || ""}</ReactMarkdown>
            </div>

            {article.tags && (
              <div className="flex flex-wrap gap-2 mt-6">
                {String(article.tags).split(",").map((tg) => tg.trim()).filter(Boolean).map((tg) => (
                  <span key={tg} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-white/60">#{tg}</span>
                ))}
              </div>
            )}
          </article>

          <section className="max-w-3xl mx-auto px-5 py-8">
            <div className="relative overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-l from-violet-600/25 via-indigo-600/15 to-blue-600/25 p-8 text-center">
              <div className="absolute -top-12 -left-12 w-52 h-52 rounded-full bg-violet-500/20 blur-3xl" />
              <h2 className="relative text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{t.ctaTitle}</h2>
              <p className="relative text-white/70 mt-2 max-w-xl mx-auto">{t.ctaDesc}</p>
              <div className="relative flex flex-wrap justify-center gap-3 mt-6">
                <Link to="/quote" className="bg-white text-[#0b1120] hover:bg-white/90 px-6 py-3.5 rounded-2xl font-semibold shadow-xl inline-flex items-center gap-2 transition"><Zap size={18} /> {t.ctaBtn}</Link>
                <a href={WHATSAPP} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/15 border border-white/15 px-6 py-3.5 rounded-2xl font-medium inline-flex items-center gap-2 transition"><MessageCircle size={18} /> {isAr ? "واتساب مباشر" : "WhatsApp"}</a>
              </div>
            </div>
          </section>

          {related.length > 0 && (
            <section className="max-w-3xl mx-auto px-5 pb-16">
              <h3 className="font-bold text-lg mb-4">{t.related}</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((a) => (
                  <Link key={a.id} to={`/blog/${a.slug}`} className="group block bg-[#13161f] hover:bg-[#171b29] border border-white/10 rounded-2xl overflow-hidden transition hover:-translate-y-1">
                    <div className="h-28 overflow-hidden">
                      <img src={a.cover_image_url || "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80"} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="p-3">
                      <div className="text-[11px] text-violet-300 mb-1">{cats[a.category]}</div>
                      <div className="font-semibold text-sm leading-snug group-hover:text-violet-200 transition line-clamp-2">{a.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
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