import React from "react";

export function PhoneFrame({ children }) {
  return (
    <div className="relative w-[19rem] rounded-[2.75rem] border-[10px] border-slate-900 bg-slate-900 p-1.5 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7)]">
      <div className="absolute left-1/2 top-2 z-20 h-1.5 w-20 -translate-x-1/2 rounded-full bg-slate-700" />
      <div className="overflow-hidden rounded-[2.25rem] bg-white pt-5">{children}</div>
    </div>
  );
}

export function LaptopFrame({ children }) {
  return (
    <div className="w-[34rem]">
      <div className="rounded-t-2xl border-[12px] border-b-[16px] border-slate-900 bg-slate-900 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7)]">
        <div className="overflow-hidden rounded-md bg-white">{children}</div>
      </div>
      <div className="mx-auto h-3 w-[38rem] max-w-full rounded-b-2xl bg-slate-800" />
      <div className="mx-auto h-1.5 w-32 rounded-b-full bg-slate-700" />
    </div>
  );
}