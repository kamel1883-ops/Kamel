import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const statusMap = {
  draft: { ar: "مسودة", cls: "bg-slate-100 text-slate-700" },
  in_progress: { ar: "قيد التنفيذ", cls: "bg-amber-100 text-amber-800" },
  completed: { ar: "مكتملة", cls: "bg-emerald-100 text-emerald-800" },
  cancelled: { ar: "ملغاة", cls: "bg-red-100 text-red-700" },
};

// حوار استعلام تفاصيل خطة تدريبية كاملة + أسماء الموظفين المشمولين
export default function TrainingPlanDetailsDialog({ open, onClose, plan }) {
  if (!plan) return null;
  const st = statusMap[plan.status] || statusMap.draft;
  const names = plan.employee_names || plan.employee_name || "—";

  const rows = [
    ["اسم الخطة", plan.title || "—"],
    ["الحالة", st.ar],
    ["نطاق التطبيق", plan.scope === "department" ? "جهة/قسم كامل" : "موظفون محددون"],
    ["الجهة/القسم", plan.department || "—"],
    ["الموظفون المشمولون", names],
    ["تاريخ البداية", plan.start_date || "—"],
    ["تاريخ النهاية", plan.end_date || "—"],
    ["التكلفة (ريال)", plan.cost ? Number(plan.cost).toLocaleString() : "—"],
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span>{plan.title}</span>
            <Badge className={st.cls + " border-0"}>{st.ar}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-xl border border-border overflow-hidden">
            {rows.map(([k, v], i) => (
              <div key={i} className={"flex gap-3 px-4 py-2.5 text-sm " + (i % 2 ? "bg-muted/30" : "")}>
                <span className="text-xs text-muted-foreground w-40 shrink-0 pt-0.5">{k}</span>
                <span className="font-medium whitespace-pre-wrap min-w-0">{v}</span>
              </div>
            ))}
          </div>
          {plan.deficiency && <Section title="مشاكل النقص">{plan.deficiency}</Section>}
          {plan.goal && <Section title="الهدف بعد الخطة">{plan.goal}</Section>}
          {plan.mechanism && <Section title="آلية التنفيذ">{plan.mechanism}</Section>}
          {plan.description && <Section title="الوصف والشرح">{plan.description}</Section>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="text-xs font-bold text-muted-foreground mb-1.5">{title}</div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
  );
}