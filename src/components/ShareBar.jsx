import React, { useState } from "react";
import { Linkedin, Facebook, MessageCircle, Send, Link2, Check } from "lucide-react";

// رابط موقع جدارة الرسمي
const SITE_URL = "https://jadara-hr.com/";
// روابط الحسابات الرسمية لجدارة على المنصات
const SOCIAL = {
  linkedin: "https://www.linkedin.com/company/%D8%AC%D8%AF%D8%A7%D8%B1%D8%A9-%D9%84%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%B1%D8%AF-%D8%A7%D9%84%D8%A8%D8%B4%D8%B1%D9%8A%D8%A9",
  x: "https://x.com/jadarahr",
};

// نبذة موحّدة قوية (توليد نص جاهز للمشاركة) — عربي / إنجليزي
const BLURB_AR =
  "هل تبحث عن نظام موارد بشرية متكامل؟ «جدارة» تجمع لك في منصة واحدة فاخرة: إدارة الموظفين، الحضور والبصمة الذاتية، الإجازات والموافقات، رحلات العمل، الرواتب، التأمينات الاجتماعية، نهاية الخدمة، إدارة الأداء، التخطيط التعاقبي، الهيكل التنظيمي، تحليلات الموارد البشرية، إدارة الأسطول، والتراخيص الحكومية — وفق الأنظمة السعودية وبتصميم عصري متقدم. جرّب مجاناً لمدة 30 يوماً:\n" +
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

export default function ShareBar({ isAr = true }) {
  const [copied, setCopied] = useState(false);
  const blurb = isAr ? BLURB_AR : BLURB_EN;
  const text = encodeURIComponent(blurb);
  const url = encodeURIComponent(SITE_URL);

  const links = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, icon: Linkedin, hover: "hover:bg-[#0a66c2]/25 hover:border-[#0a66c2]/40" },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${text}`, icon: XIcon, hover: "hover:bg-white/20" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, icon: Facebook, hover: "hover:bg-[#1877f2]/25 hover:border-[#1877f2]/40" },
    { label: "WhatsApp", href: `https://wa.me/?text=${text}`, icon: MessageCircle, hover: "hover:bg-emerald-500/25 hover:border-emerald-400/40" },
    { label: "Telegram", href: `https://t.me/share/url?url=${url}&text=${text}`, icon: Send, hover: "hover:bg-sky-500/25 hover:border-sky-400/40" },
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
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            aria-label={l.label}
            title={l.label}
            className={`w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center transition-colors ${l.hover}`}
          >
            <l.icon size={18} className="text-white/85" />
          </a>
        ))}
        <button
          onClick={copy}
          aria-label={isAr ? "نسخ النبذة والرابط" : "Copy blurb & link"}
          title={isAr ? "نسخ النبذة والرابط" : "Copy blurb & link"}
          className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-violet-500/25 hover:border-violet-400/40 transition-colors"
        >
          {copied ? <Check size={18} className="text-emerald-300" /> : <Link2 size={18} className="text-white/85" />}
        </button>
      </div>
      <p className="text-xs text-white/45 max-w-xl text-center leading-relaxed">
        {isAr ? "للمتابعة والمشاركة عبر حساباتنا الرسمية:" : "Follow & share via our official accounts:"}{" "}
        <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="text-white/70 hover:text-white underline underline-offset-2">LinkedIn</a>{" · "}
        <a href={SOCIAL.x} target="_blank" rel="noreferrer" className="text-white/70 hover:text-white underline underline-offset-2">X</a>
      </p>
    </div>
  );
}