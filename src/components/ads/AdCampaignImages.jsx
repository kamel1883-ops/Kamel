import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Image as ImageIcon, RefreshCw, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";

const CAMPAIGN_ASSETS = [
  {
    id: "sa-man",
    type: "image",
    url: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/9a2eddbbf_generated_image.png",
    prompt: "Professional commercial photograph of a confident young Saudi businessman, around 25 years old, wearing a crisp clean white Saudi thobe (traditional robe) without any jacket or blazer, standing with arms crossed in a bright modern Saudi corporate office with floor-to-ceiling windows showing Riyadh skyline in the background, warm natural morning lighting, premium luxury aesthetic, clean minimal contemporary interior with subtle navy and gold accents, high-end editorial commercial photography style, shallow depth of field, no text, no logos, no watermarks",
    label_ar: "شاب سعودي بمكتب حديث",
    label_en: "Saudi young man in modern office",
  },
  {
    id: "sa-woman",
    type: "image",
    url: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/9d1ca3fa3_generated_image.png",
    prompt: "Professional commercial photograph of a young Saudi businesswoman, around 25 years old, wearing an elegant modest navy abaya and cream hijab, sitting at a sleek modern desk in a bright contemporary Saudi office, smiling while using a silver laptop, warm natural lighting from large windows, premium luxury aesthetic, clean minimal interior with subtle gold accents, high-end editorial commercial photography style, shallow depth of field, no text, no logos, no watermarks",
    label_ar: "شابة سعودية بمكتب حديث",
    label_en: "Saudi young woman in modern office",
  },
  {
    id: "sa-team",
    type: "image",
    url: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/4366de3e9_generated_image.png",
    prompt: "Professional commercial photograph of a diverse collaborative team of young Saudi professionals in their mid-20s, men in clean white Saudi thobes and women in elegant neutral-toned abayas with hijabs, standing and discussing around a modern glass conference table in a bright contemporary Saudi office meeting room with large windows showing a city skyline, warm golden afternoon lighting, premium luxury corporate aesthetic, clean minimal interior, high-end editorial commercial photography style, shallow depth of field, no text, no logos, no watermarks",
    label_ar: "فريق سعودي متنوع",
    label_en: "Diverse Saudi team",
  },
  {
    id: "sa-video",
    type: "video",
    url: "https://media.base44.com/videos/public/6a74edc8f347046365c2e1a4/621fce1de_Saudi_office_promo.mp4",
    prompt: "Cinematic wide establishing shot of a bright modern Saudi corporate office in Riyadh, slow smooth camera dolly forward through a contemporary open-plan workspace, young Saudi professionals in their mid-20s in traditional Saudi attire (men in white thobes, women in elegant abayas and hijabs) working collaboratively at sleek desks and standing discussions, warm golden morning lighting streaming through floor-to-ceiling windows with a soft city skyline view, premium luxury corporate atmosphere, clean minimal interior with subtle navy and gold accents, professional high-end commercial film style, no text overlays, no logos, no on-screen graphics",
    label_ar: "فيديو ترويجي — مكتب سعودي",
    label_en: "Promo video — Saudi office",
  },
];

export default function AdCampaignImages() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [assets, setAssets] = useState(CAMPAIGN_ASSETS);
  const [regenerating, setRegenerating] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const t = isAr
    ? {
        title: "صور وفيديوهات جاهزة للحملات الإعلانية",
        subtitle: "صور سعودية احترافية نظيفة — حمّلها وارفعها يدوياً في حملة جوجل أدس عبر زر «+ Add» بدل الصور المولّدة تلقائياً",
        note: "نصيحة: هذه الصور بدون نص حتى لا يشوّهها الذكاء الاصطناعي — استخدم بوسترات القسم العلوي إذا أردت الصورة بشعار ورقم جدارة عليها.",
        download: "تحميل",
        open: "فتح",
        regen: "إعادة توليد",
        regening: "جارٍ التوليد...",
        regenFail: "تعذّر إعادة التوليد، حاول مرة أخرى.",
        videoTitle: "فيديو يوتيوب ترويجي",
        regenVideoNote: "إعادة توليد الفيديو تستغرق 30–60 ثانية وتكلف 30 رصيد",
      }
    : {
        title: "Ready-to-use ad campaign images & video",
        subtitle: "Clean professional Saudi images — download and upload them manually to your Google Ads campaign via «+ Add» instead of auto-generated images",
        note: "Tip: these images have no text to avoid AI distortion — use the posters above if you want the image with the Jadara logo and phone number.",
        download: "Download",
        open: "Open",
        regen: "Regenerate",
        regening: "Generating...",
        regenFail: "Could not regenerate, please try again.",
        videoTitle: "YouTube promo video",
        regenVideoNote: "Regenerating the video takes 30–60 seconds and costs 30 credits",
      };

  const handleRegenerate = async (asset) => {
    setRegenerating(asset.id);
    try {
      let res;
      if (asset.type === "image") {
        res = await base44.integrations.Core.GenerateImage({ prompt: asset.prompt });
      } else {
        res = await base44.integrations.Core.GenerateVideo({
          prompt: asset.prompt,
          duration: 6,
          aspect_ratio: "16:9",
          generate_audio: false,
        });
      }
      if (res?.url) {
        setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, url: res.url } : a)));
      } else {
        alert(t.regenFail);
      }
    } catch (e) {
      console.error(e);
      alert(t.regenFail);
    } finally {
      setRegenerating(null);
    }
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

  const images = assets.filter((a) => a.type === "image");
  const video = assets.find((a) => a.type === "video");

  return (
    <div className="mt-8 bg-white rounded-2xl border border-border p-5">
      <div className="mb-1">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ImageIcon size={18} className="text-violet-600" /> {t.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {images.map((img) => (
          <div key={img.id} className="rounded-xl border border-border overflow-hidden bg-slate-50">
            <div className="aspect-square overflow-hidden bg-slate-100 relative">
              <img src={img.url} alt={isAr ? img.label_ar : img.label_en} className={`w-full h-full object-cover transition ${regenerating === img.id ? "opacity-40" : ""}`} loading="lazy" />
              {regenerating === img.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 size={22} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="p-2.5">
              <div className="text-xs font-medium mb-2">{isAr ? img.label_ar : img.label_en}</div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 flex-1" onClick={() => handleDownload(img.url, img.id)} disabled={downloading === img.id}>
                  <Download size={13} /> {downloading === img.id ? "..." : t.download}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 flex-1" onClick={() => handleRegenerate(img)} disabled={regenerating === img.id}>
                  {regenerating === img.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} {regenerating === img.id ? t.regening : t.regen}
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
        <div className="aspect-video overflow-hidden bg-black relative">
          <video key={video.url} src={video.url} controls className={`w-full h-full object-contain transition ${regenerating === video.id ? "opacity-40" : ""}`} preload="metadata" />
          {regenerating === video.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 size={26} className="animate-spin" />
                <span className="text-xs">{t.regening}</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-2.5 flex items-center justify-between gap-2">
          <div className="text-xs font-medium">{isAr ? video.label_ar : video.label_en}</div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleDownload(video.url, "video")} disabled={downloading === "video"}>
              <Download size={13} /> {downloading === "video" ? "..." : t.download}
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleRegenerate(video)} disabled={regenerating === video.id}>
              {regenerating === video.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} {regenerating === video.id ? t.regening : t.regen}
            </Button>
          </div>
        </div>
        <div className="px-2.5 pb-2.5 text-[10px] text-muted-foreground">{t.regenVideoNote}</div>
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-2.5">
        {t.note}
      </div>
    </div>
  );
}