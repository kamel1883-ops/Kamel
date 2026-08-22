import React from "react";
import { ROLE_STYLES, roleLabel } from "@/lib/orgTree";

/**
 * هيكل تنظيمي بصري هرمي بنمط زجاجي شفاف عصري (Glassmorphism).
 * كل بطاقة: بار لوني للمستوى + أيقونة + شارة المستوى الزجاجية + الاسم + المسمى + الإدارة + الرقم.
 * خطوط الربط كحلية ناعمة متدرجة.
 */
const NAVY_LINE = "bg-[#142C4F]/30";
const CARD_GLASS =
  "rounded-2xl border border-white/80 bg-white/45 backdrop-blur-xl " +
  "shadow-[0_10px_30px_-12px_rgba(11,23,59,0.22)] " +
  "hover:shadow-[0_18px_44px_-14px_rgba(11,23,59,0.36)] hover:-translate-y-0.5 " +
  "transition-all duration-300";

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
      {/* بطاقة الموظف الزجاجية */}
      <div className={`w-56 ${CARD_GLASS} overflow-hidden`}>
        {/* البار اللوني العلوي */}
        <div className="h-1.5 w-full relative">
          <div className={`h-full w-full ${style.dot}`} />
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/40" />
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`w-8 h-8 rounded-lg ${style.bg} ${style.text} flex items-center justify-center text-sm shrink-0 bg-white/70 backdrop-blur border border-white/80 shadow-sm`}
            >
              {style.icon}
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.text} truncate max-w-[150px] bg-white/70 backdrop-blur border border-white/70`}
            >
              {role}
            </span>
          </div>
          <div className="text-sm font-semibold text-foreground truncate">{name}</div>
          {subParts.length > 0 && (
            <div className="text-[11px] text-muted-foreground truncate mt-0.5">{subParts.join(" • ")}</div>
          )}
        </div>
      </div>

      {kids.length > 0 && (
        <div className="flex flex-col items-center">
          {/* خط نازل من المدير */}
          <div className={`w-px h-7 ${NAVY_LINE}`} />
          {/* صف الأبناء */}
          <div className="flex justify-center">
            {kids.map((child, i) => {
              const hasLeftSibling = rtl ? i < kids.length - 1 : i > 0;
              const hasRightSibling = rtl ? i > 0 : i < kids.length - 1;
              return (
                <div key={child.id} className="w-60 shrink-0">
                  {/* خلية الربط */}
                  <div className="relative h-7">
                    {/* خط رأسي نازل للابن */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-px h-7 ${NAVY_LINE}`} />
                    {/* نصف أفقي يسار */}
                    {hasLeftSibling && <div className={`absolute top-0 left-0 right-1/2 h-px ${NAVY_LINE}`} />}
                    {/* نصف أفقي يمين */}
                    {hasRightSibling && <div className={`absolute top-0 left-1/2 right-0 h-px ${NAVY_LINE}`} />}
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