import React from "react";

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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg,#0b0f19,#2e2448)",
            color: "#f5d77a",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          ج
        </div>
        <div style={{ fontWeight: 800, fontSize: 13, marginTop: 6, color: "#0b1120" }}>جدارة</div>
        <div style={{ fontSize: 9, color: "#666" }}>لإدارة الموارد البشرية</div>
      </div>
    </div>
  );
}