import React, { forwardRef } from "react";

const A4Page = forwardRef(({ children, pageNo, total, bare = false }, ref) => {
  return (
    <div
      ref={ref}
      className={bare ? "bg-white shadow-xl mx-auto mb-6 overflow-hidden relative" : "bg-white shadow-xl mx-auto mb-6 flex flex-col"}
      style={{ width: 794, minHeight: 1123, padding: bare ? 0 : "52px 52px 42px" }}
    >
      {bare ? (
        children
      ) : (
        <>
          {children}
          <div className="mt-auto pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>جدارة · منصة الموارد البشرية السحابية</span>
            <span dir="ltr">{pageNo} / {total} · jadara-hr.sa</span>
          </div>
        </>
      )}
    </div>
  );
});
A4Page.displayName = "A4Page";
export default A4Page;