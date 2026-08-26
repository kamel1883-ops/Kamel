import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Handshake, Loader2, Search, Mail, Phone, Copy, Check, ChevronDown, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import AffiliateEditDialog from "@/components/portal/AffiliateEditDialog";

const STATUS = {
  pending: { ar: "طلب جديد", en: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  active: { ar: "نشط", en: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  suspended: { ar: "موقوف", en: "Suspended", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function AffiliatesManager({ session, isAr = true }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState("");
  const [edit, setEdit] = useState(null);
  const [copied, setCopied] = useState("");

  const load = () => {
    setLoading(true);
    base44.functions.invoke("portalData", {
      token: session.token, employee_id: session.employee_id, action: "affiliate_list",
    }).then((res) => {
      const d = res?.data || res;
      if (d?.ok) setRows(d.affiliates || []);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((a) =>
      [a.full_name, a.ref_code, a.email, a.phone, a.channel].some((v) => String(v || "").toLowerCase().includes(s))
    );
  }, [rows, q]);

  const copy = (txt) => {
    navigator.clipboard?.writeText(txt);
    setCopied(txt); setTimeout(() => setCopied(""), 1500);
  };

  const refLink = (code) => `${window.location.origin}/?ref=${code}`;
  const money = (n) => (Number(n) || 0).toLocaleString("en-US") + (isAr ? " ر.س" : " SAR");

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Handshake size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold">{isAr ? "شركاء التسويق" : "Affiliate Partners"}</h3>
              <p className="text-xs text-muted-foreground">
                {isAr ? "بيانات التواصل ورمز الإحالة والعملاء المنسوبين لكل شريك" : "Contact details, referral code and attributed clients"}
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} className="ps-9"
              placeholder={isAr ? "ابحث بالاسم أو الرمز أو الجوال…" : "Search by name, code or phone…"} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">
          {isAr ? "لا يوجد شركاء مسجّلون بعد." : "No registered partners yet."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const st = STATUS[a.status] || STATUS.pending;
            const isOpen = open === a.id;
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="p-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{a.full_name}</span>
                      <span className={cn("text-[11px] rounded-full border px-2 py-0.5", st.cls)}>{isAr ? st.ar : st.en}</span>
                      <span className="text-[11px] rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 font-mono">
                        {a.ref_code}
                      </span>
                      <button onClick={() => copy(a.ref_code)} className="text-muted-foreground hover:text-foreground" title={isAr ? "نسخ الرمز" : "Copy code"}>
                        {copied === a.ref_code ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {a.email && <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1 hover:text-foreground" dir="ltr"><Mail size={12} /> {a.email}</a>}
                      {a.phone && <a href={`https://wa.me/${String(a.phone).replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground" dir="ltr"><Phone size={12} /> {a.phone}</a>}
                      {a.channel && <span>{isAr ? "القناة" : "Channel"}: {a.channel}</span>}
                      {a.bank_iban && <span dir="ltr">IBAN: {a.bank_iban}</span>}
                      {a.bank_name && <span>{a.bank_name}</span>}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground" dir="ltr">{refLink(a.ref_code)}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold flex items-center gap-1"><Users size={14} className="text-muted-foreground" /> {a.clients_count}</div>
                      <div className="text-[11px] text-muted-foreground">{isAr ? "عملاء منسوبون" : "Clients"}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-700 flex items-center gap-1"><Wallet size={14} /> {money(a.commission_total)}</div>
                      <div className="text-[11px] text-muted-foreground">{isAr ? `عمولة ${a.commission_percent || 7}%` : `${a.commission_percent || 7}% commission`}</div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setEdit(a)}>{isAr ? "إدارة" : "Manage"}</Button>
                      <Button size="sm" variant="ghost" className="gap-1" onClick={() => setOpen(isOpen ? "" : a.id)}>
                        <ChevronDown size={14} className={cn("transition", isOpen && "rotate-180")} />
                        {isAr ? "العملاء" : "Clients"}
                      </Button>
                    </div>
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-border bg-slate-50 p-5">
                    {a.clients.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{isAr ? "لا عملاء منسوبون لهذا الشريك بعد." : "No attributed clients yet."}</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-start">
                            <th className="text-start p-2">{isAr ? "العميل" : "Client"}</th>
                            <th className="text-start p-2">{isAr ? "الحالة" : "Status"}</th>
                            <th className="text-start p-2">{isAr ? "أول اشتراك مدفوع" : "First paid subscription"}</th>
                            <th className="text-start p-2">{isAr ? "العمولة المستحقة" : "Commission due"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.clients.map((c) => (
                            <tr key={c.id} className="border-t border-border">
                              <td className="p-2">{c.name}</td>
                              <td className="p-2 text-xs text-muted-foreground">{c.status}</td>
                              <td className="p-2">{c.first_paid_amount > 0 ? money(c.first_paid_amount) : "—"}</td>
                              <td className="p-2 font-semibold text-emerald-700">{c.commission > 0 ? money(c.commission) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AffiliateEditDialog
        affiliate={edit} isAr={isAr} session={session}
        onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }}
      />
    </div>
  );
}