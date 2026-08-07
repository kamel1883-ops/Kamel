import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import A4Page from "@/components/brochure/A4Page";
import {
  Users, CalendarCheck, Plane, Wallet, Network, TrendingUp, FileText,
  AlertTriangle, Building2, Car, Crown, BarChart3, Settings as Cog,
  Coins, Clock, Fingerprint, MapPin, Languages, Cloud, CreditCard,
  Bell, ClipboardCheck, Target, Award, Layers, Briefcase, Stamp,
  ReceiptText, CircleCheck, ShieldCheck, Link2, ArrowLeftRight, PieChart,
  UserCog, Download, Loader2, Sparkles, Phone, Mail, Globe, ScanLine
} from "lucide-react";

const TOTAL = 15;
const NAVY = "#16243b";
const PURPLE = "#5b3a8a";

const H = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: NAVY }}>
      <Icon size={22} />
    </div>
    <h2 className="text-[22px] font-bold text-slate-900">{children}</h2>
  </div>
);
const Lead = ({ children }) => <p className="text-[13px] leading-7 text-slate-600 mb-4">{children}</p>;
const Pill = ({ children }) => (
  <span className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 mb-3">{children}</span>
);
const Bullet = ({ children }) => (
  <li className="flex items-start gap-2.5 text-[12.5px] leading-6 text-slate-700 mb-2">
    <CircleCheck size={15} className="mt-1 shrink-0" style={{ color: PURPLE }} />
    <span>{children}</span>
  </li>
);
const Grid3 = ({ children }) => <div className="grid grid-cols-3 gap-3.5">{children}</div>;
const Card = ({ icon: Icon, title, desc, tint = NAVY }) => (
  <div className="rounded-2xl border border-slate-200 p-4 flex flex-col">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white mb-3" style={{ background: tint }}>
      <Icon size={18} />
    </div>
    <div className="text-[13px] font-bold text-slate-900 mb-1">{title}</div>
    <div className="text-[11.5px] leading-5 text-slate-500">{desc}</div>
  </div>
);
const Stat = ({ value, label }) => (
  <div className="rounded-2xl border p-4 text-center" style={{ borderColor: NAVY + "22" }}>
    <div className="text-2xl font-bold" style={{ color: NAVY }}>{value}</div>
    <div className="text-[11px] text-slate-500 mt-1">{label}</div>
  </div>
);

const MODULES = [
  ["لوحة المتابعة", BarChart3], ["الموظفون", Users], ["الحضور والانصراف", CalendarCheck],
  ["استيراد البصمات", ScanLine], ["الموافقات", ClipboardCheck], ["الإجازات", Clock],
  ["رحلات العمل", Plane], ["السلف", Wallet], ["الرواتب", Coins],
  ["نهاية الخدمة", ReceiptText], ["التأمينات GOSI", ShieldCheck], ["الأداء", Target],
  ["الإحلال الوظيفي", Award], ["الهيكل التنظيمي", Network], ["التخطيط الوظيفي", Layers],
  ["مقابلات المغادرة", FileText], ["الاستبيانات", PieChart], ["الإنذارات", AlertTriangle],
  ["التحليلات", TrendingUp], ["التراخيص الحكومية", Stamp], ["الأسطول", Car],
  ["لوحة المالك", Crown], ["بوابة الموظف", UserCog], ["الإعدادات ثنائية اللغة", Languages],
];

export default function Brochure() {
  const pageRefs = useRef([]);
  const [loading, setLoading] = useState(false);

  const setRef = (i) => (el) => { pageRefs.current[i] = el; };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      for (let i = 0; i < TOTAL; i++) {
        const node = pageRefs.current[i];
        const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true, windowWidth: 794, windowHeight: 1123 });
        const img = canvas.toDataURL("image/jpeg", 0.93);
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, 210, 297);
      }
      pdf.save("jadara-hr-brochure.pdf");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      {/* Toolbar */}
      <div className="max-w-[888px] mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: NAVY }}>ج</div>
          <div>
            <div className="text-base font-bold text-slate-900">بروشور منصة جدارة</div>
            <div className="text-xs text-slate-500" dir="ltr">jadara-hr.sa · ملف تعريفي كامل PDF</div>
          </div>
        </div>
        <Button onClick={handleDownload} disabled={loading} className="gap-2" style={{ background: NAVY }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {loading ? "جارٍ توليد الملف..." : "تحميل ملف PDF"}
        </Button>
      </div>

      <div className="max-w-[888px] mx-auto">
        {/* PAGE 1 — COVER */}
        <A4Page ref={setRef(0)} total={TOTAL} bare pageNo={1}>
          <div className="absolute inset-0 flex flex-col" style={{ background: "linear-gradient(160deg,#0f1f3d 0%,#1c2f55 55%,#3a2a66 100%)" }}>
            <div className="px-14 pt-14 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-xl font-bold border border-white/20">ج</div>
              <div className="text-white text-xl font-bold tracking-tight">جدارة <span className="text-white/50 font-normal">· Jadara HR</span></div>
            </div>
            <div className="flex-1 px-14 flex flex-col justify-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-[11px] w-fit mb-6">
                <Sparkles size={13} /> إصدار ٢٠٢٧ — نظام سعودي متكامل
              </div>
              <h1 className="text-5xl font-bold leading-tight mb-5">منصة الموارد البشرية<br />السحابية المتكاملة</h1>
              <p className="text-white/70 text-lg leading-9 mb-10 max-w-[560px]">حلٌ متكامل لإدارة الموظفين والحضور والرواتب والتراخيص وبوابة الموظف الذاتية وفق نظام العمل السعودي وبيئة متعددة المنشآت.</p>
              <div className="flex items-center gap-5 text-white/80">
                <span className="text-2xl font-bold" dir="ltr">jadara-hr.sa</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span>SaaS · Cloud · Bilingual</span>
              </div>
            </div>
            <div className="px-14 pb-12 flex items-center gap-2 text-white/50 text-xs">
              <Globe size={13} /> معلومات تجارية · برمجيات بحجم المؤسسات
            </div>
          </div>
        </A4Page>

        {/* PAGE 2 — ABOUT */}
        <A4Page ref={setRef(1)} pageNo={2} total={TOTAL}>
          <Pill>نبذة عن المنصة</Pill>
          <H icon={Sparkles}>ما هي جدارة؟</H>
          <Lead>جدارة منصة سحابية متكاملة لإدارة شؤون الموارد البشرية مبنية على نموذج SaaS متعدد المنشآت، تتيح لكل منشأة العمل ككيان مستقل عبر لوحة تحكم موحدة تُدار من المالك. تجمع المنصة بين الالتزام الكامل بنظام العمل السعودي وتجربة مستخدم عصرية فاخرة تدعم اللغتين العربية والإنجليزية في جميع الشاشات.</Lead>
          <Lead>تشمل المنصة دورة حياة الموظف كاملة؛ من التعيين والهيكل التنظيمي، إلى الحضور والانصراف والاجازات والسلف ورحلات العمل، ثم الرواتب والتأمينات الاجتماعية ومكافأة نهاية الخدمة، وصولاً إلى مقابلات المغادرة والاستبيانات والإنذارات والتحليلات الاستراتيجية.</Lead>
          <Grid3>
            <Stat value="SaaS" label="متعدد المنشآت (Tenant)" />
            <Stat value="عربي · EN" label="ثنائية اللغة الكاملة" />
            <Stat value="GOSI" label="تأمينات اجتماعية آلية" />
          </Grid3>
          <div className="grid grid-cols-3 gap-3.5 mt-3.5">
            <Stat value="EOS" label="نهاية الخدمة الآلية" />
            <Stat value="Cloud" label="سحابي آمن ومستضاف" />
            <Stat value="Stripe" label="دفع مضمّن مدمج" />
          </div>
          <div className="mt-6 rounded-2xl p-5 text-white" style={{ background: NAVY }}>
            <div className="text-[13px] font-bold mb-1.5">منهجية جدارة</div>
            <p className="text-white/70 text-[12px] leading-7">بساطة في الاستخدام · دقة في الحسابات · أتمتة في الإجراءات · أمان وخصوصية لكل منشأة على حدة.</p>
          </div>
        </A4Page>

        {/* PAGE 3 — HIGHLIGHTS */}
        <A4Page ref={setRef(2)} pageNo={3} total={TOTAL}>
          <Pill>المميزات الرئيسية</Pill>
          <H icon={Sparkles}>لماذا جدارة؟</H>
          <Lead>حزمة مميزات تركز على أتمتة الحضور والتنقلات والتحصيل، مع بوابة ذاتية للموظف تقلّل الأعباء الإدارية.</Lead>
          <Grid3>
            <Card icon={MapPin} title="البصمة الذكية الجغرافية" desc="حضور وانصراف من بوابة الموظف بدون أجهزة، ضمن نطاق جغرافي ٥٠ متر من مقر العمل (Geofencing)." tint={NAVY} />
            <Card icon={ScanLine} title="استيراد البصمات الخارجية" desc="حل هجين يدعم استيراد بصمات أجهزة خارجية إلى جانب البصمة المباشرة من بوابة الموظف." tint={PURPLE} />
            <Card icon={Fingerprint} title="الحضور المباشر" desc="تسجيل لحظي مع تحديد حالة اليوم (حاضر/متأخر/غائب) وحساب ساعات العمل تلقائياً." tint={NAVY} />
            <Card icon={Plane} title="إدارة رحلات العمل" desc="طلبات رحلات داخلية وخارجية مع تكاليف النقل والإقامة وبديل الانتداب والسلفة على الحساب." tint={PURPLE} />
            <Card icon={UserCog} title="بوابة الموظف الذاتية" desc="طلب إجازات وسلف ورحلات ومتابعة الحضور وعرض المخالصات والإنذارات بشكل آمن." tint={NAVY} />
            <Card icon={CreditCard} title="دفع مضمّن مدمج" desc="نافذة دفع داخل الموقع تدعم مدى وفيزا و Apple Pay عبر Stripe بدون تحويل خارجي." tint={PURPLE} />
          </Grid3>
        </A4Page>

        {/* PAGE 4 — ALL MODULES */}
        <A4Page ref={setRef(3)} pageNo={4} total={TOTAL}>
          <Pill>خريطة النظام</Pill>
          <H icon={Layers}>وحدات المنصة المتكاملة</H>
          <Lead>٢٤ وحدة متصلة تشكّل منظومة موارد بشرية واحدة متماسكة، مرتبطة بالهيكل التنظيمي وسير الموافقات.</Lead>
          <div className="grid grid-cols-3 gap-2.5">
            {MODULES.map(([t, Icon], i) => (
              <div key={i} className="rounded-xl border border-slate-200 px-3 py-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: i % 2 ? PURPLE : NAVY }}>
                  <Icon size={15} />
                </div>
                <div className="text-[11.5px] font-semibold text-slate-700 leading-tight">{t}</div>
              </div>
            ))}
          </div>
        </A4Page>

        {/* PAGE 5 — EMPLOYEES */}
        <A4Page ref={setRef(4)} pageNo={5} total={TOTAL}>
          <Pill>وحدة الموارد البشرية</Pill>
          <H icon={Users}>إدارة الموظفين</H>
          <Lead>قاعدة بيانات مركزية لكل موظف تشمل البيانات الشخصية والوظيفية والعقدية والامتثالية، مربوطة بالهيكل التنظيمي والمدير المباشر والمستوى الوظيفي.</Lead>
          <ul className="grid grid-cols-2 gap-x-6">
            <Bullet>بطاقة موظف شاملة (هوية/إقامة، جنسية، جنس، تاريخ ميلاد).</Bullet>
            <Bullet>بيانات وظيفية: الإدارة، المسمى، الدرجة، المستوى الوظيفي، نوع العقد.</Bullet>
            <Bullet>بدلات الرواتب (سكن/نقل/أخرى) والراتب الأساسي ورصيد الإجازات.</Bullet>
            <Bullet>امتثالية: انتهاء الإقامة/الجواز/التأمين الطبي مع تنبيهات.</Bullet>
            <Bullet>الربط بالهيكل التنظيمي والمدير المباشر وحساب المستخدم.</Bullet>
            <Bullet>حالات (نشط/في إجازة/منهية) مع سبب وآخر يوم عمل.</Bullet>
            <Bullet>دعم ثنائي اللغة في كل الحقول والشارات والمسميات.</Bullet>
            <Bullet>بحث وتصفية حسب الحالة والإدارة والمستوى الوظيفي.</Bullet>
          </ul>
        </A4Page>

        {/* PAGE 6 — ATTENDANCE */}
        <A4Page ref={setRef(5)} pageNo={6} total={TOTAL}>
          <Pill>الحضور والانصراف</Pill>
          <H icon={CalendarCheck}>الحضور وانصراف الموظفين</H>
          <Lead>ثلاث طرق لتسجيل الحضور بما يناسب طبيعة عمل المنشأة، مع حساب ساعات العمل وحالات اليوم آلياً وفق إعدادات المنشأة.</Lead>
          <Grid3>
            <Card icon={Fingerprint} title="بصمة مباشرة" desc="تسجيل من بوابة الموظف ضمن نطاق جغرافي محدد وبدون أجهزة." tint={NAVY} />
            <Card icon={ScanLine} title="استيراد بصمات" desc="رفع ملف بصمات خارجي (CSV/Excel) وربطه بالمستخدمين." tint={PURPLE} />
            <Card icon={Cog} title="تسجيل يدوي" desc="إضافة أو تصحيح سجلات الحضور من إدارة الموارد البشرية." tint={NAVY} />
          </Grid3>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl p-4" style={{ background: "#f5f3ff" }}>
              <div className="text-[12px] font-bold text-violet-700 mb-1">إعدادات ساعات العمل</div>
              <p className="text-[11px] text-slate-600 leading-6">تحديد ساعات وأيام العمل الأسبوعية، سماح التأخير بالدقائق، وطريقة خصم الغياب (أجر يومي / شهري مقسّم).</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "#eef2ff" }}>
              <div className="text-[12px] font-bold" style={{ color: NAVY }}>تحديد موقع المقر</div>
              <p className="text-[11px] text-slate-600 leading-6">إحداثيات مقر العمل ونطاق البصمة بالمتر لضبط صلاحية تسجيل الحضور الجغرافي.</p>
            </div>
          </div>
        </A4Page>

        {/* PAGE 7 — APPROVALS */}
        <A4Page ref={setRef(6)} pageNo={7} total={TOTAL}>
          <Pill>سير الموافقات</Pill>
          <H icon={ClipboardCheck}>مسار الموافقات متعدد المراحل</H>
          <Lead>مسار واحد موحّد للإجازات والسلف ورحلات العمل عبر ثلاث جهات: المدير المباشر، الموارد البشرية، ثم الصرف المالي — مع رؤية كاملة لكل مرحلة.</Lead>
          <div className="flex items-center justify-between gap-2 mb-5">
            {[
              { t: "طلب من الموظف", Icon: UserCog },
              { t: "المدير المباشر", Icon: ShieldCheck },
              { t: "الموارد البشرية", Icon: ClipboardCheck },
              { t: "الصرف المالي", Icon: Coins },
            ].map(({ t, Icon }, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="rounded-2xl border px-3 py-2.5 text-center w-[140px]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white mx-auto mb-1.5" style={{ background: i === 0 ? PURPLE : NAVY }}>
                    <Icon size={16} />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700">{t}</div>
                </div>
                {i < 3 && <ArrowLeftRight size={14} className="text-slate-300" />}
              </div>
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-x-6">
            <Bullet>أنواع الإجازة: سنوية / مرضية / طارئة / بدون راتب / وضع.</Bullet>
            <Bullet>السلف مع عدد الأقساط والقسط الشهري الآلي على الرواتب.</Bullet>
            <Bullet>ربط خصم الإجازة برصيد الموظف وعرض الأيام المخصومة.</Bullet>
            <Bullet>إثبات صرف مالي وتاريخ تحويل لكل طلب معتمد.</Bullet>
          </ul>
        </A4Page>

        {/* PAGE 8 — PAYROLL + EOS */}
        <A4Page ref={setRef(7)} pageNo={8} total={TOTAL}>
          <Pill>الرواتب والمستحقات</Pill>
          <H icon={Coins}>الرواتب والتأمينات ونهاية الخدمة</H>
          <Lead>حساب رواتب شهري كامل (Batch) مع التأمينات الاجتماعية للموظف السعودي والمقيم، واعتماد الرواتب دفعة واحدة، وحساب مكافأة نهاية الخدمة وفق نظام العمل السعودي.</Lead>
          <Grid3>
            <Card icon={Coins} title="راتب شهري كامل" desc="أساسي وبدلات وحوافز، خصومات وسلف، أيام غياب وساعات إضافية، ثم الصافي." tint={NAVY} />
            <Card icon={ShieldCheck} title="تأمينات GOSI" desc="نسب قابلة للضبط: سعودي (موظف/صاحب عمل) ومقيم (صاحب عمل ٢٪)." tint={PURPLE} />
            <Card icon={ReceiptText} title="نهاية الخدمة" desc="حساب الآلي وفق سنوات الخدمة وسبب الإنهاء ونسبة الاستحقاق." tint={NAVY} />
          </Grid3>
          <div className="mt-5 rounded-2xl border border-slate-200 p-4">
            <div className="text-[12px] font-bold text-slate-800 mb-2">خصائص الراتب</div>
            <ul className="grid grid-cols-2 gap-x-6">
              <Bullet>اعتماد البيرول دفعة واحدة (Batch Approval).</Bullet>
              <Bullet>طباعة مخالصة بشعار المنشأة بدلاً من شعار النظام.</Bullet>
              <Bullet>ربط السلف والأقساط والخصم الآلي بالرواتب.</Bullet>
              <Bullet>تعويض رصيد الإجازات وتذكرة العودة ضمن نهاية الخدمة.</Bullet>
            </ul>
          </div>
        </A4Page>

        {/* PAGE 9 — PERF / SUCCESSION / ORG / WORKFORCE */}
        <A4Page ref={setRef(8)} pageNo={9} total={TOTAL}>
          <Pill>تطوير الكفاءات</Pill>
          <H icon={TrendingUp}>الأداء والإحلال والهيكل التنظيمي</H>
          <Lead>إدارة منظومة الكفاءات من تقييم الأداء إلى جاهزية الإحلال، وعرض الهيكل التنظيمي بصرياً والتخطيط الاستراتيجي للقوى العاملة.</Lead>
          <Grid3>
            <Card icon={Target} title="تقييم الأداء" desc="مراجعات سنوية/نصف سنوية، أهداف وكفاءات وقيم، توصيات ترقية/مكافأة/إنذار." tint={NAVY} />
            <Card icon={Award} title="الإحلال الوظيفي" desc="مرشح بديل، مستوى الجاهزية، خطة تطوير، خطر وأثر المغادرة." tint={PURPLE} />
            <Card icon={Network} title="الهيكل التنظيمي" desc="عرض هرمي بصري تلقائي من بيانات الموظفين والمستوى الوظيفي." tint={NAVY} />
          </Grid3>
          <div className="mt-5 rounded-2xl p-4" style={{ background: "#f5f3ff" }}>
            <div className="text-[12px] font-bold text-violet-700 mb-1">التخطيط الوظيفي (Workforce Planning)</div>
            <p className="text-[11.5px] leading-6 text-slate-600">خطط سنوية متعددة الأفق: العدد الحالي والمستهدف، احتياجات التعين والتدريب، ميزانية القوى العاملة والمبادرات ومؤشرات الأداء ومالك الخطة.</p>
          </div>
        </A4Page>

        {/* PAGE 10 — EXIT / SURVEYS / WARNINGS */}
        <A4Page ref={setRef(9)} pageNo={10} total={TOTAL}>
          <Pill>السياسة العمالية والثقافة</Pill>
          <H icon={FileText}>المغادرة والاستبيانات والإنذارات</H>
          <Lead>ثلاث وحدات متكاملة لإدارة الرحلة من المغادرة، قياس الانطباع، وضبط الانضباط وفق نظام العمل السعودي.</Lead>
          <Grid3>
            <Card icon={FileText} title="مقابلات المغادرة" desc="نوع المغادرة، السبب الرئيسي، رضا وملاحظات بنّاءة، التوصية بالعودة." tint={NAVY} />
            <Card icon={PieChart} title="استبيانات الموظفين" desc="انخراط/تأهيل/نبض، أسئلة بنية JSON، ردود مجهولة، متوسط وتوجه عام." tint={PURPLE} />
            <Card icon={AlertTriangle} title="الإنذارات التأديبية" desc="أوتوماتيكية عند إثبات المخالفة، ثلاث درجات + إنهاء، وفق المراجع النظامي." tint={NAVY} />
          </Grid3>
          <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: NAVY + "22" }}>
            <div className="text-[12px] font-bold text-slate-800 mb-1.5">أتمتة الإنذارات</div>
            <p className="text-[11.5px] leading-6 text-slate-600">يمتلك النظام سياسة عمالية محمّلة تصدر الإنذار آلياً عند إثبات المخالفة ويظهر للموظف في بوابته دون الحاجة لموافقة يدوية، مع توثيق جلسة التحقيق والمرجع النظامي.</p>
          </div>
        </A4Page>

        {/* PAGE 11 — ANALYTICS */}
        <A4Page ref={setRef(10)} pageNo={11} total={TOTAL}>
          <Pill>التحليلات الاستراتيجية</Pill>
          <H icon={BarChart3}>لوحة التحليلات</H>
          <Lead>مؤشرات موارد بشرية استراتيجية قابلة للتصفية الزمنية (ربع/نصف سنوي/سنوي) لاتخاذ قرارات قائمة على البيانات.</Lead>
          <Grid3>
            <Stat value="نسبة السعودة" label="توزيع الجنسيات والتوظيف" />
            <Stat value="معدل الدوران" label="Turnover حسب الفترة" />
            <Stat value="معدل الاستبقاء" label="Retention حسب الإدارات" />
          </Grid3>
          <div className="mt-4 grid grid-cols-2 gap-x-6">
            <Bullet>توزيع الحالات الوظيفية وأداء الإدارات ومعدلات الحضور.</Bullet>
            <Bullet>توزيع الرواتب ومدة الخدمة والفئات العمرية.</Bullet>
            <Bullet>توصيات لتقليل الدوران مبنية على أسباب المغادرة.</Bullet>
            <Bullet>رؤية الإدارات عالية المخاطر للتركيز عليها.</Bullet>
          </div>
        </A4Page>

        {/* PAGE 12 — LICENSES / FLEET / OWNER */}
        <A4Page ref={setRef(11)} pageNo={12} total={TOTAL}>
          <Pill>الامتثال والتشغيل</Pill>
          <H icon={Stamp}>التراخيص والأسطول ولوحة المالك</H>
          <Lead>ثلاث وحدات لإدارة الجهات الحكومية والمركبات ولوحة تحكم شاملة لمالك المنصة عبر جميع المنشآت.</Lead>
          <Grid3>
            <Card icon={Stamp} title="التراخيص الحكومية" desc="سجل، بلدية، دفاع مدني، صناعي، مدن، هيئة الغذاء... مع خيار «لا ينطبق»." tint={NAVY} />
            <Card icon={Car} title="إدارة الأسطول" desc="مركبات ببيانات ثنائية اللغة، تامين وفحص ورخصة ومسؤول مع تنبيهات." tint={PURPLE} />
            <Card icon={Crown} title="لوحة المالك" desc="متابعة كل المنشآت والاشتراكات والتجربة المجانية دفعة واحدة." tint={NAVY} />
          </Grid3>
          <div className="mt-5 rounded-2xl p-4" style={{ background: "#eef2ff" }}>
            <div className="text-[12px] font-bold mb-1" style={{ color: NAVY }}>تنبيهات الانتهاء</div>
            <p className="text-[11.5px] leading-6 text-slate-600">تتبّع آلي لانتهاء التراخيص وتأمينات المركبات والفحص الدوري على مستوى المنشأة، مع إمكانية إرفاق نسخة من كل وثيقة.</p>
          </div>
        </A4Page>

        {/* PAGE 13 — SELF SERVICE PORTAL */}
        <A4Page ref={setRef(12)} pageNo={13} total={TOTAL}>
          <Pill>بوابة الموظف الذاتية</Pill>
          <H icon={UserCog}>تجربة الموظف</H>
          <Lead>بوابة مستقلة تمنح الموظف تجربة بسيطة وآمنة للتعامل مع احتياجاته الإدارية اليومية دون تدخل الإدارة.</Lead>
          <Grid3>
            <Card icon={Clock} title="طلبات الإجازات" desc="إنشاء ومتابعة حالة الطلب عبر مسار الموافقات." tint={NAVY} />
            <Card icon={Wallet} title="طلب السلف" desc="سلفة بعدد أقساط وقسط آلي على الراتب." tint={PURPLE} />
            <Card icon={Plane} title="رحلات العمل" desc="طلب رحلة داخلية/خارجية بالتكاليف والتكاليف." tint={NAVY} />
          </Grid3>
          <div className="mt-4 grid grid-cols-2 gap-x-6">
            <Bullet>تسجيل الحضور والانصراف بالنطاق الجغرافي.</Bullet>
            <Bullet>عرض بطاقة الموظف وبيانات التوظيف والراتب.</Bullet>
            <Bullet>استعراض تاريخ الحضور والطلبات والمخالصات.</Bullet>
            <Bullet>استلام واطلاع الإنذارات التأديبية آلياً.</Bullet>
          </div>
        </A4Page>

        {/* PAGE 14 — PRICING */}
        <A4Page ref={setRef(13)} pageNo={14} total={TOTAL}>
          <Pill>الاشتراكات والتحصيل</Pill>
          <H icon={CreditCard}>نموذج التسعير والتجربة المجانية</H>
          <Lead>نموذج اشتراك سنوي شفاف، مع تجربة مجانية لمدة ٣٠ يوماً وتحميل إشعار فوري للمالك عند تسجيل أي منشأة جديدة.</Lead>
          <Grid3>
            <div className="rounded-2xl p-5 text-center" style={{ background: "#f5f3ff" }}>
              <div className="text-[11px] text-slate-500 mb-1">السنة الأولى</div>
              <div className="text-3xl font-bold" style={{ color: NAVY }}>٢٬٥٠٠ ر.س</div>
              <div className="text-[11px] text-slate-500 mt-2">ترخيص سنوي + دفع مضمّن</div>
            </div>
            <div className="rounded-2xl p-5 text-center border" style={{ borderColor: PURPLE }}>
              <div className="text-[11px] text-slate-500 mb-1">من السنة الثانية</div>
              <div className="text-3xl font-bold" style={{ color: PURPLE }}>٧٠٠ ر.س</div>
              <div className="text-[11px] text-slate-500 mt-2">تجديد سنوي</div>
            </div>
            <div className="rounded-2xl p-5 text-center" style={{ background: "#eef2ff" }}>
              <div className="text-[11px] text-slate-500 mb-1">تجربة مجانية</div>
              <div className="text-3xl font-bold" style={{ color: NAVY }}>٣٠ يوم</div>
              <div className="text-[11px] text-slate-500 mt-2">بدون بطاقة ائتمان</div>
            </div>
          </Grid3>
          <div className="mt-5 rounded-2xl p-5 text-white" style={{ background: NAVY }}>
            <div className="text-[13px] font-bold mb-2">طرق الدفع المضمّنة (Stripe) داخل الموقع</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-[12px] font-bold">mada</span>
              <span className="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-[12px] font-bold italic">VISA</span>
              <span className="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-[12px] font-bold"> Apple Pay</span>
              <span className="text-white/60 text-[11px]">— بدون تحويل خارجي · دفع آمن مدمج</span>
            </div>
          </div>
        </A4Page>

        {/* PAGE 15 — TECH + CONTACT */}
        <A4Page ref={setRef(14)} pageNo={15} total={TOTAL}>
          <Pill>التقنية والتواصل</Pill>
          <H icon={Link2}>التقنية، الأمان، وطرق التواصل</H>
          <Lead>منصة سحابية حديثة مع دعم كامل للغتين العربية والإنجليزية في كل الشاشات والنماذج والرسائل، وأمان على مستوى المنشأة والصلاحيات.</Lead>
          <Grid3>
            <Card icon={Cloud} title="سحابي ومستضاف" desc="بنية سحابية موثوقة دون أي خوادم محلية." tint={NAVY} />
            <Card icon={Languages} title="ثنائية اللغة الكاملة" desc="تبديل عربي/إنجليزي في كل الشاشات مع RTL/LTR." tint={PURPLE} />
            <Card icon={ShieldCheck} title="أمان وخصوصية" desc="صلاحيات لكل وحدة وفصل بيانات بين المنشآت بصريمة." tint={NAVY} />
          </Grid3>
          <div className="mt-6 rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg,#16243b,#3a2a66)" }}>
            <div className="text-[14px] font-bold mb-3">تواصل معنا</div>
            <div className="grid grid-cols-2 gap-y-3 text-[12.5px]">
              <div className="flex items-center gap-2.5"><Globe size={16} /> <span dir="ltr">jadara-hr.sa</span></div>
              <div className="flex items-center gap-2.5"><Mail size={16} /> <span dir="ltr">info@jadara-hr.sa</span></div>
              <div className="flex items-center gap-2.5"><Mail size={16} /> <span dir="ltr">sales@jadara-hr.sa</span></div>
              <div className="flex items-center gap-2.5"><Mail size={16} /> <span dir="ltr">support@jadara-hr.sa</span></div>
            </div>
          </div>
          <div className="mt-4 text-center text-[11px] text-slate-400">جدارة © ٢٠٢٧ — منصة الموارد البشرية السحابية · jadara-hr.sa</div>
        </A4Page>
      </div>
    </div>
  );
}