import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import BusinessCard from "@/components/ads/BusinessCard";

// قسم الكروت الشخصية: وجه عربي ووجه إنجليزي بشعار جدارة وبيانات التواصل
export default function BusinessCardSection({ isAr }) {
  const [data, setData] = useState({
    nameAr: "",
    nameEn: "",
    phone: "+966 55 000 0000",
    email: "info@jadara-hr.com",
    website: "www.jadara-hr.com",
    social: "@jadara_hr",
  });
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const t = isAr
    ? { h: "الكروت الشخصية", s: "وجه عربي ووجه إنجليزي — جاهزة للطباعة (90×50 ملم)", nameAr: "الاسم بالعربية", nameEn: "Name in English", phone: "الجوال", email: "البريد الإلكتروني", site: "الموقع الإلكتروني", social: "حساب التواصل", dl: "تحميل الكروت", dling: "جارٍ التحضير..." }
    : { h: "Business cards", s: "Arabic and English sides — print ready (90×50 mm)", nameAr: "الاسم بالعربية", nameEn: "Name in English", phone: "Mobile", email: "Email", site: "Website", social: "Social handle", dl: "Download cards", dling: "Preparing..." };

  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));

  const download = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const link = document.createElement("a");
      link.download = "jadara-business-card.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="font-semibold">{t.h}</div>
          <div className="text-xs text-muted-foreground">{t.s}</div>
        </div>
        <Button onClick={download} disabled={downloading} className="gap-2">
          <Download size={18} /> {downloading ? t.dling : t.dl}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {[["nameAr", t.nameAr], ["nameEn", t.nameEn], ["phone", t.phone], ["email", t.email], ["website", t.site], ["social", t.social]].map(([k, label]) => (
          <div key={k} className="space-y-1">
            <Label className="text-xs">{label}</Label>
            <Input value={data[k]} onChange={set(k)} />
          </div>
        ))}
      </div>

      <div ref={cardRef} className="bg-white p-3 rounded-xl">
        <BusinessCard {...data} />
      </div>
    </div>
  );
}