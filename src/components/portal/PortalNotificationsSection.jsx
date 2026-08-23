import React, { useEffect, useState } from "react";
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

export default function PortalNotificationsSection({ session }) {
  const { lang } = usePortalI18n();
  const t = usePortalT("notifications");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("portalData", {
        token: session.token, employee_id: session.employee_id, action: "notifications", limit: 500,
      });
      const data = res?.data || res;
      if (data?.ok) setItems(data.notifications || []);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [session]);

  const unread = items.filter((n) => !n.is_read).length;
  const markAll = async () => {
    if (!unread) return;
    try {
      await base44.functions.invoke("portalData", {
        token: session.token, employee_id: session.employee_id, action: "mark_notifications_read",
      });
      load();
    } catch {}
  };

  const isRtl = portalDir(lang) === "rtl";

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Bell size={20} className="text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{t.sectionTitle}</h3>
            <p className="text-xs text-muted-foreground">{t.sectionSub}</p>
          </div>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="text-xs text-violet-600 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-violet-200 hover:bg-violet-50">
            <Check size={14} /> {t.markAll}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">{t.loading}</div>
        ) : items.length === 0 ? (
          <div className="p-14 text-center">
            <Bell size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-muted-foreground text-sm">{t.empty}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((n) => {
              const m = pick(n, lang);
              return (
                <div key={n.id} className={cn("px-5 py-4", n.is_read ? "bg-white" : "bg-violet-50/60")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm">{m.title}</div>
                      {m.body && <div className="text-sm text-muted-foreground mt-1 leading-relaxed break-words whitespace-pre-wrap">{m.body}</div>}
                    </div>
                    {!n.is_read && <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-violet-500 mt-1.5" title={t.unread} />}
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 mt-2 tabular-nums">{fmtDateTime(n.created_date, lang)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}