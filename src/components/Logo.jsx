import React from "react";
import { Crown } from "lucide-react";
export { Crown };
import { cn } from "@/lib/utils";

// الشعار الرسمي الموحّد لجدارة — يُستخدم كما هو (صورة واحدة فيها الأيقونة + الاسم)
// عبر كامل النظام: الهبوط، بوابة الموظف، بوابة الشركات، بوابة المالك، واجهات الدخول.
const LOGO_URL =
  "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/9be992640_Gemini_Generated_Image_inkbyxinkbyxinkb.jpg";

export default function Logo({ variant = "full", tone = "light", size = 44, className }) {
  return (
    <div className={cn("inline-flex items-center", className)} dir="rtl">
      <img
        src={LOGO_URL}
        alt="جدارة — لإدارة الموارد البشرية"
        loading="eager"
        draggable={false}
        style={{
          height: size,
          width: "auto",
          objectFit: "contain",
          display: "block",
          maxWidth: "none",
          borderRadius: Math.round(size * 0.18),
        }}
      />
    </div>
  );
}