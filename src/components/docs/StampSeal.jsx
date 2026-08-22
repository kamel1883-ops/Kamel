import React from "react";

// الختم الرسمي الأصلي للمنشأة المُوفِّرة — صورة الختم الفعلية المرفوعة.
// يُستخدم في عرض السعر وعقد الاشتراك (منطقة التوقيع/الختم) لضمان ظهور الختم الحقيقي داخل ملفات PDF.
export const STAMP_URL =
  "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/d6e952bf9_image.jpeg";

export default function StampSeal({ size = 150, rotate = -7, opacity = 0.9 }) {
  return (
    <img
      src={STAMP_URL}
      crossOrigin="anonymous"
      alt="ختم جدارة"
      width={size}
      height={size}
      style={{
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        opacity,
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}