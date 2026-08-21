import React from "react";
import { PROVIDER } from "@/lib/providerIdentity";

// ختم موحّد للمنشأة المُوفِّرة — دائرتان خارجيتان + دائرة وسطى صغيرة،
// مع اسم المنشأة على سطرين بنفس حجم كلمة «جدارة» تقريباً، و«جدارة» في الوسط، والرقم الموحّد تحته.
// نستخدم نصاً مستقيماً (لا textPath على قوس) لضمان ظهوره الصحيح داخل
// ملفات PDF المُولّدة عبر html2canvas، إذ تفشل هذه المكتبة في تتبّع النص المنحنى.
export default function ProviderStamp({ size = 150, rotate = true }) {
  const name = PROVIDER.institutionName || "";
  const mid = Math.ceil(name.length / 2);
  const line1 = name.slice(0, mid).trim();
  const line2 = name.slice(mid).trim();
  return (
    <div style={rotate ? { transform: "rotate(-7deg)", opacity: 0.85 } : { opacity: 0.85 }}>
      <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r={92} fill="none" stroke="#1A237E" strokeWidth={3} />
        <circle cx="100" cy="100" r={84} fill="none" stroke="#1A237E" strokeWidth={1.4} />
        <circle cx="100" cy="100" r={34} fill="none" stroke="#1A237E" strokeWidth={1.6} />
        <text x="100" y="56" textAnchor="middle" fill="#1A237E" fontSize="17" fontWeight="800" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">{line1}</text>
        <text x="100" y="74" textAnchor="middle" fill="#1A237E" fontSize="17" fontWeight="800" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">{line2}</text>
        <text x="100" y="104" textAnchor="middle" fill="#1A237E" fontSize="22" fontWeight="800" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">{PROVIDER.shortName}</text>
        <text x="100" y="122" textAnchor="middle" fill="#1A237E" fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">{PROVIDER.unifiedNumber}</text>
      </svg>
    </div>
  );
}