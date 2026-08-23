import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Printer, Image as ImageIcon } from "lucide-react";
import EnvPoster from "@/components/ads/EnvPoster";

const IMG_TEAM = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/5170278ee_generated_image.png";
const IMG_WOMAN = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/930b5de73_generated_image.png";
const IMG_HR = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/e295e9e35_generated_image.png";
const IMG_RECRUIT = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/a1821ac4f_generated_image.png";

const TeamPoster = () => (
  <EnvPoster
    image={IMG_TEAM}
    eyebrow="روح الفريق"
    title="معاً نرتقي بإدارة"
    titleAccent="الموارد البشرية"
    body="منصة متكاملة تجمع فريقك والحضور والرواتب والتأمينات في مكان واحد — بُنيت لبيئة العمل السعودية الحديثة."
    points={["إدارة الفِرق", "الحضور والبصمة", "الرواتب ومدد", "بوابة الموظف"]}
  />
);

const WomanPoster = () => (
  <EnvPoster
    image={IMG_WOMAN}
    eyebrow="بوابة الموظف الذاتية"
    title="كل موظف يستحق"
    titleAccent="تجربة راقية"
    body="تقدّم بوابة الموظف الذاتية في جدارة الإجازات والسلف وكشوف الرواتب والقرارات والحوافز بضغطة زر، وبسبع لغات."
    points={["طلبات الإجازة والسلف", "كشف الراتب الإلكتروني", "القرارات والحوافز", "سبع لغات"]}
  />
);

const HrPoster = () => (
  <EnvPoster
    image={IMG_HR}
    eyebrow="رواتب وتأمينات بدقة"
    title="رواتبك وحساباتك"
    titleAccent="بلا أخطاء"
    body="احتساب الرواتب والتأمينات الاجتماعية والإجازات والحوافز والترقيات ونهاية الخدمة تلقائياً، مع تقارير احترافية جاهزة للاعتماد."
    points={["احتساب الرواتب مباشرة من البصمة", "نهاية الخدمة", "التأمينات الاجتماعية", "تقارير قابلة للاعتماد"]}
    accent="#E9C766"
  />
);

const RecruitPoster = () => (
  <EnvPoster
    image={IMG_RECRUIT}
    eyebrow="توظيف وتعيين"
    title="استقطب أفضل"
    titleAccent="الكفاءات"
    body="نظام توظيف متكامل من إعلان الوظيفة إلى فرز الطلبات والمقابلات وقرار التعيين ومستند التكليف — في منصة واحدة."
    points={["إعلان الوظائف", "فرز الطلبات", "المقابلات", "قرار التعيين"]}
    accent="#E9C766"
  />
);

const POSTERS = [
  { id: "team", title: "روح الفريق في جدارة", subtitle: "مستوحى من بيئة العمل السعودية", Comp: TeamPoster, tags: ["فِرق", "A4 عمودي"] },
  { id: "self", title: "بوابة الموظف الذاتية", subtitle: "تجربة الموظف الرقمية", Comp: WomanPoster, tags: ["بوابة الموظف", "A4 عمودي"] },
  { id: "payroll", title: "الرواتب والتأمينات", subtitle: "دقة احترافية", Comp: HrPoster, tags: ["رواتب", "A4 عمودي"] },
  { id: "recruit", title: "التوظيف والتعيين", subtitle: "رحلة التوظيف الكاملة", Comp: RecruitPoster, tags: ["توظيف", "A4 عمودي"] },
];

export default function AdDesigns() {
  const [active, setActive] = useState(POSTERS[0]);

  return (
    <div dir="rtl">
      <PageHeader
        title="تصميمات الإعلانات"
        subtitle="بوسترات دعائية مستوحاة من بيئة العمل السعودية — جاهزة للطباعة والنشر"
        action={
          <Button onClick={() => window.print()} className="gap-2">
            <Printer size={18} /> طباعة البوستر الحالي
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-3">
          {POSTERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className={`w-full text-right rounded-2xl border p-2 transition ${active.id === p.id ? "border-violet-600 ring-2 ring-violet-200" : "border-border hover:border-violet-300"}`}
            >
              <div className="overflow-hidden rounded-xl bg-slate-50" style={{ aspectRatio: "1 / 1.414" }}>
                <div className="origin-top-left scale-[.36] w-[278%] h-[278%] pointer-events-none">
                  <p.Comp />
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
              <div style={{ aspectRatio: "1 / 1.414" }} className="rounded-xl overflow-hidden shadow-lg">
                <active.Comp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}