import React from "react";

// شاشة بدء مملوءة بالكامل بهوية جداره (كحلي + ذهبي)
// تُعرض فور فتح التطبيق وتبقى حتى يكتمل تحميل الواجهة
export default function SplashScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0b1120 0%, #1a1333 100%)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 138,
            height: 138,
            borderRadius: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a1333, #2e2448)",
            boxShadow:
              "0 0 0 1px rgba(212,175,55,.30), 0 24px 48px -12px rgba(0,0,0,.55)",
          }}
        >
          <svg
            width="68"
            height="68"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d4af37"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
            <path d="M5 21h14" />
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              fontFamily: "'Tajawal','IBM Plex Sans Arabic',sans-serif",
            }}
          >
            جداره
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,.55)",
              marginTop: 6,
              fontFamily: "'Tajawal','IBM Plex Sans Arabic',sans-serif",
            }}
          >
            لإدارة الموارد البشرية
          </div>
        </div>
      </div>
    </div>
  );
}