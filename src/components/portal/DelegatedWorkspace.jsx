import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Users, UserPlus, Fingerprint, Upload, CheckCircle2, CalendarDays, Plane, Banknote,
  ShieldCheck, Car, FileText, Target, GraduationCap, Network, MessageSquare,
  AlertTriangle, ScrollText, Gift, BarChart3, FileBadge, Globe, Settings, ChevronLeft,
} from "lucide-react";
import { delegatedFor } from "./delegatedRegistry";
import DelegatedAdminSection from "./DelegatedAdminSection";

const ICONS = {
  Users, UserPlus, Fingerprint, Upload, CheckCircle2, CalendarDays, Plane, Banknote,
  ShieldCheck, Car, FileText, Target, GraduationCap, Network, MessageSquare,
  AlertTriangle, ScrollText, Gift, BarChart3, FileBadge, Globe, Settings,
};

// أي قسم مُفوّض يُعرض للموظف بصفحته الأصلية من لوحة الشركات وبكامل صلاحياته،
// وكل عملية ينفّذها تُوثّق تلقائياً بـ «أُعدّت بواسطة» (اسمه ورقم هويته) على الخادم.
export default function DelegatedWorkspace({ perms, session, employee, isAr = true }) {
  const sections = delegatedFor(perms);
  const [active, setActive] = useState(null);
  if (!sections.length) return null;

  const current = sections.find((s) => s.key === active);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={18} className="text-violet-600" />
        <h3 className="font-bold">{isAr ? "الأقسام الإدارية المفوّضة لك" : "Your delegated departments"}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
          {sections.length}
        </span>
      </div>

      {!current ? (
        <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-lg divide-y divide-border overflow-hidden">
          {sections.map((s) => {
            const Icon = ICONS[s.icon] || ShieldCheck;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(s.key)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-right hover:bg-violet-50/60 transition"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-violet-600" />
                  </span>
                  <span className="text-sm font-medium truncate">{isAr ? s.ar : s.en}</span>
                </span>
                <ChevronLeft size={16} className={cn("text-muted-foreground shrink-0", !isAr && "rotate-180")} />
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setActive(null)}
            className="mb-4 inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-white border border-border hover:bg-violet-50 transition"
          >
            <ChevronLeft size={16} className={cn(isAr && "rotate-180")} />
            {isAr ? "رجوع للأقسام" : "Back to departments"}
          </button>
          <div className="mb-3 text-xs text-muted-foreground">
            {isAr
              ? "كل إجراء تنفّذه في هذا القسم يُسجَّل ويُطبع بعبارة «أُعدّت بواسطة» باسمك ورقم هويتك."
              : "Every action here is recorded and stamped “Prepared by” with your name and ID."}
          </div>
          <DelegatedAdminSection sectionKey={current.key} session={session} employee={employee} />
        </div>
      )}
    </div>
  );
}