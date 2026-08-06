import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ icon: Icon, label, value, tint = "slate" }) {
  const tints = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", tints[tint])}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-foreground tabular-nums truncate">{value}</div>
      </div>
    </div>
  );
}