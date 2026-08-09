import React from "react";
import { Crown } from "lucide-react";

// شعار الشركة يميناً + شعار جدارة يساراً — يظهر على كل مستند مُولّد
export default function BrandHeader({ org }) {
  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        borderBottom: "2px solid #0b1120",
        paddingBottom: 12,
        marginBottom: 18,
      }}
    >
      {/* يمين — المنشأة */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: 240 }}>
        {org?.logo_url ? (
          <img
            src={org.logo_url}
            crossOrigin="anonymous"
            alt="logo"
            style={{ maxWidth: 150, maxHeight: 64, objectFit: "contain" }}
          />
        ) : null}
        <div style={{ fontWeight: 700, fontSize: 13, color: "#0b1120", marginTop: 6, textAlign: "right" }}>
          {org?.name || "—"}
        </div>
        {org?.commercial_register ? (
          <div style={{ fontSize: 10, color: "#666" }}>س.ت: {org.commercial_register}</div>
        ) : null}
      </div>

      {/* يسار — جدارة */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "linear-gradient(135deg,#0b0f19,#2e2448)",
            boxShadow: "0 0 0 1px rgba(252,211,77,.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Crown size={22} strokeWidth={1.8} style={{ color: "#fbbf24" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0b1120", fontFamily: "var(--font-display)" }}>جدارة</div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 1 }}>لإدارة الموارد البشرية</div>
        </div>
      </div>
    </div>
  );
}