import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Gift, Loader2, CheckCircle2 } from "lucide-react";
import { usePortalI18n, usePortalT } from "@/lib/portalI18n";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/hr";

function parseI18n(rec) { try { return JSON.parse(rec.i18n || "{}"); } catch { return {}; } }
function loc(rec, lang) {
  const tr = parseI18n(rec);
  return { title: tr?.title?.[lang] || rec.title, body: tr?.body?.[lang] || rec.body };
}
function isAcked(rec, empId) {
  if (!rec?.acknowledged_log) return false;
  try { const p = JSON.parse(rec.acknowledged_log || "[]"); if (Array.isArray(p)) return p.some((x) => String(x.employee_id || "") === String(empId)); } catch {}
  return false;
}

export default function EmployeeIncentives({ items, session, onReload }) {
  const { lang } = usePortalI18n();
  const t = usePortalT("incentives");
  const empId = session?.employee_id;
  const [busy, setBusy] = useState("");
  const [expanded, setExpanded] = useState(null);

  const ack = async (r) => {
    setBusy(r.id);
    try {
      await base44.functions.invoke("portalData", { token: session.token, employee_id: empId, action: "ack_incentive", id: r.id });
      if (onReload) await onReload();
    } catch {} finally { setBusy(""); }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Gift size={18} className="text-amber-600" />
        <h3 className="text-sm font-semibold">{t.title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{t.subtitle}</p>
      {items.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-sm">{t.empty}</div>
      ) : (
        <div className="space-y-2.5">
          {items.map((r) => {
            const lc = loc(r, lang);
            const acked = isAcked(r, empId);
            const open = expanded === r.id;
            return (
              <div key={r.id} className="rounded-xl border border-border bg-gradient-to-br from-amber-50/40 to-white overflow-hidden">
                <button type="button" onClick={() => setExpanded(open ? null : r.id)} className="w-full text-right p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">{t.types[r.incentive_type] || r.incentive_type}</span>
                    <span className="font-bold text-sm text-violet-700">{formatCurrency(r.amount)}</span>
                    <span className="text-xs text-muted-foreground me-auto" dir="ltr">{t.granted}: {r.granted_date || "—"}</span>
                    {acked && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={12} /> {t.ackDone}</span>}
                  </div>
                  <div className="font-medium text-sm mt-1.5">{lc.title}</div>
                  <div className={cn("text-xs text-muted-foreground mt-1 leading-relaxed", !open && "line-clamp-2")}>{lc.body}</div>
                </button>
                {!acked && (
                  <div className="px-3 pb-3">
                    <button onClick={() => ack(r)} disabled={busy === r.id} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
                      {busy === r.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} OK
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}