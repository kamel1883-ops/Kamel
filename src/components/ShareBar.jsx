import React, { useState } from "react";
import { Linkedin, Facebook, Twitter, MessageCircle, Send, Link2, Check } from "lucide-react";

const SITE_URL = "https://jadara-hr.com/";
const TEXT_AR = "جدارة — منصة الموارد البشرية والرواتب والحضور والانصراف للمنشآت في السعودية والخليج";
const TEXT_EN = "Jadara — Saudi HR, Payroll & Attendance platform for companies in Saudi Arabia and the Gulf";

export default function ShareBar({ isAr = true }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(isAr ? TEXT_AR : TEXT_EN);
  const url = encodeURIComponent(SITE_URL);
  const links = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, icon: Linkedin, hover: "hover:bg-[#0a66c2]/25 hover:border-[#0a66c2]/40" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${url}`, icon: Facebook, hover: "hover:bg-[#1877f2]/25 hover:border-[#1877f2]/40" },
    { label: "X / Twitter", href: `https://twitter.com/intent/tweet?url=${url}&text=${text}`, icon: Twitter, hover: "hover:bg-white/20" },
    { label: "WhatsApp", href: `https://wa.me/?text=${text}%20${url}`, icon: MessageCircle, hover: "hover:bg-emerald-500/25 hover:border-emerald-400/40" },
    { label: "Telegram", href: `https://t.me/share/url?url=${url}&text=${text}`, icon: Send, hover: "hover:bg-sky-500/25 hover:border-sky-400/40" },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_e) {}
  };
  return (
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
        aria-label={isAr ? "نسخ الرابط" : "Copy link"}
        title={isAr ? "نسخ الرابط" : "Copy link"}
        className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-violet-500/25 hover:border-violet-400/40 transition-colors"
      >
        {copied ? <Check size={18} className="text-emerald-300" /> : <Link2 size={18} className="text-white/85" />}
      </button>
    </div>
  );
}