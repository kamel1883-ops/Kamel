import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import {
  Check, Crown, GraduationCap, Award, ShieldCheck, Users, Target,
  CalendarCheck, Wallet, Landmark, BarChart3, ArrowLeft, Sparkles
} from "lucide-react";
import { eosArticleReference } from "@/lib/eos";

const WHATSAPP = "https://wa.me/966594700782";
const SALES_EMAIL = "sales@jadara.sa";

const pillars = [
  { icon: Users, t: "إدارة الموظفين", d: "ملفات ووثائق وإقامات وجوازات وتأمين طبي وحسابات بنكية وتنبيهات انتهاء." },
  { icon: CalendarCheck, t: "الحضور والانصراف", d: "استيراد بصمات Excel/CSV آلي ومطابقة بالموظفين واحتساب الغياب والتأخير." },
  { icon: Wallet, t: "الرواتب والتأمينات", d: "احتساب الرواتب وGOSI للسعوديين والمقيمين وفق النظام وكشوف معتمدة." },
  { icon: ShieldCheck, t: "نهاية الخدمة", d: "حاسبة وفق نظام العمل السعودي وتصفية الإجازات والتعويض ومخالصة قابلة للطباعة." },
  { icon: Target, t: "الأداء والتخطيط التعاقبي", d: "تقييمات دورية وتوصيات وخطة تعاقب للمناصب الحرجة ومستوى الجاهزية." },
  { icon: BarChart3, t: "التحليلات والأسطول", d: "لوحات تفاعلية ومؤشرات لحظية وإدارة مركبات وفحوصات وتنبيهات." },
];

export default function About() {
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
            <Link to="/contact" className="hover:text-white transition">تواصل معنا</Link>
            <Link to="/login?returnTo=/app" className="hover:text-white transition">تسجيل الدخول</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-14">
        <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80 mb-4">
            <Sparkles size={14} className="text-violet-300" /> الرؤية خلف جدارة
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)" }}>عن جدارة</h1>
          <p className="text-white/70 text-lg mt-4 leading-relaxed">
            «جدارة» هي منصة سحابية متكاملة لإدارة الموارد البشرية، صُممت خصيصاً للسوق السعودي لتضع بين يدي المنشآت في مكان واحد كل ما تحتاجه لإدارة رأس المال البشري بكفاءة وشمولية والتزام كامل بالأنظمة المحلية.
          </p>
        </motion.div>

        <section className="mt-10 space-y-4 text-white/75 leading-relaxed">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>ماذا تقدم المنصة؟</h2>
          <p>
            تجمع المنصة إدارة موظفين شاملة من الملفات والوثائق والإقامات والجوازات والتأمين الطبي والحسابات البنكية، إلى نظام حضور وانصراف يستورد بصمات Excel وCSV آلياً ويطابقها بالموظفين، مروراً بإدارة رواتب متكاملة مع احتساب التأمينات الاجتماعية GOSI للسعوديين والمقيمين، وحاسبة نهاية الخدمة وفق نظام العمل السعودي (المواد 84-85)، إضافةً إلى إدارة الأداء والمراجعات والتخطيط التعاقبي، والتحليلات اللحظية، وإدارة أسطول المركبات، ومتابعة كل تراخيص المنشأة الحكومية مع خيار «لا ينطبق»، فضلاً عن تكاملات ذكية مع الجهات الحكومية وأنظمة المحاسبة مثل Odoo وERP.
          </p>
        </section>

        <div className="grid sm:grid-cols-2 gap-5 mt-8">
          {pillars.map((p) => {
            const I = p.icon;
            return (
              <div key={p.t} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="w-11 h-11 rounded-2xl bg-[#37376c] border border-white/10 flex items-center justify-center mb-4">
                  <I size={20} className="text-white" />
                </div>
                <div className="font-semibold">{p.t}</div>
                <div className="text-white/60 text-sm mt-1.5 leading-relaxed">{p.d}</div>
              </div>
            );
          })}
        </div>

        <section className="mt-12">
          <div className="flex items-center gap-2 mb-2">
            <Landmark size={18} className="text-violet-300" />
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>نهاية الخدمة وفق نظام العمل السعودي</h2>
          </div>
          <p className="text-white/75 leading-relaxed">
            تحتسب المنصة مكافأة نهاية الخدمة بدقة وفق أحكام نظام العمل السعودي، مع تصنيف جميع أسباب الإنهاء وربط كل سبب بمادته النظامية المناسبة لضمان امتثال كامل — من انتهاء العقد وعدم التجديد، إلى الفصل المشروع والاستقالة وترك العمل لأسباب جائزة والقوة القاهرة.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {eosArticleReference.map((a) => (
              <div key={a.article} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{a.title}</span>
                  <span className="text-[11px] bg-violet-500/20 text-violet-100 rounded-full px-2 py-0.5">{a.article}</span>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">{a.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4 text-white/75 leading-relaxed">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>لمن صُممت جدارة؟</h2>
          <p>
            تستهدف «جدارة» المنشآت الصغيرة والمتوسطة والكبرى على حد سواء، وفرق الموارد البشرية والمالية التي تبحث عن نظام واحد موثوق يوحّد العمليات الإدارية ويقلّل المخاطر التشغيلية والمالية والنظامية، ويمنحها رؤية واضحة على رأس المال البشري عبر لوحات معلومات تفاعلية ومؤشرات لحظية.
          </p>
        </section>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-white/8 to-white/5 border border-white/10 rounded-3xl p-8 mt-12 grid sm:grid-cols-[auto,1fr] gap-7 items-start">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-white/15 flex items-center justify-center mx-auto sm:mx-0">
            <Crown size={40} className="text-amber-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/15 text-amber-200 border border-amber-300/20 rounded-full px-3 py-1 text-xs mb-3">
              <Sparkles size={13} /> مولّد فكرة «جدارة» ومصمم منهجها
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>من يبني جدارة؟</h2>
            <p className="mt-3 leading-loose">
              يقف خلف «جدارة» قائد في إدارة رأس المال البشري جمع بين العمق الأكاديمي والخبرة التطبيقية في تصميم حلول رقمية ترفع كفاءة المنشآت وتلتزم بالأنظمة السعودية. حاصل على درجة <b className="text-white">الماجستير في إدارة الموارد البشرية</b> من <b className="text-white">جامعة بورتسموث — المملكة المتحدة</b> بتقدير <b className="text-white">جيد جداً</b>، إضافةً إلى شهادة <b className="text-white">SHRM-SCP</b> الأمريكية، وشهادتيّ <b className="text-white">OTHM</b> و<b className="text-white">CMI</b>. ما يضمن أن المنصة مبنية على أسس علمية وممارسات مهنية عالمية ومخصصة للسياق السعودي.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {[{ i: GraduationCap, t: "ماجستير — جامعة بورتسموث" }, { i: Award, t: "SHRM-SCP" }, { i: Award, t: "OTHM" }, { i: Award, t: "CMI" }].map((c) => {
                const I = c.i;
                return (
                  <span key={c.t} className="inline-flex items-center gap-1.5 text-xs bg-white/8 border border-white/15 rounded-full px-3 py-1.5">
                    <I size={13} className="text-violet-200" /> {c.t}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.section>

        <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-lg" style={{ fontFamily: "var(--font-display)" }}>جاهز لتجربة جدارة؟</div>
            <div className="text-white/60 text-sm mt-1">ابدأ تجربتك المجانية لمدة 30 يوماً بدون بطاقة ائتمان.</div>
          </div>
          <div className="flex gap-3">
            <Link to="/contact" className="bg-white/10 hover:bg-white/15 border border-white/15 px-5 py-3 rounded-2xl font-medium transition">تواصل معنا</Link>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-violet-500/30 transition">ابدأ الآن</a>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-10">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/55">
          <Link to="/"><Logo tone="light" size={36} /></Link>
          <div className="flex items-center gap-4">
            <a href={`mailto:${SALES_EMAIL}`} className="hover:text-white">{SALES_EMAIL}</a>
            <Link to="/" className="hover:text-white inline-flex items-center gap-1.5"><ArrowLeft size={14} /> الرئيسية</Link>
          </div>
          <div>© 2027 جدارة — جميع الحقوق محفوظة</div>
        </div>
      </footer>
    </div>
  );
}