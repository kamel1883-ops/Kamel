import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// صور سعودية احترافية نظيفة (بدون نص/لوجو) جاهزة للرفع على حملات جوجل أدس
const CAMPAIGN_IMAGES = [
  {
    id: "sa-man",
    url: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/9a2eddbbf_generated_image.png",
    label_ar: "شاب سعودي بمكتب حديث",
    label_en: "Saudi young man in modern office",
  },
  {
    id: "sa-woman",
    url: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/9d1ca3fa3_generated_image.png",
    label_ar: "شابة سعودية بمكتب حديث",
    label_en: "Saudi young woman in modern office",
  },
  {
    id: "sa-team",
    url: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/4366de3e9_generated_image.png",
    label_ar: "فريق سعودي متنوع",
    label_en: "Diverse Saudi team",
  },
];

const CAMPAIGN_VIDEO = {
  url: "https://media.base44.com/videos/public/6a74edc8f347046365c2e1a4/621fce1de_Saudi_office_promo.mp4",
  label_ar: "فيديو ترويجي — مكتب سعودي",
  label_en: "Promo video — Saudi office",
};

export default function AdCampaignImages() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [downloading, setDownloading] = useState(null);

  const t = isAr
    ? {
        title: "صور وفيديوهات جاهزة للحملات الإعلانية",
        subtitle: "صور سعودية احترافية نظيفة — حمّلها وارفعها يدوياً في حملة جوجل أدس عبر زر «+ Add» بدل الصور المولّدة تلقائياً",
        note: "نصيحة: هذه الصور بدون نص حتى لا يشوّهها الذكاء الاصطناعي — استخدم بوسترات القسم العلوي إذا أردت الصورة بشعار ورقم جدارة عليها.",
        download: "تحميل",
        open: "فتح",
        videoTitle: "فيديو يوتيوب ترويجي",
      }
    : {
        title: "Ready-to-use ad campaign images & video",
        subtitle: "Clean professional Saudi images — download and upload them manually to your Google Ads campaign via «+ Add» instead of auto-generated images",
        note: "Tip: these images have no text to avoid AI distortion — use the posters above if you want the image with the Jadara logo and phone number.",
        download: "Download",
        open: "Open",
        videoTitle: "YouTube promo video",
      };

  const handleDownload = async (url, id) => {
    setDownloading(id);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `jadara-campaign-${id}.${url.includes(".mp4") ? "mp4" : "png"}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      window.open(url, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-2xl border border-border p-5">
      <div className="mb-1">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ImageIcon size={18} className="text-violet-600" /> {t.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {CAMPAIGN_IMAGES.map((img) => (
          <div key={img.id} className="rounded-xl border border-border overflow-hidden bg-slate-50">
            <div className="aspect-square overflow-hidden bg-slate-100">
              <img src={img.url} alt={isAr ? img.label_ar : img.label_en} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-2.5">
              <div className="text-xs font-medium mb-2">{isAr ? img.label_ar : img.label_en}</div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 flex-1" onClick={() => handleDownload(img.url, img.id)} disabled={downloading === img.id}>
                  <Download size={13} /> {downloading === img.id ? "..." : t.download}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(img.url, "_blank")} title={t.open}>
                  <ExternalLink size={13} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border overflow-hidden bg-slate-50">
        <div className="aspect-video overflow-hidden bg-black">
          <video src={CAMPAIGN_VIDEO.url} controls className="w-full h-full object-contain" preload="metadata" />
        </div>
        <div className="p-2.5 flex items-center justify-between gap-2">
          <div className="text-xs font-medium">{isAr ? CAMPAIGN_VIDEO.label_ar : CAMPAIGN_VIDEO.label_en}</div>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleDownload(CAMPAIGN_VIDEO.url, "video")} disabled={downloading === "video"}>
            <Download size={13} /> {downloading === "video" ? "..." : t.download}
          </Button>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-2.5">
        {t.note}
      </div>
    </div>
  );
}