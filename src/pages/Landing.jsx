import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import {
  Sparkles, Check, ArrowLeft, ShieldCheck, Users, CalendarCheck, Wallet,
  Calculator, Target, Car, BarChart3, Lock, Zap, Phone, Mail, Building2,
  Loader2, BadgeCheck, Star, Clock, TrendingUp, Bell, CreditCard,
  GraduationCap, Award, GitBranch, Landmark, FileSpreadsheet, Plug,
  HeartPulse, Stethoscope, LineChart, MessageCircle, MapPin, Crown
} from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/43df068d0_generated_image.png";
const WHATSAPP = "https://wa.me/966594700782";
const SALES_EMAIL = "sales@jadara.sa";

const features = [
  { icon: Users, title: "إدارة الموظفين", desc: "ملفات كاملة، وثائق، إقامات، جوازات، تأمين طبي، حسابات بنكية، وتنبيهات انتهاء الوثائق." },
  { icon: CalendarCheck, title: "الحضور والانصراف", desc: "استيراد بصمات Excel/CSV آلي، مطابقة تلقائية بالموظفين، احتساب الغياب والتأخير وربطه بالرواتب." },
  { icon: Wallet, title: "إدارة الرواتب (Payroll)", desc: "احتساب آلي للراتب، تعديل المستحقات والسلف والخصومات، اعتماد وصرف كشوف، وتقارير شهرية." },
  { icon: ShieldCheck, title: "التأمينات الاجتماعية (GOSI)", desc: "احتساب تلقائي للسعوديين (21% إجمالي) والمقيمين (2% صاحب العمل) وفق النظام." },
  { icon: Calculator, title: "نهاية الخدمة", desc: "حاسبة وفق نظام العمل السعودي (المواد 84-85)، تصفية رصيد الإجازات وتعويض التذاكر، ومخالصة قابلة للطباعة بشعار منشأتك." },
  { icon: Target, title: "إدارة الأداء", desc: "تقييمات دورية (أهداف، كفاءات، قيم)، توصيات (ترقية/مكافأة/إنذار)، ومسارات تطوير." },
  { icon: GitBranch, title: "التخطيط التعاقبي", desc: "خطة تعاقب للمناصب الحرجة، تحديد البدلاء، مستوى الجاهزية، ومخاطر الفقد وأثره." },
  { icon: BarChart3, title: "تحليلات الموارد البشرية", desc: "لوحات معلومات تفاعلية ومؤشرات لحظية: الترميز، الحضور، تكلفة العمالة، والاتجاهات." },
  { icon: Car, title: "إدارة الأسطول والمركبات", desc: "مركبات، تأمين، رخص، فحوصات فنية دورية، ومسؤولين، مع تنبيهات انتهاء." },
  { icon: Landmark, title: "تراخيص المنشأة الحكومية", desc: "تتبّع كل تراخيص الجهات الحكومية وعقود الصيانة، خيار «لا ينطبق»، ونسخة إلكترونية لكل ترخيص." },
  { icon: Plug, title: "التكاملات الذكية", desc: "تكاملات حكومية: التراخيص، الإقامات (مقيم/أبشر)، التأمينات الاجتماعية، والضمان الصحي — حلول متكاملة كل ما تحتاجه في مكان واحد." },
  { icon: Building2, title: "بوابة تجربة العميل", desc: "نظام اشتراكات ذكي بفترة تجربة مجانية 30 يوماً، وإشعارات فورية للمالك بكل عميل جديد." },
];

const licenses = [
  "السجل التجاري", "أمانة/بلدية", "الدفاع المدني",
  "وزارة الصناعة والثروة المعدنية", "الهيئة السعودية للمدن الصناعية ومناطق التقنية (MODON)", "الهيئة العامة للغذاء والدواء (SFDA)",
  "وزارة الموارد البشرية والتنمية الاجتماعية", "التأمينات الاجتماعية (GOSI)",
  "هيئة النقل", "الهيئة السعودية للسياحة", "الزكاة والضريبة والجمارك",
  "مكتب العمل", "الرخصة الصحية / العيادات",
];

const integrations = [
  { icon: Bell, t: "إشعارات فورية", d: "تنبيهات استباقية لانتهاء التراخيص والإقامات والتأمينات والوثائق والمركبات." },
  { icon: Landmark, t: "التراخيص الحكومية", d: "ربط مع بوابات التراخيص الحكومية ومتابعة استصدارها وتجديدها." },
  { icon: BadgeCheck, t: "مقيم وأبشر (قريباً)", d: "تكاملات قادمة مع منصة مقيم وأبشر لمتابعة هويات وإقامات المقيمين." },
  { icon: ShieldCheck, t: "التأمينات الاجتماعية (GOSI)", d: "تكامل لاحتساب المساهمات والشهادات وفق نظام التأمينات الاجتماعية." },
  { icon: HeartPulse, t: "مجلس الضمان الصحي", d: "ربط بيانات التأمين الصحي والمستفيدين والاعتمادات." },
  { icon: Stethoscope, t: "التعاملات الطبية", d: "ربط التعاملات الطبية والفحوصات لهويات المقيمين." },
  { icon: Car, t: "إدارة المرور للمركبات", d: "ربط رخص وتأمين وفحوصات المركبات مع إدارة المرور." },
  { icon: Calculator, t: "أنظمة المحاسبة (Odoo/ERP)", d: "تكامل مع أنظمة محاسبية Odoo وأنظمة ERP لترحيل الرواتب والقيود." },
];

const planTrial = [
  "تجربة كاملة لكل المميزات", "مدة 30 يوماً بدون بطاقة ائتمان",
  "استيراد بيانات الموظفين", "دعم فني خلال فترة التجربة", "بدون التزام",
];
const planAnnual = [
  "كل مميزات المنصة", "اشتراك سنوي بأسعار تنافسية",
  "الدفع عبر Visa / مدى", "تكاملات حكومية", "دعم مخصّص وتحديثات مستمرة",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Globe_Icon(props) {
  return <Landmark {...props} />;
}

export default function Landing() {
  const [form, setForm] = useState({
    name: "", commercial_register: "", industry: "",
    contact_name: "", contact_email: "", contact_phone: "", city: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      await base44.functions.invoke("createTrial", form);
      setDone(true);
    } catch (error) {
      setErr(error?.response?.data?.error || error?.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[#0b1120] text-white antialiased" dir="rtl">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      {/* شريط علوي */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-lg overflow-hidden ring-1 ring-white/20">
              <Image src={LOGO} alt="شعار جدارة" className="w-full h-full" fittingType="fit" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>جدارة</div>
              <div className="text-[10px] text-white/50 -mt-0.5">لإدارة الموارد البشرية</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
            <button onClick={() => scrollTo("features")} className="hover:text-white transition">المميزات</button>
            <button onClick={() => scrollTo("licenses")} className="hover:text-white transition">التراخيص</button>
            <button onClick={() => scrollTo("integrations")} className="hover:text-white transition">التكاملات</button>
            <button onClick={() => scrollTo("about")} className="hover:text-white transition">عن المؤسس</button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-white transition">الباقات</button>
            <button onClick={() => scrollTo("contact")} className="hover:text-white transition">تواصل</button>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login?returnTo=/app" className="text-sm text-white/80 hover:text-white px-3 py-2 rounded-lg">تسجيل الدخول</Link>
            <button onClick={() => scrollTo("trial")} className="text-sm bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 px-4 py-2 rounded-xl font-medium shadow-lg shadow-violet-500/30 transition">ابدأ الآن</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 pt-16 pb-12 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80 mb-5">
            <BadgeCheck size={14} className="text-violet-300" /> منصة الموارد البشرية السعودية لعام 2027
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            نظام موارد بشرية
            <span className="block bg-gradient-to-l from-violet-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent">خارق ومتكامل</span>
          </h1>
          <p className="text-white/70 text-lg mt-5 max-w-xl leading-relaxed">
            من «جدارة» — منصة واحدة تجمع: الموظفين، الحضور، الرواتب، نهاية الخدمة، التأمينات، الأداء، التخطيط التعاقبي، التحليلات، الأسطول، والتراخيص الحكومية… مع تكاملات ذكية وتصميم فخم وحسابات وفق الأنظمة السعودية.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button onClick={() => scrollTo("trial")} className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 px-6 py-3.5 rounded-2xl font-semibold shadow-xl shadow-violet-500/30 flex items-center gap-2 transition">
              <Zap size={18} /> جرّب مجاناً لمدة شهر
            </button>
            <button onClick={() => scrollTo("features")} className="bg-white/10 hover:bg-white/15 border border-white/15 px-6 py-3.5 rounded-2xl font-medium transition">استكشف المميزات</button>
          </div>
          <div className="flex gap-8 mt-8 text-sm">
            <Stat n="+50" l="عميل تابع" />
            <Stat n="+15,000" l="موظف مُدار" />
            <Stat n="99.9%" l="استمرارية" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-blue-500/20 rounded-[2rem] blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80" alt="فريق عمل" className="w-full h-[420px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent" />
            <div className="absolute bottom-4 right-4 left-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {features.map((f) => {
                  const I = f.icon;
                  return (
                    <div key={f.title} className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl px-2.5 py-2 flex items-center gap-1.5">
                      <I size={14} className="text-violet-200 shrink-0" />
                      <span className="text-[11px] leading-tight text-white/90">{f.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* المميزات */}
      <section id="features" className="max-w-7xl mx-auto px-5 py-14">
        <SectionHead tag="كل ما تحتاجه في مكان واحد" title="منصة واحدة، حلول متكاملة" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {features.map((f) => {
            const I = f.icon;
            return (
              <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-6 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-white/10 flex items-center justify-center mb-4">
                  <I size={22} className="text-violet-200" />
                </div>
                <div className="font-semibold text-lg">{f.title}</div>
                <div className="text-white/60 text-sm mt-2 leading-relaxed">{f.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* التراخيص الحكومية */}
      <section id="licenses" className="max-w-7xl mx-auto px-5 py-14">
        <SectionHead tag="امتثال تام" title="تراخيص حكومية شاملة تحت سقف واحد" />
        <div className="grid lg:grid-cols-3 gap-6 mt-10 items-start">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
            {licenses.map((l) => (
              <div key={l} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm">
                <Landmark size={16} className="text-violet-300 shrink-0" /> {l}
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3 text-sm text-white/75">
            <div className="font-semibold text-white text-base mb-1">مزايا إدارة التراخيص</div>
            <FeatureLi>خيار «لا ينطبق» لأي ترخيص غير ملزم لمنشأتك.</FeatureLi>
            <FeatureLi>إرفاق نسخة إلكترونية لكل ترخيص.</FeatureLi>
            <FeatureLi>تنبيهات استباقية قبل انتهاء الترخيص.</FeatureLi>
            <FeatureLi>تسجيل عقود الصيانة وتواريخها.</FeatureLi>
            <FeatureLi>تصنيف مخصّص لأي ترخيص حكومي إضافي.</FeatureLi>
          </div>
        </div>
      </section>

      {/* التكاملات */}
      <section id="integrations" className="max-w-7xl mx-auto px-5 py-14">
        <SectionHead tag="تكاملات ذكية" title="تكاملات تربط نظامك بالواقع" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {integrations.map((it) => {
            const I = it.icon;
            return (
              <div key={it.t} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-white/10 flex items-center justify-center mb-4">
                  <I size={20} className="text-emerald-200" />
                </div>
                <div className="font-semibold">{it.t}</div>
                <div className="text-white/60 text-sm mt-1.5 leading-relaxed">{it.d}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* عن المؤسس */}
      <section id="about" className="max-w-5xl mx-auto px-5 py-14">
        <SectionHead tag="الرؤية خلف جدارة" title="عن المؤسس" />
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="bg-gradient-to-br from-white/8 to-white/5 border border-white/10 rounded-3xl p-8 mt-8 grid sm:grid-cols-[auto,1fr] gap-7 items-start">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-white/15 flex items-center justify-center mx-auto sm:mx-0">
            <Crown size={40} className="text-amber-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/15 text-amber-200 border border-amber-300/20 rounded-full px-3 py-1 text-xs mb-3">
              <Sparkles size={13} /> مولد فكرة «جدارة» ومصمم منهجها
            </div>
            <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>مدير رأس المال البشري</h3>
            <p className="text-white/75 mt-3 leading-loose">
              يقف خلف «جدارة» قائد في إدارة رأس المال البشري جمع بين العمق الأكاديمي والخبرة التطبيقية في تصميم حلول رقمية ترفع كفاءة المنشآت وتلتزم بالأنظمة السعودية.
              حاصل على درجة <b className="text-white">الماجستير في إدارة الموارد البشرية</b> من <b className="text-white">جامعة بورتسموث — المملكة المتحدة</b> بتقدير <b className="text-white">جيد جداً</b>،
              إضافةً إلى شهادة <b className="text-white">SHRM-SCP</b> الأمريكية، وشهادة <b className="text-white">OTHM</b>، وشهادة <b className="text-white">CMI</b>.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {[{ i: GraduationCap, t: "ماجستير — جامعة بورتسموث" },
                { i: Award, t: "SHRM-SCP" },
                { i: Award, t: "OTHM" },
                { i: Award, t: "CMI" }].map((c) => {
                const I = c.i; return (
                  <span key={c.t} className="inline-flex items-center gap-1.5 text-xs bg-white/8 border border-white/15 rounded-full px-3 py-1.5">
                    <I size={13} className="text-violet-200" /> {c.t}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* الباقات */}
      <section id="pricing" className="max-w-7xl mx-auto px-5 py-14">
        <SectionHead tag="ابدأ الآن" title="باقات بسيطة وشريفة" />
        <div className="grid md:grid-cols-2 gap-6 mt-10 max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col">
            <div className="text-sm text-violet-200 font-medium">تجربة مجانية</div>
            <div className="text-4xl font-extrabold mt-2">30 يوماً</div>
            <div className="text-white/60 text-sm mt-1">بدون بطاقة ائتمان</div>
            <ul className="space-y-3 mt-6 flex-1">
              {planTrial.map((p) => <li key={p} className="flex items-start gap-2 text-sm text-white/80"><Check size={16} className="text-emerald-400 mt-0.5 shrink-0" /> {p}</li>)}
            </ul>
            <button onClick={() => scrollTo("trial")} className="mt-6 w-full bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl py-3 font-medium transition">سجّل تجربتك</button>
          </div>
          <div className="relative bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-400/30 rounded-3xl p-7 flex flex-col">
            <div className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs bg-violet-400/20 text-violet-100 px-2.5 py-1 rounded-full">
              <Star size={12} /> الأكثر اختياراً
            </div>
            <div className="text-sm text-violet-100 font-medium">الاشتراك السنوي</div>
            <div className="text-4xl font-extrabold mt-2">سنوي</div>
            <div className="text-white/70 text-sm mt-1">دفع عبر Visa / مدى أو مباشرة</div>
            <ul className="space-y-3 mt-6 flex-1">
              {planAnnual.map((p) => <li key={p} className="flex items-start gap-2 text-sm text-white/90"><Check size={16} className="text-emerald-300 mt-0.5 shrink-0" /> {p}</li>)}
            </ul>
            <button onClick={() => scrollTo("trial")} className="mt-6 w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 rounded-2xl py-3 font-semibold shadow-xl shadow-violet-500/30 transition">اشترك الآن</button>
          </div>
        </div>
      </section>

      {/* تجربة / تسجيل */}
      <section id="trial" className="max-w-3xl mx-auto px-5 py-14">
        <SectionHead tag="سجّل في دقيقة" title="ابدأ تجربتك المجانية الآن" />
        {done ? (
          <div className="bg-white/5 border border-emerald-400/30 rounded-3xl p-10 text-center mt-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <BadgeCheck size={32} className="text-emerald-300" />
            </div>
            <div className="text-2xl font-bold">تم استلام طلبك بنجاح</div>
            <p className="text-white/70 mt-2">سيتواصل معك فريقنا خلال فترة التجربة لتفعيل اشتراكك السنوي ونقل بياناتك. تحقق من بريدك الإلكتروني.</p>
            <Link to="/login?returnTo=/app" className="inline-flex items-center gap-2 mt-6 text-violet-300 hover:text-violet-200">
              تسجيل الدخول للمنصة <ArrowLeft size={16} />
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 mt-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="اسم المنشأة *" value={form.name} onChange={(v) => set("name", v)} required />
              <Field label="السجل التجاري" value={form.commercial_register} onChange={(v) => set("commercial_register", v)} />
              <Field label="القطاع / النشاط" value={form.industry} onChange={(v) => set("industry", v)} />
              <Field label="المدينة" value={form.city} onChange={(v) => set("city", v)} />
              <Field label="جهة الاتصال" value={form.contact_name} onChange={(v) => set("contact_name", v)} />
              <Field label="الهاتف" value={form.contact_phone} onChange={(v) => set("contact_phone", v)} />
            </div>
            <Field label="البريد الإلكتروني *" value={form.contact_email} onChange={(v) => set("contact_email", v)} type="email" required />
            {err && <div className="text-rose-300 text-sm bg-rose-500/10 border border-rose-400/20 rounded-xl p-3">{err}</div>}
            <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-xl shadow-violet-500/30 transition disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />} تفعيل التجربة المجانية لمدة شهر
            </button>
            <p className="text-white/50 text-xs text-center flex items-center justify-center gap-1.5"><Lock size={13} /> بياناتك آمنة ولن تُباع لأي طرف ثالث</p>
          </form>
        )}
      </section>

      {/* تواصل */}
      <section id="contact" className="max-w-5xl mx-auto px-5 py-14">
        <SectionHead tag="نحن هنا لمساعدتك" title="تواصل معنا" />
        <div className="grid sm:grid-cols-3 gap-5 mt-8">
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
      </section>

      {/* التذييل */}
      <footer className="border-t border-white/10 mt-10">
        <div className="max-w-7xl mx-auto px-5 py-10 grid sm:grid-cols-3 gap-8 text-sm text-white/60">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-white overflow-hidden ring-1 ring-white/20">
                <Image src={LOGO} alt="جدارة" className="w-full h-full" fittingType="fit" />
              </div>
              <span className="text-white font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>جدارة لإدارة الموارد البشرية</span>
            </div>
            <p>منصة الموارد البشرية السعودية المتكاملة — منصة واحدة تجمع كل ما تحتاجه لإدارة رأس المال البشري.</p>
          </div>
          <div className="space-y-1.5">
            <div className="font-medium text-white mb-1">تواصل معنا</div>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><MessageCircle size={14} /> واتساب: +966 594700782</a>
            <a href={`mailto:${SALES_EMAIL}`} className="flex items-center gap-2 hover:text-white"><Mail size={14} /> {SALES_EMAIL}</a>
          </div>
          <div className="space-y-1.5">
            <div className="font-medium text-white mb-1">المنصة</div>
            <button onClick={() => scrollTo("features")} className="block hover:text-white">المميزات</button>
            <button onClick={() => scrollTo("pricing")} className="block hover:text-white">الباقات</button>
            <Link to="/login?returnTo=/app" className="block hover:text-white">تسجيل الدخول</Link>
          </div>
        </div>
        <div className="text-center text-white/40 text-xs pb-6">© 2027 جدارة — جميع الحقوق محفوظة</div>
      </footer>
    </div>
  );
}

function SectionHead({ tag, title }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white/80">{tag}</div>
      <h2 className="text-3xl sm:text-4xl font-extrabold mt-4" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div>
      <div className="text-2xl font-extrabold bg-gradient-to-l from-violet-300 to-blue-300 bg-clip-text text-transparent">{n}</div>
      <div className="text-white/50 text-xs mt-0.5">{l}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/60">{label}</label>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/50" />
    </div>
  );
}

function FeatureLi({ children }) {
  return (
    <div className="flex items-start gap-2"><Check size={16} className="text-emerald-400 mt-0.5 shrink-0" /> <span>{children}</span></div>
  );
}