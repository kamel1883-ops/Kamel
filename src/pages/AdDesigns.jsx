import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Printer, Image as ImageIcon } from "lucide-react";
import JadaraPoster1 from "@/components/ads/JadaraPoster1";

const POSTERS = [
  { id: "main", title: "البوستر الرئيسي للمنصة", subtitle: "متعدد المزايا — جاهز للطباعة", Comp: JadaraPoster1, ratio: "1 / 1.414", tags: ["عام", "A4 عمودي"] },
];

export default function AdDesigns() {
  const [active, setActive] = useState(POSTERS[0]);

  return (
    <div dir="rtl">
      <PageHeader
        title="تصميمات الإعلانات"
        subtitle="بوسترات دعائية جاهزة للمنصة — جاري إضافة المزيد"
        action={
          <Button onClick={() => window.print()} className="gap-2">
            <Printer size={18} /> طباعة البوستر الحالي
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* معرض المصغّرات */}
        <div className="lg:col-span-4 space-y-3">
          {POSTERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className={`w-full text-right rounded-2xl border p-2 transition ${active.id === p.id ? "border-violet-600 ring-2 ring-violet-200" : "border-border hover:border-violet-300"}`}
            >
              <div className="overflow-hidden rounded-xl bg-slate-50" style={{ aspectRatio: p.ratio }}>
                <div className="origin-top-left scale-[.36] w-[278%] h-[278%] pointer-events-none">
                  <p.Comp />
                </div>
              </div>
              <div className="px-1 pt-2">
                <div className="text-sm font-medium flex items-center gap-1.5"><ImageIcon size={14} /> {p.title}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.tags.map((tg) => <span key={tg} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{tg}</span>)}
                </div>
              </div>
            </button>
          ))}
          <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            تصاميم إضافية قريباً…
          </div>
        </div>

        {/* المعاينة الكبيرة */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">{active.title}</div>
                <div className="text-xs text-muted-foreground">{active.subtitle}</div>
              </div>
            </div>
            <div className="mx-auto" style={{ maxWidth: 520 }}>
              <div style={{ aspectRatio: active.ratio }} className="rounded-xl overflow-hidden shadow-lg">
                <active.Comp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}