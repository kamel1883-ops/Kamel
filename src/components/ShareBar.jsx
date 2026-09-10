import React, { useState } from "react";
import { Linkedin, Facebook, MessageCircle, Send, Link2, Check } from "lucide-react";
import { TiktokIcon, SnapchatIcon } from "@/components/SocialIcons";

// رابط موقع جداره الرسمي
const SITE_URL = "https://jadara-hr.com/";
// روابط الحسابات الرسمية لجداره على المنصات
const SOCIAL = {
  linkedin: "https://www.linkedin.com/company/%D8%AC%D8%AF%D8%A7%D8%B1%D8%A9-%D9%84%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%B1%D8%AF-%D8%A7%D9%84%D8%A8%D8%B4%D8%B1%D9%8A%D8%A9",
  x: "https://x.com/jadaraHRM",
  tiktok: "https://www.tiktok.com/@jadarahr?_r=1&_t=ZS-99aHcundyoi",
  facebook: "https://www.facebook.com/share/1CEdfx8jV7/?mibextid=wwXIfr",
  snapchat: "https://snapchat.com/t/9UWDJAhl",
};

// نبذة موحّدة قوية (توليد نص جاهز للمشاركة) — عربي / إنجليزي
const BLURB_AR =
  "هل تبحث عن نظام موارد بشرية متكامل؟ «جداره» تجمع لك في منصة واحدة فاخرة: إدارة الموظفين، الحضور والبصمة الذاتية، الإجازات والموافقات، رحلات العمل، الرواتب، التأمينات الاجتماعية، نهاية الخدمة، إدارة الأداء، التخطيط التعاقبي، الهيكل التنظيمي، تحليلات الموارد البشرية، إدارة الأسطول، والتراخيص الحكومية — وفق الأنظمة السعودية وبتصميم عصري متقدم. جرّب مجاناً لمدة 30 يوماً:\n" +
  SITE_URL;

const BLURB_EN =
  "Looking for an all-in-one HR platform? Jadara brings together employees, self check-in attendance, leaves & approvals, business trips, payroll, GOSI, end-of-service, performance, succession planning, org structure, HR analytics, fleet, and government licenses — in one premium Saudi-compliant platform with a modern 2027 design. Try it free for 30 days:\n" +
  SITE_URL;

// أيقونة منصة X (تويتر سابقاً) الجديدة
function XIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ألوان الهوية المستخدمة في قسم السيرفر (بنفسجي + سماوي)
const VIOLET = "#7C5CE6";

export default function ShareBar({ isAr = true }) {
  const [copied, setCopied] = useState(false);
  const blurb = isAr ? BLURB_AR : BLURB_EN;
  const text = encodeURIComponent(blurb);
  const url = encodeURIComponent(SITE_URL);

  const links = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/shareoffsite/?url=${url}`, icon: Linkedin },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${text}`, icon: XIcon },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, icon: Facebook },
    { label: "WhatsApp", href: `https://wa.me/?text=${text}`, icon: MessageCircle },
    { label: "Telegram", href: `https://t.me/share/url?url=${url}&text=${text}`, icon: Send },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${blurb}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_e) {}
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {links.map((l) => {
          const I = l.icon;
          return (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              aria-label={l.label}
              title={l.label}
              className="w-12 h-12 rounded-2xl bg-white border border-violet-200 shadow-sm flex items-center justify-center hover:bg-violet-50 hover:border-violet-400 hover:-translate-y-0.5 transition-all"
            >
              <I size={20} style={{ color: VIOLET }} />
            </a>
          );
        })}
        <button
          onClick={copy}
          aria-label={isAr ? "نسخ النبذة والرابط" : "Copy blurb & link"}
          title={isAr ? "نسخ النبذة والرابط" : "Copy blurb & link"}
          className="w-12 h-12 rounded-2xl bg-white border border-violet-200 shadow-sm flex items-center justify-center hover:bg-violet-50 hover:border-violet-400 hover:-translate-y-0.5 transition-all"
        >
          {copied ? <Check size={20} className="text-emerald-600" /> : <Link2 size={20} style={{ color: VIOLET }} />}
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 mt-1">
        <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn" className="w-9 h-9 rounded-xl bg-white border border-violet-200 shadow-sm flex items-center justify-center hover:bg-violet-50 hover:border-violet-400 transition-all"><Linkedin size={17} style={{ color: VIOLET }} /></a>
        <a href={SOCIAL.x} target="_blank" rel="noreferrer" aria-label="X" title="X" className="w-9 h-9 rounded-xl bg-white border border-violet-200 shadow-sm flex items-center justify-center hover:bg-violet-50 hover:border-violet-400 transition-all"><XIcon size={16} className="text-violet-600" /></a>
        <a href={SOCIAL.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" title="TikTok" className="w-9 h-9 rounded-xl bg-white border border-violet-200 shadow-sm flex items-center justify-center hover:bg-violet-50 hover:border-violet-400 transition-all"><TiktokIcon size={17} className="text-violet-600" /></a>
        <a href={SOCIAL.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook" className="w-9 h-9 rounded-xl bg-white border border-violet-200 shadow-sm flex items-center justify-center hover:bg-violet-50 hover:border-violet-400 transition-all"><Facebook size={17} style={{ color: VIOLET }} /></a>
        <a href={SOCIAL.snapchat} target="_blank" rel="noreferrer" aria-label="Snapchat" title="Snapchat" className="w-9 h-9 rounded-xl bg-white border border-violet-200 shadow-sm flex items-center justify-center hover:bg-violet-50 hover:border-violet-400 transition-all"><SnapchatIcon size={17} className="text-violet-600" /></a>
      </div>
      <p className="text-xs text-muted-foreground max-w-xl text-center leading-relaxed">
        {isAr ? "تابع حساباتنا الرسمية على كل المنصات" : "Follow our official accounts on every platform"}
      </p>
    </div>
  );
}