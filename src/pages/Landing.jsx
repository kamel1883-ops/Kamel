import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  Sparkles, Check, ArrowLeft, ShieldCheck, Users, CalendarCheck, Wallet,
  Calculator, Target, Car, BarChart3, Lock, Zap, Phone, Mail, Building2,
  Loader2, BadgeCheck, Star
} from "lucide-react";

const features = [
  { icon: Users, title: "إدارة الموظفين", desc: "ملفات كاملة، وثائق، إقامات، تأمين طبي، بنوك، وتواريخ انتهاء." },
  { icon: CalendarCheck, title: "الحضور والانصراف", desc: "استيراد بصمات آلي وربطها مباشرةً بالرواتب." },
  { icon: Wallet, title: "الرواتب والخصومات", desc: "احتساب آلي مع تعديل المستحقات والسلف وصلاحية الاعتماد." },
  { icon: Calculator, title: "نهاية الخدمة", desc: "حاسبة وفق نظام العمل السعودي (المواد 84-85) ومخالصة قابلة للطباعة." },
  { icon: Target, title: "الأداء والتطوير", desc: "تقييمات، كفاءات، مسارات وظيفية، وتخطيط تعاقب." },
  { icon: Car, title: "إدارة الأسطول", desc: "مركبات، تأمين، رخص، فحوصات دورية، وتنبيهات انتهاء." },
  { icon: ShieldCheck, title: "تراخيص المنشأة", desc: "متابعة تراخيص الجهات الحكومية وعقود الصيانة." },
  { icon: BarChart3, title: "تحليلات لحظية", desc: "لوحات معلومات وإحصائيات ذكية لاتخاذ القرار." },
];

const planTrial = [
  "تجربة كاملة لكل المميزات", "مدة 30 يوماً بدون بطاقة ائتمان",
  "استيراد بيانات الموظفين", "دعم فني خلال فترة التجربة", "بدون التزام",
];
const planAnnual = [
  "كل مميزات المنصة", "اشتراك سنوي بأسعار تنافسية",
  "الدفع عبر Visa / Mada", "تكاملات حكومية", "دعم مخصّص وتحديثات مستمرة",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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
      {/* خلفية متدرجة */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      {/* شريط علوي */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles size={18} />
            </div>
            <span className="font-bold text-lg">جدارة</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <button onClick={() => scrollTo("features")} className="hover:text-white transition">المميزات</button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-white transition">الباقات</button>
            <button onClick={() => scrollTo("trial")} className="hover:text-white transition">تجربة مجانية</button>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-white/80 hover:text-white px-3 py-2 rounded-lg">تسجيل الدخول</Link>
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
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight">
            نظام موارد بشرية
            <span className="block bg-gradient-to-l from-violet-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent">خارق ومتكامل</span>
          </h1>
          <p className="text-white/70 text-lg mt-5 max-w-xl leading-relaxed">
            من «جدارة» — منصة واحدة تجمع الموظفين، الحضور، الرواتب، نهاية الخدمة، الأداء، الأسطول، والتراخيص الحكومية، مع تكاملات ذكية وتصميم فخم، وحسابات وفق الأنظمة السعودية.
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
            <div className="absolute bottom-5 right-5 left-5 grid grid-cols-3 gap-3">
              {[
                { i: Users, t: "الموظفون" },
                { i: Wallet, t: "الرواتب" },
                { i: ShieldCheck, t: "التراخيص" },
              ].map((c) => {
                const I = c.i;
                return (
                  <div key={c.t} className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-3 flex flex-col items-center gap-1.5">
                    <I size={20} className="text-violet-200" />
                    <span className="text-xs">{c.t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* المميزات */}
      <section id="features" className="max-w-7xl mx-auto px-5 py-14">
        <SectionHead tag="كل ما تحتاجه في مكان واحد" title="مميزات خارقة لمنصة واحدة" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
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

      {/* الباقات */}
      <section id="pricing" className="max-w-7xl mx-auto px-5 py-14">
        <SectionHead tag="ابدأ الآن" title="باقات بسيطة وشريفة" />
        <div className="grid md:grid-cols-2 gap-6 mt-10 max-w-4xl mx-auto">
          {/* تجربة */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col">
            <div className="text-sm text-violet-200 font-medium">تجربة مجانية</div>
            <div className="text-4xl font-extrabold mt-2">30 يوماً</div>
            <div className="text-white/60 text-sm mt-1">بدون بطاقة ائتمان</div>
            <ul className="space-y-3 mt-6 flex-1">
              {planTrial.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-white/80">
                  <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" /> {p}
                </li>
              ))}
            </ul>
            <button onClick={() => scrollTo("trial")} className="mt-6 w-full bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl py-3 font-medium transition">سجّل تجربتك</button>
          </div>

          {/* سنوي */}
          <div className="relative bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-400/30 rounded-3xl p-7 flex flex-col">
            <div className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs bg-violet-400/20 text-violet-100 px-2.5 py-1 rounded-full">
              <Star size={12} /> الأكثر اختياراً
            </div>
            <div className="text-sm text-violet-100 font-medium">الاشتراك السنوي</div>
            <div className="text-4xl font-extrabold mt-2">سنوي</div>
            <div className="text-white/70 text-sm mt-1">دفع عبر Visa / Mada أو مباشرة</div>
            <ul className="space-y-3 mt-6 flex-1">
              {planAnnual.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-white/90">
                  <Check size={16} className="text-emerald-300 mt-0.5 shrink-0" /> {p}
                </li>
              ))}
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
            <Link to="/login" className="inline-flex items-center gap-2 mt-6 text-violet-300 hover:text-violet-200">
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

      {/* التذييل */}
      <footer className="border-t border-white/10 mt-10">
        <div className="max-w-7xl mx-auto px-5 py-10 grid sm:grid-cols-3 gap-8 text-sm text-white/60">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-2"><Sparkles size={18} className="text-violet-300" /> جدارة</div>
            <p>منصة الموارد البشرية السعودية المتكاملة.</p>
          </div>
          <div className="space-y-1.5">
            <div className="font-medium text-white mb-1">تواصل معنا</div>
            <div className="flex items-center gap-2"><Mail size={14} /> sales@jadara.app</div>
            <div className="flex items-center gap-2"><Phone size={14} /> 920000000</div>
          </div>
          <div className="space-y-1.5">
            <div className="font-medium text-white mb-1">المنصة</div>
            <button onClick={() => scrollTo("features")} className="block hover:text-white">المميزات</button>
            <button onClick={() => scrollTo("pricing")} className="block hover:text-white">الباقات</button>
            <Link to="/login" className="block hover:text-white">تسجيل الدخول</Link>
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
      <h2 className="text-3xl sm:text-4xl font-extrabold mt-4">{title}</h2>
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
      <input
        type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
      />
    </div>
  );
}