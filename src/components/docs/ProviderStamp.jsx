import React from "react";
import { PROVIDER } from "@/lib/providerIdentity";

// ختم موحّد للمؤسسة المُوفِّرة (مؤسسة احمد الشعالي لتقنية المعلومات) — يحمل اسم المؤسسة
// في القوس العلوي واسم منصة جدارة في الوسط والرقم الموحّد للمنشأة تحته.
export default function ProviderStamp({ size = 150, rotate = true }) {
  return (
    <div style={rotate ? { transform: "rotate(-7deg)", opacity: 0.85 } : { opacity: 0.85 }}>
      <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id="provStampTop" d="M 100,100 m -74,0 a 74,74 0 1,1 148,0" fill="none" />
        </defs>
        <circle cx="100" cy="100" r={92} fill="none" stroke="#1A237E" strokeWidth={3} />
        <circle cx="100" cy="100" r={84} fill="none" stroke="#1A237E" strokeWidth={1.4} />
        <circle cx="100" cy="100" r={46} fill="none" stroke="#1A237E" strokeWidth={1.6} />
        <text fill="#1A237E" fontSize="11" fontWeight="700" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">
          <textPath href="#provStampTop" startOffset="50%" textAnchor="middle">{PROVIDER.institutionName}</textPath>
        </text>
        <text x="100" y="96" textAnchor="middle" fill="#1A237E" fontSize="22" fontWeight="800" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">{PROVIDER.shortName}</text>
        <text x="100" y="120" textAnchor="middle" fill="#1A237E" fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">{PROVIDER.unifiedNumber}</text>
      </svg>
    </div>
  );
}