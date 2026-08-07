import React from "react";
import { ROLE_STYLES, roleLabel } from "@/lib/orgTree";

/**
 * هيكل تنظيمي بصري هرمي (مستطيلات + خطوط ربط) كشكل السلايدات.
 * كل مستطيل يعرض: شريط لوني للمستوى + أيقونة + المسمى الوظيفي + الاسم الكامل + الرقم + الإدارة.
 */
export default function OrgChart({ roots, lang, dir = "rtl" }) {
  if (!roots || roots.length === 0) return null;
  const rtl = dir === "rtl";
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex justify-center min-w-fit px-6">
        {roots.map((node) => (
          <div key={node.id} className="flex flex-col items-center">
            <SingleRoot node={node} lang={lang} rtl={rtl} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SingleRoot({ node, lang, rtl }) {
  const style = ROLE_STYLES[node.role_level] || ROLE_STYLES.employee;
  const name = node.full_name || node.position || (node.employee_number ? `#${node.employee_number}` : "—");
  const role = roleLabel(node.role_level, lang);
  const subParts = [];
  if (node.position && node.position !== name) subParts.push(node.position);
  if (node.department) subParts.push(node.department);
  if (node.employee_number) subParts.push(`#${node.employee_number}`);
  const kids = node._children || [];

  return (
    <div className="flex flex-col items-center">
      {/* بطاقة الموظف */}
      <div className="w-52 rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className={`h-1.5 w-full ${style.dot}`} />
        <div className="p-2.5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-7 h-7 rounded-lg ${style.bg} ${style.text} flex items-center justify-center text-sm shrink-0`}>{style.icon}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${style.bg} ${style.text} truncate max-w-[150px]`}>{role}</span>
          </div>
          <div className="text-sm font-semibold text-foreground truncate">{name}</div>
          {subParts.length > 0 && <div className="text-[11px] text-muted-foreground truncate">{subParts.join(" • ")}</div>}
        </div>
      </div>

      {kids.length > 0 && (
        <div className="flex flex-col items-center">
          {/* خط نازل من المدير */}
          <div className="w-px h-7 bg-border" />
          {/* صف الأبناء */}
          <div className="flex justify-center">
            {kids.map((child, i) => {
              const hasLeftSibling = rtl ? i < kids.length - 1 : i > 0;
              const hasRightSibling = rtl ? i > 0 : i < kids.length - 1;
              return (
                <div key={child.id} className="w-56 shrink-0">
                  {/* خلية الربط */}
                  <div className="relative h-7">
                    {/* خط رأسي نازل للابن */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-7 bg-border" />
                    {/* نصف أفقي يسار */}
                    {hasLeftSibling && <div className="absolute top-0 left-0 right-1/2 h-px bg-border" />}
                    {/* نصف أفقي يمين */}
                    {hasRightSibling && <div className="absolute top-0 left-1/2 right-0 h-px bg-border" />}
                  </div>
                  <div className="flex justify-center">
                    <SingleRoot node={child} lang={lang} rtl={rtl} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}