import React from "react";

// شاشة بدء مملوءة بالكامل بلوقو جداره الرسمي
// تُعرض فور فتح التطبيق وتبقى حتى يكتمل تحميل الواجهة
const LOGO_URL =
  "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/f7b65511d_Gemini_Generated_Image_bc8r52bc8r52bc8r.jpg";

export default function SplashScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F9F9FB",
      }}
    >
      <img
        src={LOGO_URL}
        alt="جداره"
        style={{
          width: "86%",
          maxWidth: "560px",
          height: "auto",
          objectFit: "contain",
        }}
      />
    </div>
  );
}