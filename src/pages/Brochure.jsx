import React from "react";
import {
  Crown, Crown as CrownIcon, Download, Users, Fingerprint, Wallet, Calculator,
  ShieldCheck, BadgeCheck, GraduationCap, GitBranch, Car, FileBadge, Building2,
  Smartphone, MapPin, Bell, ClipboardList, Server, Cpu, HardDrive, MemoryStick,
  Zap, Lock, Globe, CalendarClock, Mail, Linkedin, Twitter, Network, BarChart3,
  Plane, FileText, Clock, BadgeCheck as BadgeIcon, Sparkles, Layers
} from "lucide-react";
import { PROVIDER } from "@/lib/providerIdentity";
import { PRICING_TIERS_AR } from "@/lib/pricing";

// بروفايل/بروشور منصة «جدارة» — فاخر، RTL، A4 قابل للطباعة إلى PDF
// تصميم: كحلي عميق + سماوي + ذهبي + شاشات شفافة. مناسب لعرضه على كبرى الشركات.
const NAVY = "#0A1629";
const NAVY2 = "#0e1f3a";
const CYAN = "#00B8D4";
const GOLD = "#C9A961";

export default function Brochure() {
  const print = () => window.print();

  return (
    <div dir="rtl" lang="ar" className="bg-slate-100 min-h-screen">
      {/* شريط الطباعة */}
      <div className="no-print sticky top-0 z-50 bg-[#0A1629]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Crown size={18} style={{ color: GOLD }} />
            <span className="text-sm font-semibold">بروفايل منصة جدارة</span>
          </div>
          <button onClick={print}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#00B8D4] hover:bg-[#00a6c0] text-white text-sm font-semibold shadow-lg shadow-cyan-500/30">
            <Download size={16} /> تصدير PDF
          </button>
        </div>
      </div>

      <div className="print-brochure mx-auto" style={{ width: "100%", maxWidth: 1100 }}>
        {/* ===== COVER ===== */}
        <Cover />

        {/* ===== INTRO / VISION ===== */}
        <Section tint="light">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <SectionTag color="cyan">رؤية المنصة</SectionTag>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight" style={{ color: NAVY, fontFamily: "var(--font-display)" }}>
                منصة سحابية واحدة<br/>
                <span style={{ color: CYAN }}>تحكم كل رأس مال بشري</span> في مؤسستك
              </h2>
              <p className="mt-5 text-slate-600 leading-loose text-[15px]">
                «جدارة» منصة موارد بشرية سعودية متكاملة، صُمّمت لتحلّ محل كل جداول الإكسل وملفات الورق في إدارتك، وتوحّد إدارة الموظفين، الحضور والبصمة، الرواتب، الإجازات، نهاية الخدمة، الأداء، التدريب، المركبات، التراخيص والاشتراكات الحكومية — في مكان واحد سحابي آمن.
              </p>
              <p className="mt-3 text-slate-600 leading-loose text-[15px]">
                نظام مبنى ليعمل مع المؤسسات الصغيرة وحتى كبرى الشركات — بأداء ثابت وسعة تصل إلى <b style={{ color: NAVY }}>25,000 موظف</b> في منشأة واحدة.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <KpiBox big="18+" label="وحدة إدارية متكاملة" />
              <KpiBox big="25K" label="سعة موظفين بمنشأة" />
              <KpiBox big="99.9%" label="جاهزية الخدمة SLA" />
              <KpiBox big="30 يوم" label="تجربة مجانية" accent />
            </div>
          </div>
        </Section>

        {/* ===== HR MODULES ===== */}
        <Section tint="dark" heading={<Heading dark icon={<Layers />} title="وحدات إدارة الموارد البشرية" sub="منصة واحدة تدير دورة حياة الموظف كاملة، من أول يوم عمل إلى أخر يوم خدمة" />}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ModuleCard icon={Users} title="إدارة الموظفين" desc="ملف موظف شامل — الهوية، الإقامة، الجوالز، العقد، الراتب، البنك، التأمين، المباشرة، الترقيات، الحالة الوظيفية — مع ربط بخط الموافقين المباشرين." />
            <ModuleCard icon={Fingerprint} title="الحضور والبصمة بالتطبيق" desc="بصمة موظفين عبر تطبيق الجوال مع تحديد الموقع (GPS) ونطاق البصمة للفرع، شامل فترات الراحة، ساعات العمل الصافية، التأخر، التغيب والإجازات." />
            <ModuleCard icon={Wallet} title="الرواتب تولّد تلقائياً" desc="بناء كشف رواتب شهري مباشرة من بيانات البصمة — راتب أساسي، بدلات، عمل إضافي، خصومات، تغيب، تسبيق السلفة، تأمينات GOSI وصافي الراتب." />
            <ModuleCard icon={ShieldCheck} title="التأمينات الاجتماعية (GOSI)" desc="احتساب GOSI السعوديين والمقيمين بنسب المنشأة القابلة للتعديل — مع بيانات الموظف ومسجل شهرى قابل للتصدير." />
            <ModuleCard icon={Calculator} title="نهاية الخدمة" desc="حساب EOS وفق نظام العمل — نصف راتب، راتب كامل، أحكام خاصة — مع تصفية رصيد الإجازات والمستحقات والمت进行调整ات والكشف القانوني." />
            <ModuleCard icon={CalendarClock} title="الإجازات والموافقات" desc="رصيد سنوي محسوب تناسبياً من تاريخ المباشرة، مسار موافقات متعدد المراحل — مدير مباشر ثم الموارد البشرية ثم المالية — مع كامل سجل الحالات." />
            <ModuleCard icon={BarChart3} title="إدارة الأداء" desc="تقييمات متعددة المعايير — الكفاءة، السلوك، المعرفة، المجال المهني، الخبرة — مع توصية التثبيت أو الفصل أو التمديد وثائق داعمة." />
            <ModuleCard icon={GraduationCap} title="التدريب والتطوير" desc="خطط تدريب فردية أو جماعية — تشخيص نقص، هدف، آلية تنفيذ، تكلفة، فترة — مع متابعة الانتهاء وقياس الأثر." />
            <ModuleCard icon={GitBranch} title="التخطيط التعاقبي" desc="تحديد المسميات الحساسة، المهارات المطلوبة، المؤهلون، فجوة الجاهزية وخطط الإعداد — ك	valid+التطوير المسار الوظيفي للمواهب." />
            <ModuleCard icon={Building2} title="الهيكل التنظيمي" desc="إدارة قائمة الإدارات والأقسام والفروع والوحدات، مع رسم شجري للعلاقات الوظيفية والتدرج الهرمي." />
            <ModuleCard icon={Users} title="تخطيط القوة العاملة" desc="إسقاط احتياج الموظفين على الإدارات، تحليل الفجوة بين الميزانية والفعلي، وإعداد خطط التوظيف." />
            <ModuleCard icon={Plane} title="رحلات العمل والانتداب" desc="إنشاء طلبات رحلات العمل، اعتماد مدير مباشر وموارد بشرية ومالية، تذاكر وتكلفة، موافقات مقدّمة + دفع للموظف، تقارير وكشف رسمي." />
          </div>
        </Section>

        {/* ===== RECRUITMENT + REQUESTS ===== */}
        <Section tint="light" heading={<Heading icon={<Network />} title="إدارة التوظيف ومسار الطلبات" sub="من إعلان الوظيفة وحتى التعيين، ومسار كامل للطلبات الموثّقة بين الموظف والمؤسسة والموافق" />}>
          <div className="grid md:grid-cols-2 gap-5">
            <BigCard icon={Users} title="إدارة التوظيف بكل أنواعها">
              <ul className="space-y-2 text-slate-600 text-[15px]">
                <li>• إعلان الوظائف، المسمى، المهنة، الدرجة، النوع، الراتب، المؤهلات، المهام، عدد الشواغر</li>
                <li>• استقبال الطلبات، الكوادر، المقابلات، نتائج التقييم والتثبيت</li>
                <li>• تقييم فترة التجربة (الكفاءة، السلوك، المعرفة، المجال، الخبرة) والتوصية بالتثبيت أو الفصل</li>
                <li>• خطاب التعيين ومستند القرار — توليد رسمي</li>
              </ul>
            </BigCard>
            <BigCard icon={ClipboardList} title="مسار الطلبات والسجل التاريخي">
              <ul className="space-y-2 text-slate-600 text-[15px]">
                <li>• طلبات الإجازات، السلف، رحلات العمل، تعديل البصمة — كلها في بوابة الموظف</li>
                <li>• مسار موافقات متعدّد المراحل: الموظف ← المدير المباشر ← الموارد البشرية ← المالية</li>
                <li>• كل حالة محفوظة كـ <b>Record</b> ومسجّل عليها التاريخ والمعتمد والملاحظات</li>
                <li>• إبقاء آخر <b> 20 </b> طلب <b>مكتمل</b> محفوظة وسجل تاريخ كامل لكل طلب</li>
              </ul>
            </BigCard>
          </div>
        </Section>

        {/* ===== OPERATIONS MODULES ===== */}
        <Section tint="dark" heading={<Heading dark icon={<Car />} title="إدارة التشغيل والامتثال" sub="وحدات مالية وحوكمية مكتملة لكل حدث من أحداث المنشأة" />}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ModuleCard icon={Car} title="إدارة المركبات (الأسطول)" desc="تسجيل المركبات، السائقين، الرحلات، الصيانة، التأمين، الإقامة وأiste المركبة + روابط بالموظفين." />
            <ModuleCard icon={FileBadge} title="رخص المنشأة الحكومية" desc="إدارة كاملة لكل تراخيص المنشأة — بلدي، تجاري، آمنة، صحي، مهني وغيرها — مع إنتهاء وتنبيه." />
            <ModuleCard icon={Building2} title="اشتراكات المنصات الحكومية" desc="أبشر أعمال، مقيم، تمو، قوة، مدد، التأمينات، وطن، واثق، بلدي، معروف، اعتماد، زاتكا، المركز السعودي للأعمال، إيجار، مكتب العمل، وغيرها — تسجيل اشتراك وتواريخ وتكاليف." />
            <ModuleCard icon={FileText} title="الإنذارات والسياسة" desc="إنذارات بثلاث درجات حسب نوع المخالفة، تسجيل الواقعة وإجراء الجلسة، التحقق، مرجع النظام، الاعتماد والتوقيع الإلكتروني." />
            <ModuleCard icon={BadgeIcon} title="مقابلات إنهاء الخدمة" desc="مقابلة منفصلة عند نهاية الخدمة، تحليل أسباب الديمومة، مقترحات تحسين — كـ+سريavadoc للإدارة." />
            <ModuleCard icon={BarChart3} title="التحليلات والتقارير" desc="تقارير البصمة، الرواتب، الإجازات، DNS، التوظيف — مع لوحة قيادة تحليلية لصانع القرار." />
          </div>
        </Section>

        {/* ===== EMPLOYEE PORTAL + APP ===== */}
        <Section tint="light" heading={<Heading icon={<Smartphone />} title="بوابة الموظف الذاتية والتطبيق" sub="تطبيق حقيقي على الجوال — بوابة خاصة بكل موظف" />}>
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            <BigCard icon={Smartphone} title="تطبيق جدارة للموظف">
              <ul className="space-y-2 text-slate-700 text-[15px]">
                <li className="flex items-center gap-2"><BadgeCheck size={16} style={{ color: CYAN }} /> بوابة ذاتية — الملف الوظيفي، الراتب، الرصيد الإجازات، السلف ومراحل الموافقة</li>
                <li className="flex items-center gap-2"><BadgeCheck size={16} style={{ color: CYAN }} /> بصمة الحضور والانصراف من التطبيق مع تحديد الموقع <MapPin size={14} className="inline" /></li>
                <li className="flex items-center gap-2"><BadgeCheck size={16} style={{ color: CYAN }} /> تقديم طلبات الإجازة، السلف، رحلات العمل ومتابعة الموافقة</li>
                <li className="flex items-center gap-2"><BadgeCheck size={16} style={{ color: CYAN }} /> استلام المخالصات والكشوف الرسمية بصيغة PDF داخل التطبيق</li>
                <li className="flex items-center gap-2"><BadgeCheck size={16} style={{ color: CYAN }} /> مساعد ذكي للدردشة يجاوب على استفسارات الموظف</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Badge icon={<BadgeCheck size={14} />} tone="green">متاح الآن على Google Play</Badge>
                <Badge icon={<Clock size={14} />} tone="amber">قريباً على App Store (خلال الشهر القادم)</Badge>
              </div>
            </BigCard>
            <PhoneMock />
          </div>
        </Section>

        {/* ===== SERVER / INFRA ===== */}
        <Section tint="dark" heading={<Heading dark icon={<Server />} title="بنية تحتية خاصة فاخرة" sub="سيرفر VPS سحابي خاص بأعلى المواصفات — ليس استضافة مشتركة" />}>
          <div className="grid md:grid-cols-[1.1fr,1fr] gap-6">
            <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0e1f3a] to-[#0A1629] border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 text-white mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center">
                  <Server size={20} style={{ color: CYAN }} />
                </div>
                <div>
                  <div className="font-extrabold text-lg">سيرفر VPS سحابي خاص</div>
                  <div className="text-xs text-white/60">مخصص لمؤسستك بالكامل — أداء 100%</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Spec icon={Cpu} big="12 vCores" small="معالج افتراضي كامل" />
                <Spec icon={MemoryStick} big="24 GB" small="ذاكرة فائقة" />
                <Spec icon={HardDrive} big="720 GB" small="تخزين NVMe" />
              </div>
              <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-xs text-white/60">سعة السيرفر</div>
                <div className="text-lg font-extrabold text-white flex items-center justify-center gap-1.5">
                  <Users size={16} style={{ color: CYAN }} /> حتى 25,000 موظف
                </div>
                <div className="text-[11px] text-white/50">في منشأة واحدة دون أي تأثير على السرعة</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TrustChip dark icon={Globe} label="سحابة خاصة" />
              <TrustChip dark icon={Lock} label="تشفير كامل TLS" />
              <TrustChip dark icon={ShieldCheck} label="نسخ احتياطي يومي" />
              <TrustChip dark icon={Zap} label="NVMe فائق السرعة" />
              <TrustChip dark icon={BadgeCheck} label="جاهزية 99.9%" />
              <TrustChip dark icon={Cpu} label="عزل كامل" />
            </div>
          </div>
        </Section>

        {/* ===== PRICING ===== */}
        <Section tint="light" heading={<Heading icon={<Sparkles />} title="الباقات والأسعار السنوية" sub="خمس شرائح مرنة تناسب كل أحجام المنشآت — كل الباقات بنفس المميزات" />}>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-right">
              <thead>
                <tr style={{ background: NAVY, color: "#fff" }}>
                  <Th>الباقة</Th><Th>عدد الموظفين</Th><Th>الاشتراك السنوي</Th><Th>رسوم التأسيس (مرة)</Th><Th>إجمالي السنة الأولى</Th>
                </tr>
              </thead>
              <tbody>
                {PRICING_TIERS_AR.map((t, i) => (
                  <tr key={t.id} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                    <td className="py-3 px-4 font-extrabold" style={{ color: NAVY }}>{t.tier}</td>
                    <td className="py-3 px-4 text-slate-600">{t.range}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: CYAN }}>{t.yearly.toLocaleString()} ر.س</td>
                    <td className="py-3 px-4 text-slate-600">{t.setup ? `${t.setup.toLocaleString()} ر.س` : "—"}</td>
                    <td className="py-3 px-4 font-extrabold" style={{ color: NAVY }}>{t.custom ? "حسب الاتفاق" : `${t.year1.toLocaleString()} ر.س`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-slate-500 mt-3">
            جميع الباقات تشمل كامل المميزات دون استثناء · تجربة مجانية 30 يوماً قبل الالتزام
          </p>
        </Section>

        {/* ===== CONTACT / CLOSING ===== */}
        <Closing />
      </div>
    </div>
  );
}

/* =================== الأقسام الجمالية =================== */

function Cover() {
  return (
    <div style={{ background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY2} 55%, #07101f 100%)`, padding: "56px 48px", position: "relative", overflow: "hidden" }}>
      {/* زخارف خلفية */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${CYAN}22 0%, transparent 70%)` }} />
      <div style={{ position: "absolute", bottom: -100, left: -60, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}18 0%, transparent 70%)` }} />

      <div style={{ position: "relative", minHeight: 920, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* شعار */}
        <div className="flex items-center gap-3">
          <div style={{ width: 56, height: 56, borderRadius: 18, background: `linear-gradient(135deg, #000, ${NAVY2})`, boxShadow: `0 0 0 1px ${GOLD}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Crown size={28} style={{ color: GOLD }} strokeWidth={1.6} />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>جدارة</div>
            <div style={{ color: "#9fb3c8", fontSize: 12 }}>لإدارة الموارد البشرية</div>
          </div>
        </div>

        {/* العنوان */}
        <div className="text-center" style={{ margin: "30px 0" }}>
          <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 999, background: `${CYAN}1A`, border: `1px solid ${CYAN}55`, color: CYAN, fontSize: 12, fontWeight: 700, marginBottom: 18 }}>
            COMPANY PROFILE · بروفايل المنصة
          </div>
          <h1 style={{ color: "#fff", fontSize: 52, fontWeight: 800, lineHeight: 1.15, fontFamily: "var(--font-display)", marginBottom: 14 }}>
            منصة جدارة<br/>
            <span style={{ color: CYAN, fontSize: 44 }}>لإدارة الموارد البشرية</span>
          </h1>
          <p style={{ color: "#cdd9e6", fontSize: 17, maxWidth: 720, margin: "0 auto", lineHeight: 1.9 }}>
            منظومة سعودية متكاملة — صُمّمت لتدير كل رأس مال بشري في مؤسستك<br/>
            من البصمة إلى الراتب، ومن المباشرة إلى نهاية الخدمة، في مكان واحد آمن.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["إدارة الموظفين", "البصمة بالموقع", "رواتب تلقائية", "نهاية الخدمة", "التوظيف", "البوابة الذاتية"].map((b) => (
              <span key={b} style={{ fontSize: 12, fontWeight: 600, color: "#e8eef5", padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}>{b}</span>
            ))}
          </div>
        </div>

        {/* ترويسة سفلية - المؤسسة */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 12, color: "#9fb3c8", marginBottom: 4 }}>مُقدّم من</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{PROVIDER.institutionName}</div>
            <div style={{ fontSize: 11, color: "#9fb3c8", marginTop: 2 }}>
              الرقم الوطني الموحد للمنشآت: <span style={{ fontFamily: "ui-monospace, monospace", direction: "ltr", display: "inline-block" }}>{PROVIDER.unifiedNumber}</span>
            </div>
          </div>
          <div style={{ color: "#9fb3c8", fontSize: 11, textAlign: "center" }}>
            <div>متاح الآن على Google Play · قريباً على App Store</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ tint, heading, children }) {
  const dark = tint === "dark";
  return (
    <div style={{ background: dark ? NAVY : "#fff", color: dark ? "#fff" : NAVY, padding: "44px 48px" }}>
      {heading && <div style={{ marginBottom: 28 }}>{heading}</div>}
      {children}
    </div>
  );
}

function Heading({ icon, title, sub, dark }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
        style={{ background: dark ? "rgba(0,184,212,.12)" : "rgba(0,184,212,.10)", color: CYAN, border: `1px solid ${CYAN}44` }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", color: dark ? "#fff" : NAVY, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 14, color: dark ? "#a9bcd0" : "#64748b", maxWidth: 680 }}>{sub}</p>
      <div style={{ width: 56, height: 3, borderRadius: 999, background: CYAN, marginTop: 12 }} />
    </div>
  );
}

function SectionTag({ color = "cyan", children }) {
  const palette = { cyan: `${CYAN}22`, gold: `${GOLD}25` };
  return (
    <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, color: color === "gold" ? GOLD : CYAN, background: palette[color], border: `1px solid ${color === "gold" ? GOLD : CYAN}55`, padding: "5px 14px", borderRadius: 999 }}>
      {children}
    </span>
  );
}

function KpiBox({ big, label, accent }) {
  return (
    <div className="rounded-2xl p-5 border" style={{ background: accent ? `linear-gradient(135deg, ${NAVY}, ${NAVY2})` : "#fff", borderColor: accent ? NAVY : "#e2e8f0", color: accent ? "#fff" : NAVY }}>
      <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)" }}>{big}</div>
      <div style={{ fontSize: 12, marginTop: 4, color: accent ? "#a9bcd0" : "#64748b" }}>{label}</div>
    </div>
  );
}

function ModuleCard({ icon: I, title, desc, dark }) {
  return (
    <div className="rounded-2xl p-5 border flex flex-col gap-2 transition"
      style={{ background: dark ? "rgba(255,255,255,.04)" : "#fff", borderColor: dark ? "rgba(255,255,255,.12)" : "#e7edf3", color: dark ? "#dbe7f3" : "#475569" }}>
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${CYAN}1A`, color: CYAN, border: `1px solid ${CYAN}40` }}>
          <I size={18} />
        </div>
        <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: dark ? "#fff" : NAVY }}>{title}</h4>
      </div>
      <p className="text-[13.5px] leading-relaxed mt-1">{desc}</p>
    </div>
  );
}

function BigCard({ icon: I, title, children }) {
  return (
    <div className="rounded-2xl p-6 border bg-white" style={{ borderColor: "#e7edf3" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${CYAN}1A`, color: CYAN, border: `1px solid ${CYAN}40` }}>
          <I size={20} />
        </div>
        <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: NAVY }}>{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Spec({ icon: I, big, small }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}>
      <I size={18} style={{ color: CYAN, margin: "0 auto 4px" }} />
      <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>{big}</div>
      <div style={{ fontSize: 10, color: "#9fb3c8", marginTop: 2 }}>{small}</div>
    </div>
  );
}

function TrustChip({ icon: I, label, dark }) {
  return (
    <div className="rounded-xl px-3 py-2.5 flex items-center gap-2"
      style={{ background: dark ? "rgba(255,255,255,.06)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,.12)" : "#e7edf3"}` }}>
      <I size={16} style={{ color: CYAN }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: dark ? "#fff" : NAVY }}>{label}</span>
    </div>
  );
}

function Badge({ icon, tone, children }) {
  const tones = {
    green: `${CYAN}1A`,
    amber: `${GOLD}22`,
  };
  const colors = { green: CYAN, amber: GOLD };
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: tones[tone], color: colors[tone], border: `1px solid ${colors[tone]}55` }}>
      {icon} {children}
    </span>
  );
}

function PhoneMock() {
  const screen = {
    background: `linear-gradient(160deg, ${NAVY2}, ${NAVY})`,
    borderRadius: 28, padding: 16, color: "#fff", height: "100%", minHeight: 360,
    display: "flex", flexDirection: "column", gap: 10
  };
  return (
    <div className="flex justify-center">
      <div style={{ width: 280, padding: 10, borderRadius: 36, background: "#0a0f1c", boxShadow: "0 25px 60px -20px rgba(10,22,41,.5)", border: "1px solid rgba(255,255,255,.08)" }}>
        <div style={screen}>
          <div className="flex items-center gap-2">
            <Crown size={14} style={{ color: GOLD }} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>جدارة</span>
            <span style={{ fontSize: 10, color: "#7d92a8", marginRight: "auto" }}>بوابة الموظف</span>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)" }}>
            <div style={{ fontSize: 10, color: "#9fb3c8" }}>صباح الخير، أحمد</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>قسم التشغيل · مدير العمليات</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[{I: Fingerprint, t: "بصمة"}, {I: CalendarClock, t: "إجازة"}, {I: Wallet, t: "سلفة"}].map((x, i) => (
              <div key={i} className="rounded-lg py-3" style={{ background: "rgba(0,184,212,.12)", border: "1px solid rgba(0,184,212,.25)" }}>
                <x.I size={16} style={{ color: CYAN, margin: "0 auto 4px" }} />
                <div style={{ fontSize: 10 }}>{x.t}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3 flex-1" style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.10)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>آخر الطلبات</div>
            {[{t: "إجازة سنوية — مُعتمدة", c: "#34d399"}, {t: "سلفة الراتب — بانتظار المالية", c: "#fbbf24"}, {t: "تعديل بصمة — موافق", c: "#34d399"}].map((x, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/5 text-[11px]">
                <span style={{ width: 6, height: 6, borderRadius: 999, background: x.c }} /> {x.t}
              </div>
            ))}
          </div>
          <button className="rounded-xl py-2.5 text-center font-bold text-xs" style={{ background: `linear-gradient(135deg, ${CYAN}, #0096b5)`, color: "#fff" }}>
            <Fingerprint size={13} className="inline ml-1" /> تسجيل الحضور الآن
          </button>
        </div>
      </div>
    </div>
  );
}

function Closing() {
  return (
    <div style={{ background: `linear-gradient(160deg, ${NAVY}, #07101f)`, color: "#fff", padding: "48px" }}>
      <div className="text-center max-w-2xl mx-auto">
        <Crown size={32} style={{ color: GOLD }} />
        <h2 style={{ fontSize: 30, fontWeight: 800, marginTop: 10, fontFamily: "var(--font-display)" }}>
          لنبدأ رحلتك مع <span style={{ color: CYAN }}>جدارة</span>
        </h2>
        <p style={{ fontSize: 14, color: "#a9bcd0", marginTop: 10, lineHeight: 1.9 }}>
          جرّب المنصة 30 يوماً مجاناً واكتشف كيف تتحوّل إدارة مواردك البشرية إلى نظام رقمي موحّد وفاخر.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-7">
          <div className="inline-flex items-center gap-2 rounded-2xl px-5 py-3" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}>
            <Mail size={18} style={{ color: CYAN }} />
            <a href="mailto:info@jadara-hr.com" style={{ color: "#fff", fontWeight: 700, fontSize: 15 }} dir="ltr">info@jadara-hr.com</a>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl px-5 py-3" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}>
            <Globe size={18} style={{ color: CYAN }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }} dir="ltr">jadara-hr.com</span>
          </div>
        </div>

        {/* سوشيال */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Social icon={Twitter} label="X / تويتر" />
          <Social icon={Linkedin} label="LinkedIn" />
          <Social icon={Globe} label="الموقع" />
        </div>
      </div>

      <div className="mt-10 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/50 text-xs">
        <div>© {new Date().getFullYear()} {PROVIDER.institutionName} — جميع الحقوق محفوظة</div>
        <div>الرقم الوطني الموحد للمنشآت: <span style={{ fontFamily: "ui-monospace, monospace", direction: "ltr" }}>{PROVIDER.unifiedNumber}</span></div>
      </div>
    </div>
  );
}

function Social({ icon: I, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-4 py-2" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", fontSize: 12, color: "#cdd9e6" }}>
      <I size={14} style={{ color: CYAN }} /> {label}
    </span>
  );
}

function Th({ children }) {
  return <th className="py-3 px-4 text-[13px] font-bold">{children}</th>;
}