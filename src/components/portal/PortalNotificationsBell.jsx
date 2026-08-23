import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalI18n, usePortalT, portalDir } from "@/lib/portalI18n";

const pick = (n, lang) => {
  if (!n) return { title: "", body: "" };
  if (n.i18n) {
    try {
      const p = JSON.parse(n.i18n);
      if (p && p[lang]) return { title: p[lang].title || n.title || "", body: p[lang].body || n.body || "" };
    } catch {}
  }
  return { title: n.title || "", body: n.body || "" };
};

const fmtDateTime = (iso, lang) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB");
  const time = d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
};

export default function PortalNotificationsBell({ session, onViewAll, tone = "light", align }) {
  const { lang } = usePortalI18n();
  const t = usePortalT("notifications");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    if (!session) return;
    try {
      const res = await base44.functions.invoke("portalData", {
        token: session.token, employee_id: session.employee_id, action: "notifications", limit: 50,
      });
      const data = res?.data || res;
      if (data?.ok) setItems(data.notifications || []);
    } catch {}
  };
  useEffect(() => { load(); const i = setInterval(load, 30000); return () => clearInterval(i); }, [session]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const unread = items.filter((n) => !n.is_read).length;
  const markRead = async () => {
    if (!unread) return;
    try {
      await base44.functions.invoke("portalData", {
        token: session.token, employee_id: session.employee_id, action: "mark_notifications_read",
      });
      load();
    } catch {}
  };
  const toggle = () => { const n = !open; setOpen(n); if (n && unread) setTimeout(markRead, 500); };

  const dir = portalDir(lang);
  const isRtl = dir === "rtl";
  const alignCls = align || (isRtl ? "left" : "right");
  const btnCls = tone === "light" ? "text-white/80 hover:text-white" : "text-foreground hover:text-foreground";

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className={cn("relative p-2 rounded-lg transition", btnCls)} aria-label="notifications">
        <Bell size={20} />
        {unread > 0 && <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{unread}</span>}
      </button>
      {open && (
        <div dir={dir} className={cn("absolute mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border bg-white shadow-2xl z-50 text-foreground", isRtl ? "right-0 text-right" : "left-0 text-left", alignCls === "left" ? (isRtl ? "left-0" : "right-0 left-auto") : (isRtl ? "right-0 left-auto" : "left-0"))}>
          <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white">
            <span className="font-semibold text-sm">{t.title}</span>
            {unread > 0 && <button onClick={markRead} className="text-xs text-violet-600 flex items-center gap-1"><Check size={12} /> {t.markRead}</button>}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">{t.empty}</div>
          ) : items.map((n) => {
            const m = pick(n, lang);
            return (
              <div key={n.id} className={cn("px-5 py-3 border-b text-sm", n.is_read ? "bg-white" : "bg-violet-50")}>
                <div className="font-medium">{m.title}</div>
                {m.body && <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed break-words whitespace-pre-wrap">{m.body}</div>}
                <div className="text-[10px] text-muted-foreground/70 mt-1 tabular-nums">{fmtDateTime(n.created_date, lang)}</div>
              </div>
            );
          })}
          <button onClick={() => { setOpen(false); onViewAll?.(); }} className="block w-full text-center text-xs text-violet-600 py-3 border-t hover:bg-violet-50">
            {t.viewAll}
          </button>
        </div>
      )}
    </div>
  );
}