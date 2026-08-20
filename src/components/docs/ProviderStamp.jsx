import React from "react";
import { PROVIDER } from "@/lib/providerIdentity";

// ختم موحّد للمنشأة المُوفِّرة — دائرتان خارجيتان + دائرة وسطى،
// مع اسم المنشأة أعلى الختم، اسم «جدارة» في الوسط، والرقم الموحّد تحته.
// نستخدم نصاً مستقيماً (لا textPath على قوس) لضمان ظهوره الصحيح داخل
// ملفات PDF المُولّدة عبر html2canvas، إذ تفشل هذه المكتبة في تتبّع النص المنحنى.
export default function ProviderStamp({ size = 150, rotate = true }) {
  return (
    <div style={rotate ? { transform: "rotate(-7deg)", opacity: 0.85 } : { opacity: 0.85 }}>
      <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r={92} fill="none" stroke="#1A237E" strokeWidth={3} />
        <circle cx="100" cy="100" r={84} fill="none" stroke="#1A237E" strokeWidth={1.4} />
        <circle cx="100" cy="100" r={46} fill="none" stroke="#1A237E" strokeWidth={1.6} />
        <text x="100" y="78" textAnchor="middle" fill="#1A237E" fontSize="9" fontWeight="700" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">{PROVIDER.institutionName}</text>
        <text x="100" y="98" textAnchor="middle" fill="#1A237E" fontSize="22" fontWeight="800" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">{PROVIDER.shortName}</text>
        <text x="100" y="117" textAnchor="middle" fill="#1A237E" fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">{PROVIDER.unifiedNumber}</text>
      </svg>
    </div>
  );
}