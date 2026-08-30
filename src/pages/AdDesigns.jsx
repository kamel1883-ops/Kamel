import React, { useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon } from "lucide-react";
import EnvPoster from "@/components/ads/EnvPoster";
import BusinessCardSection from "@/components/ads/BusinessCardSection";
import { useI18n } from "@/lib/i18n";

const IMG_TEAM = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/5170278ee_generated_image.png";
const IMG_WOMAN = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/9bdf26cee_generated_image.png";
const IMG_HR = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/e295e9e35_generated_image.png";
const IMG_RECRUIT = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/a1821ac4f_generated_image.png";

export default function AdDesigns() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const POSTERS = isAr ? [
    {
      id: "team", title: "روح الفريق في جدارة", subtitle: "مستوحى من بيئة العمل السعودية",
      tags: ["فِرق", "A4 عمودي"],
      props: {
        image: IMG_TEAM, eyebrow: "روح الفريق",
        title: "معاً نرتقي بإدارة", titleAccent: "الموارد البشرية",
        body: "منصة متكاملة تجمع فريقك والحضور والرواتب والتأمينات في مكان واحد — بُنيت لبيئة العمل السعودية الحديثة.",
        points: ["إدارة الفِرق", "الحضور والبصمة", "الرواتب ومدد", "بوابة الموظف"],
      },
    },
    {
      id: "self", title: "بوابة الموظف الذاتية", subtitle: "تجربة الموظف الرقمية",
      tags: ["بوابة الموظف", "A4 عمودي"],
      props: {
        image: IMG_WOMAN, eyebrow: "بوابة الموظف الذاتية",
        title: "كل موظف يستحق", titleAccent: "تجربة راقية",
        body: "تقدّم بوابة الموظف الذاتية في جدارة الإجازات والسلف وكشوف الرواتب والقرارات والحوافز بضغطة زر، وبسبع لغات.",
        points: ["طلبات الإجازة والسلف", "كشف الراتب الإلكتروني", "القرارات والحوافز", "سبع لغات"],
      },
    },
    {
      id: "payroll", title: "الرواتب والتأمينات", subtitle: "دقة احترافية",
      tags: ["رواتب", "A4 عمودي"],
      props: {
        image: IMG_HR, eyebrow: "رواتب وتأمينات بدقة",
        title: "رواتبك وحساباتك", titleAccent: "بلا أخطاء",
        body: "احتساب الرواتب والتأمينات الاجتماعية والإجازات والحوافز والترقيات ونهاية الخدمة تلقائياً، مع تقارير احترافية جاهزة للاعتماد.",
        points: ["احتساب الرواتب مباشرة من البصمة", "نهاية الخدمة", "التأمينات الاجتماعية", "تقارير قابلة للاعتماد"],
        accent: "#8B5CF6",
      },
    },
    {
      id: "recruit", title: "التوظيف والتعيين", subtitle: "رحلة التوظيف الكاملة",
      tags: ["توظيف", "A4 عمودي"],
      props: {
        image: IMG_RECRUIT, eyebrow: "توظيف وتعيين",
        title: "استقطب أفضل", titleAccent: "الكفاءات",
        body: "نظام توظيف متكامل من إعلان الوظيفة إلى فرز الطلبات والمقابلات وقرار التعيين ومستند التكليف — في منصة واحدة.",
        points: ["إعلان الوظائف", "فرز الطلبات", "المقابلات", "قرار التعيين"],
        accent: "#8B5CF6",
      },
    },
  ] : [
    {
      id: "team", title: "Team spirit at Jadara", subtitle: "Inspired by the Saudi workplace",
      tags: ["Teams", "A4 portrait"],
      props: {
        image: IMG_TEAM, eyebrow: "Team spirit",
        title: "Elevating HR", titleAccent: "together",
        body: "An all-in-one platform that brings your team, attendance, payroll and insurance together — built for the modern Saudi workplace.",
        points: ["Team management", "Attendance & clock-in", "Payroll & Mudad", "Employee portal"],
      },
    },
    {
      id: "self", title: "Self-service employee portal", subtitle: "The digital employee experience",
      tags: ["Employee portal", "A4 portrait"],
      props: {
        image: IMG_WOMAN, eyebrow: "Self-service portal",
        title: "Every employee deserves", titleAccent: "a premium experience",
        body: "Jadara's self-service portal handles leaves, loans, payslips, decisions and incentives in a tap — in seven languages.",
        points: ["Leave & loan requests", "Digital payslip", "Decisions & incentives", "Seven languages"],
      },
    },
    {
      id: "payroll", title: "Payroll & insurance", subtitle: "Professional accuracy",
      tags: ["Payroll", "A4 portrait"],
      props: {
        image: IMG_HR, eyebrow: "Accurate payroll & insurance",
        title: "Payroll & calculations", titleAccent: "error-free",
        body: "Automatic computation of payroll, social insurance, leaves, incentives, promotions and end-of-service, with professional review-ready reports.",
        points: ["Attendance-driven payroll", "End of service", "Social insurance", "Approval-ready reports"],
        accent: "#8B5CF6",
      },
    },
    {
      id: "recruit", title: "Recruitment & hiring", subtitle: "The full hiring journey",
      tags: ["Recruitment", "A4 portrait"],
      props: {
        image: IMG_RECRUIT, eyebrow: "Recruitment & hiring",
        title: "Attract the best", titleAccent: "talent",
        body: "An end-to-end hiring system — from job posting to application screening, interviews, the hire decision and the assignment letter — in one platform.",
        points: ["Job postings", "Application screening", "Interviews", "Hire decision"],
        accent: "#8B5CF6",
      },
    },
  ];

  const t = isAr ? {
    title: "تصميمات الإعلانات",
    subtitle: "بوسترات دعائية مستوحاة من بيئة العمل السعودية — جاهزة للنشر على وسائل التواصل",
    dl: "تحميل كصورة", dling: "جارٍ التحضير...", fail: "تعذّر تحميل الصورة، حاول مرة أخرى.",
  } : {
    title: "Ad designs",
    subtitle: "Marketing posters inspired by the Saudi workplace — ready to publish on social media",
    dl: "Download image", dling: "Preparing...", fail: "Could not download the image, please try again.",
  };

  const [activeId, setActiveId] = useState(POSTERS[0].id);
  const active = POSTERS.find((p) => p.id === activeId) || POSTERS[0];
  const [downloading, setDownloading] = useState(false);
  const posterRef = useRef(null);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(posterRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `jadara-${active.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
      alert(t.fail);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        action={
          <Button onClick={handleDownload} disabled={downloading} className="gap-2">
            <Download size={18} /> {downloading ? t.dling : t.dl}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-3">
          {POSTERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`w-full text-right rounded-2xl border p-2 transition ${activeId === p.id ? "border-violet-600 ring-2 ring-violet-200" : "border-border hover:border-violet-300"}`}
            >
              <div className="overflow-hidden rounded-xl bg-slate-50" style={{ aspectRatio: "1 / 1.414" }}>
                <div className="origin-top-left scale-[.36] w-[278%] h-[278%] pointer-events-none">
                  <EnvPoster {...p.props} />
                </div>
              </div>
              <div className="px-1 pt-2">
                <div className="text-sm font-medium flex items-center gap-1.5"><ImageIcon size={14} /> {p.title}</div>
                <div className="text-[11px] text-muted-foreground">{p.subtitle}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.tags.map((tg) => <span key={tg} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{tg}</span>)}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">{active.title}</div>
                <div className="text-xs text-muted-foreground">{active.subtitle}</div>
              </div>
            </div>
            <div className="mx-auto" style={{ maxWidth: 560 }}>
              <div ref={posterRef} style={{ aspectRatio: "1 / 1.414" }} className="rounded-xl overflow-hidden shadow-lg">
                <EnvPoster {...active.props} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BusinessCardSection isAr={isAr} />
    </div>
  );
}