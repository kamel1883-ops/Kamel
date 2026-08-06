import React from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Logo({ variant = "full", tone = "light", size = 44, className }) {
  const textMain = tone === "light" ? "text-white" : "text-foreground";
  const textSub = tone === "light" ? "text-white/55" : "text-muted-foreground";
  return (
    <div className={cn("inline-flex items-center gap-3", className)} dir="rtl">
      <div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b0f19] to-[#2e2448] ring-1 ring-amber-300/30 shadow-lg shadow-amber-900/10 shrink-0"
        style={{ width: size, height: size }}
      >
        <Crown size={Math.round(size * 0.48)} className="text-amber-300" strokeWidth={1.8} />
      </div>
      {variant === "full" && (
        <div className="leading-tight">
          <div className={cn("font-bold text-base sm:text-lg", textMain)} style={{ fontFamily: "var(--font-display)" }}>
            جدارة
          </div>
          <div className={cn("text-[10px] sm:text-[11px] -mt-0.5", textSub)}>لإدارة الموارد البشرية</div>
        </div>
      )}
    </div>
  );
}