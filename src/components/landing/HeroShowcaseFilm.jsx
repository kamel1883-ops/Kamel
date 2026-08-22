import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, CheckCircle2, Fingerprint, Wallet, FileSpreadsheet, BarChart3,
  TrendingUp, TrendingDown, Users, CalendarCheck, ShieldCheck, Clock,
  ArrowLeft, Bell, BadgeCheck, DollarSign,
} from "lucide-react";

const SCENES = [
  { key: "attendance", label: "البصمة من الجوال" },
  { key: "payroll", label: "أتمتة الرواتب" },
  { key: "reports", label: "التقارير والتحليلات" },
  { key: "approvals", label: "مسار الموافقات" },
];

const fade = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, scale: 1.005, transition: { duration: 0.4, ease: "easeIn" } },
};

function SceneAttendance() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-8 p-6">
      <div className="hidden flex-col items-center gap-2 text-white/70 sm:flex">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <Fingerprint size={26} className="text-violet-200" />
        </div>
        <span className="text-xs">بصمة ذاتية</span>
        <div className="mt-2 flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] text-emerald-200 ring-1 ring-emerald-300/25">
          <MapPin size={12} /> ضمن 50 متراً
        </div>
      </div>

      {/* محاكاة هاتف */}
      <div className="relative h-[330px] w-[190px] rounded-[2.2rem] border-[6px] border-white/20 bg-[#0b1f3e] shadow-2xl">
        <div className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/30" />
        <div className="flex h-full flex-col items-center px-4 pb-5 pt-7">
          <div className="text-[11px] text-white/60">جدارة — بوابة الموظف</div>
          <div className="mt-4 text-center">
            <div className="text-[13px] font-bold text-white">تسجيل الحضور</div>
            <div className="mt-1 text-[10px] text-white/50">السبت 22 أغسطس 2026</div>
          </div>

          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#CBA83A] to-[#B6901F] shadow-lg shadow-amber-600/30"
          >
            <Fingerprint size={46} className="text-[#0B2545]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-5 flex flex-col items-center gap-1 rounded-xl bg-emerald-400/15 px-3 py-2 text-center ring-1 ring-emerald-300/25"
          >
            <CheckCircle2 size={16} className="text-emerald-300" />
            <div className="text-[11px] font-semibold text-emerald-200">تم تسجيل الحضور</div>
            <div className="text-[10px] text-emerald-200/70" dir="ltr">08:02 ص</div>
          </motion.div>

          <div className="mt-auto w-full rounded-lg bg-white/5 px-3 py-2 text-center text-[10px] text-white/55">
            الموقع ضمن نطاق مقر العمل
          </div>
        </div>
      </div>

      <div className="hidden flex-col gap-2 sm:flex">
        {[
          { t: "تدفق تلقائي للرواتب", i: Wallet },
          { t: "بدون أجهزة بصمة", i: CheckCircle2 },
          { t: "7 لغات للموظف", i: Users },
        ].map((x) => {
          const I = x.i;
          return (
            <div key={x.t} className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs text-white/75 ring-1 ring-white/10">
              <I size={14} className="text-amber-300" /> {x.t}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScenePayroll() {
  const rows = [
    { n: "أحمد العتيبي", id: "1098•••21", net: 8450, st: "approved" },
    { n: "سارة القحطاني", id: "1077•••55", net: 9200, st: "paid" },
    { n: "خالد المالكي", id: "1092•••18", net: 7800, st: "draft" },
    { n: "نورة الشهري", id: "1055•••91", net: 8100, st: "approved" },
  ];
  const badge = {
    approved: { t: "معتمد", c: "text-emerald-200 bg-emerald-400/15 ring-emerald-300/25" },
    paid: { t: "مصروف", c: "text-amber-200 bg-amber-400/15 ring-amber-300/25" },
    draft: { t: "مسودة", c: "text-white/60 bg-white/8 ring-white/15" },
  };
  return (
    <div className="flex h-full w-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-white">مسير رواتب — أغسطس 2026</div>
          <div className="text-xs text-white/50">احتساب آلي • خصم unrestricted • اعتماد دفعي</div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-400/15 px-3 py-2 text-xs font-semibold text-amber-200 ring-1 ring-amber-300/25">
          <FileSpreadsheet size={14} /> 4 موظفين
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
        <div className="grid grid-cols-[1.4fr,1fr,0.8fr,0.7fr] bg-white/5 px-4 py-2 text-[11px] font-semibold text-white/60">
          <span>الموظف</span><span>الهوية / الإقامة</span><span>صافي الراتب</span><span>الحالة</span>
        </div>
        {rows.map((r, idx) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 * idx }}
            className="grid grid-cols-[1.4fr,1fr,0.8fr,0.7fr] items-center border-t border-white/5 px-4 py-2.5 text-xs"
          >
            <span className="font-medium text-white">{r.n}</span>
            <span className="text-white/55" dir="ltr">{r.id}</span>
            <span className="font-semibold text-amber-200" dir="ltr">{r.net.toLocaleString()} ر.س</span>
            <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${badge[r.st].c}`}>{badge[r.st].t}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex gap-5 text-xs">
          <div><div className="text-white/50">إجمالي الصافي</div><div className="mt-0.5 text-base font-bold text-amber-200" dir="ltr">33,550 ر.س</div></div>
          <div><div className="text-white/50">GOSI</div><div className="mt-0.5 text-base font-bold text-white" dir="ltr">2,140 ر.س</div></div>
        </div>
        <motion.button
          animate={{ boxShadow: ["0 0 0 0 rgba(203,168,58,0.4)", "0 0 0 10px rgba(203,168,58,0)"] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#CBA83A] to-[#B6901F] px-4 py-2 text-sm font-semibold text-[#0B2545]"
        >
          <CheckCircle2 size={15} /> اعتماد وصرف الكشف
        </motion.button>
      </div>
    </div>
  );
}

function SceneReports() {
  const bars = [42, 58, 35, 72, 88, 64, 95];
  const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  return (
    <div className="flex h-full w-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-white">تقارير وتحليلات لحظية</div>
          <div className="text-xs text-white/50">توصيات آلية بالذكاء الاصطناعي • تصدير PDF</div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
          <BarChart3 size={14} className="text-violet-200" /> لوحة الموارد البشرية
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "إجمالي القوى العاملة", v: "248", i: Users, c: "text-violet-200" },
          { l: "نسبة التوطين", v: "38%", i: ShieldCheck, c: "text-emerald-200" },
          { l: "معدل الدوران", v: "4.2%", i: TrendingDown, c: "text-amber-200" },
        ].map((k) => {
          const I = k.i;
          return (
            <motion.div key={k.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
              <I size={16} className={k.c} />
              <div className="mt-2 text-xl font-bold text-white">{k.v}</div>
              <div className="text-[11px] text-white/50">{k.l}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid flex-1 grid-cols-[1.6fr,1fr] gap-3">
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-white/80">الحضور الأسبوعي</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-200"><TrendingUp size={12} /> +12%</div>
          </div>
          <div className="mt-4 flex h-[140px] items-end gap-2">
            {bars.map((b, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${b}%` }} transition={{ delay: 0.1 * i, duration: 0.6 }}
                className="flex-1 rounded-t-md bg-gradient-to-t from-[#1E3B66] to-[#CBA83A]" />
            ))}
          </div>
          <div className="mt-2 flex gap-2 text-[9px] text-white/40">
            {days.map((d) => <span key={d} className="flex-1 text-center">{d.slice(0, 4)}</span>)}
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="text-xs font-semibold text-white/80">التوصيات الذكية</div>
          <div className="mt-3 space-y-2">
            {[
              { t: "إدارة العمليات أعلى مخاطر دوران", c: "text-rose-200" },
              { t: "3 عقود تقارب الانتهاء", c: "text-amber-200" },
              { t: "ارتفاع الاستبقاء 2.1%", c: "text-emerald-200" },
            ].map((r) => (
              <div key={r.t} className="flex items-start gap-2 rounded-lg bg-white/5 p-2 text-[11px] ring-1 ring-white/10">
                <BadgeCheck size={13} className={`mt-0.5 shrink-0 ${r.c}`} />
                <span className="text-white/75">{r.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneApprovals() {
  const steps = [
    { t: "رفع الطلب", s: "done", i: CalendarCheck },
    { t: "المدير المباشر", s: "done", i: Users },
    { t: "الموارد البشرية", s: "active", i: ShieldCheck },
    { t: "المالية - الصرف", s: "wait", i: DollarSign },
  ];
  const dot = { done: "bg-emerald-400 text-[#0B2545]", active: "bg-amber-400 text-[#0B2545]", wait: "bg-white/10 text-white/40" };
  return (
    <div className="flex h-full w-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-white">طلب إجازة سنوية</div>
          <div className="text-xs text-white/50">مسار موافقات متعدد المراحل</div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-400/15 px-3 py-1.5 text-xs text-amber-200 ring-1 ring-amber-300/25">
          <Clock size={13} /> قيد الاعتماد
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/55">الموظف: <span className="font-semibold text-white">أحمد العتيبي</span></span>
          <span className="text-white/55">5 أيام</span>
        </div>
        <div className="mt-2 text-[11px] text-white/45">من 1 سبتمبر إلى 5 سبتمبر 2026</div>
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        {steps.map((st, i) => {
          const I = st.i;
          return (
            <React.Fragment key={st.t}>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <motion.div
                  animate={st.s === "active" ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ring-white/15 ${dot[st.s]}`}
                >
                  <I size={18} />
                </motion.div>
                <span className="max-w-[90px] text-[10px] text-white/70">{st.t}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div initial={{ width: st.s === "done" ? "100%" : "0%" }} animate={{ width: "100%" }} transition={{ duration: 0.8 }}
                    className={`h-full ${st.s === "done" ? "bg-emerald-400" : "bg-amber-400/40"}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-auto flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-200 ring-1 ring-amber-300/25">
          <ShieldCheck size={18} />
        </div>
        <div className="flex-1 text-xs">
          <div className="font-semibold text-white">موافقة الموارد البشرية</div>
          <div className="mt-0.5 text-white/55">مراجعة الرصيد والتذاكر والتصفية المالية</div>
        </div>
        <motion.button
          animate={{ boxShadow: ["0 0 0 0 rgba(203,168,58,0.4)", "0 0 0 8px rgba(203,168,58,0)"] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="rounded-xl bg-gradient-to-r from-[#CBA83A] to-[#B6901F] px-4 py-2 text-xs font-semibold text-[#0B2545]"
        >
          اعتماد
        </motion.button>
      </div>
    </div>
  );
}

export default function HeroShowcaseFilm({ isAr, lang }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % SCENES.length), 5200);
    return () => clearInterval(id);
  }, []);
  const scene = SCENES[i];
  const render = { attendance: SceneAttendance, payroll: ScenePayroll, reports: SceneReports, approvals: SceneApprovals }[scene.key];
  const Scene = render;

  if (!isAr) {
    // نسخة مختصرة للإنجليزية — نفس البنية
    return (
      <div className="relative w-full overflow-hidden rounded-3xl border border-white/12 bg-[#0c2a52]/70 shadow-2xl backdrop-blur-sm">
        <div className="relative h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div key={scene.key} variants={fade} initial="initial" animate="show" exit="exit" className="absolute inset-0">
              <Scene />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-white/70"><Bell size={13} className="text-amber-300" /> Live product preview</div>
          <div className="flex gap-1.5">
            {SCENES.map((s, idx) => (
              <button key={s.key} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-7 bg-[#DBC364]" : "w-3 bg-white/25"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/12 bg-[#0c2a52]/70 shadow-2xl backdrop-blur-sm">
      {/* توهج خفيف */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-rose-400/70" />
            <span className="h-2 w-2 rounded-full bg-rose-400" />
          </span>
          <span className="text-xs font-semibold text-white/80">عرض حيّ للنظام</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-[11px] text-white/70 ring-1 ring-white/12">
          <Sparkles /> ميزة {i + 1} من {SCENES.length}
        </div>
      </div>

      <div className="relative h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div key={scene.key} variants={fade} initial="initial" animate="show" exit="exit" className="absolute inset-0">
            <Scene />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative flex items-center justify-between border-t border-white/10 px-5 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
          <ArrowLeft size={14} className="text-amber-300" /> {scene.label}
        </div>
        <div className="flex gap-1.5">
          {SCENES.map((s, idx) => (
            <button key={s.key} onClick={() => setI(idx)} aria-label={s.label}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-[#DBC364]" : "w-3 bg-white/25 hover:bg-white/40"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Sparkles() {
  return <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-br from-[#DBC364] to-[#B6901F]" />;
}