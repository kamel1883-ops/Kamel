import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ClipboardCheck, Check, X, Loader2, Download, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { leaveTypeLabel, formatCurrency } from "@/lib/hr";
import { badge } from "@/lib/approvals";
import { usePortalI18n, usePortalT, portalDir } from "@/lib/portalI18n";

export default function ApprovalsPortal({ portalSession }) {
  const { lang } = usePortalI18n();
  const t = usePortalT("approvals");
  const isAr = lang === "ar";

  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [note, setNote] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const portalArgs = portalSession
    ? { portal_token: portalSession.token, portal_employee_id: portalSession.employee_id }
    : {};

  const load = async () => {
    setLoading(true);
    try {
      if (!portalSession) {
        const m = await base44.auth.me();
        setMe(m);
      } else {
        setMe(portalSession.employee);
      }
      const res = await base44.functions.invoke("approvalQueue", portalArgs);
      setData(res.data);
    } catch (e) {
      setData({ error: e.message });
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const role = data?.role;

  const call = async (payload) => {
    await base44.functions.invoke("approvalAction", { ...payload, ...portalArgs });
    setActing(null); setNote(""); setProofFile(null);
    await load();
  };

  const openReject = (type, r) => { setActing({ type, req: r, action: "reject" }); setNote(""); };
  const confirmReject = async () => {
    if (!acting) return;
    setBusy(true);
    try { await call({ type: acting.type, action: "reject", id: acting.req.id, note }); }
    finally { setBusy(false); }
  };

  const openFinance = (type, r) => { setActing({ type, req: r, action: "confirm" }); setNote(""); setProofFile(null); };
  const confirmFinance = async () => {
    if (!acting) return;
    setBusy(true);
    let url = "";
    if (proofFile) { const up = await base44.integrations.Core.UploadFile({ file: proofFile }); url = up.file_url; }
    try { await call({ type: acting.type, action: "confirm", id: acting.req.id, note, proof_url: url }); }
    finally { setBusy(false); }
  };

  const managerApprove = async (type, r) => {
    setBusy(r.id);
    try { await call({ type, action: "approve", id: r.id }); }
    finally { setBusy(false); }
  };

  const Card = ({ r, children, actions, kindBadge }) => (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div>
              <div className="font-medium text-sm">{r.employee_name || "—"}</div>
              {r.national_id && <div className="text-xs text-muted-foreground tabular-nums" dir="ltr">{r.national_id}</div>}
            </div>
            {kindBadge || (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {r.leave_type ? leaveTypeLabel(r.leave_type) : t.loan}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {r.start_date ? t.days(r.start_date, r.end_date, r.days_count) : t.loanLine(r.amount, r.reason)}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", badge(r.status).cls)}>{badge(r.status).label}</span>
            {children}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {actions.map((a, i) => a.href ? (
            <a key={i} href={a.href} target="_blank" rel="noreferrer" className={cn("inline-flex items-center gap-1 h-8 px-3 rounded-md text-xs font-medium", a.cls)}>
              <Download size={14} /> {a.label}
            </a>
          ) : (
            <Button key={i} size="sm" onClick={a.onClick} disabled={a.busyKey ? busy === a.busyKey : busy}
              className={cn("h-8 text-xs gap-1", a.cls)}>
              {a.busyKey && busy === a.busyKey ? <Loader2 size={14} className="animate-spin" /> : null}
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const Empty = () => (
    <div className="p-14 text-center bg-white rounded-2xl border border-border">
      <ClipboardCheck size={40} className="mx-auto text-slate-300 mb-3" />
      <p className="text-muted-foreground">{t.empty}</p>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-muted-foreground animate-fade-in">{t.loading}</div>;
  if (!role || (role !== "manager" && role !== "finance"))
    return <div className="p-10 text-center text-muted-foreground">{t.noLink}</div>;

  // ===== المدير المباشر =====
  if (role === "manager") {
    const leaves = data?.leaves || [];
    return (
      <div dir={portalDir(lang)} className="animate-fade-in">
        <PageHeader title={t.mTitle} subtitle={t.mSub} />
        {data?.message && <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{data.message}</div>}
        {data?.subordinates?.length > 0 && <div className="mb-3 text-xs text-muted-foreground">{t.subInfo(data.subordinates.length)}</div>}
        <div className="space-y-3">
          {leaves.length === 0 ? <Empty /> : leaves.map((r) => (
            <Card key={r.id} r={r}
              actions={[
                { label: t.approve, cls: "bg-emerald-600 hover:bg-emerald-700", onClick: () => managerApprove("leaves", r), busyKey: r.id },
                { label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject("leaves", r) },
              ]}>
              {r.leave_type === "annual" && (
                <span className={cn("text-xs px-2 py-0.5 rounded-full", r.annual_leave_mode === "encash_continue" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700")}>
                  {isAr ? (r.annual_leave_mode === "encash_continue" ? "تصفية مع مواصلة العمل" : "إجازة سفر فعلي") : (r.annual_leave_mode === "encash_continue" ? "Encash & continue" : "Travel leave")}
                </span>
              )}
              {r.is_full_clearance && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{t.fullClear}</span>}
              {r.reason && <span className="text-xs text-muted-foreground">{r.reason}</span>}
            </Card>
          ))}
        </div>

        <Dialog open={!!acting} onOpenChange={() => setActing(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{t.rejectTitle}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">{t.rejectReason}</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActing(null)}>{t.cancel}</Button>
              <Button variant="destructive" onClick={confirmReject} disabled={busy} className="gap-1">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} {t.confirmReject}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ===== المدير المالي =====
  const leaves = data?.leaves || [];
  const loans = data?.loans || [];
  const trips = data?.trips || [];
  const settlements = data?.settlements || [];

  const leaveActions = (r) => {
    const a = [{ label: t.pay, cls: "bg-blue-600 hover:bg-blue-700", onClick: () => openFinance("leaves", r) },
               { label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject("leaves", r) }];
    if (r.settlement_pdf_url) a.push({ label: t.settlement, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.settlement_pdf_url });
    if (r.finance_proof_url) a.push({ label: t.finProof, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.finance_proof_url });
    return a;
  };
  const loanActions = (r) => {
    const a = [{ label: t.pay, cls: "bg-blue-600 hover:bg-blue-700", onClick: () => openFinance("loans", r) },
               { label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject("loans", r) }];
    if (r.statement_pdf_url) a.push({ label: t.statement, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.statement_pdf_url });
    return a;
  };
  const tripActions = (r) => {
    const a = [{ label: t.pay, cls: "bg-blue-600 hover:bg-blue-700", onClick: () => openFinance("trips", r) },
               { label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject("trips", r) }];
    if (r.approval_pdf_url) a.push({ label: t.tripDoc, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.approval_pdf_url });
    return a;
  };
  const settlementActions = (r) => {
    const a = [{ label: t.pay, cls: "bg-blue-600 hover:bg-blue-700", onClick: () => openFinance("settlements", r) },
               { label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject("settlements", r) }];
    if (r.finance_proof_url) a.push({ label: t.finProof, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.finance_proof_url });
    return a;
  };

  return (
    <div dir={portalDir(lang)} className="animate-fade-in">
      <PageHeader title={t.fTitle} subtitle={t.fSub} />
      <Tabs defaultValue="leaves">
        <TabsList className="mb-4">
          <TabsTrigger value="leaves">{t.tabLeaves(leaves.length)}</TabsTrigger>
          <TabsTrigger value="loans">{t.tabLoans(loans.length)}</TabsTrigger>
          <TabsTrigger value="trips">{t.tabTrips(trips.length)}</TabsTrigger>
          {settlements.length > 0 && <TabsTrigger value="settlements">{t.tabSettlements(settlements.length)}</TabsTrigger>}
        </TabsList>

        <TabsContent value="leaves">
          <div className="space-y-3">
            {leaves.length === 0 ? <Empty /> : leaves.map((r) => (
              <Card key={r.id} r={r} actions={leaveActions(r)}>
                {r.leave_type === "annual" && (
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", r.annual_leave_mode === "encash_continue" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700")}>
                    {isAr ? (r.annual_leave_mode === "encash_continue" ? "تصفية مع مواصلة العمل" : "إجازة سفر فعلي") : (r.annual_leave_mode === "encash_continue" ? "Encash & continue" : "Travel leave")}
                  </span>
                )}
                {r.is_full_clearance && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{t.fullClear}</span>}
                {Number(r.ticket_amount) > 0 && <span className="text-xs text-muted-foreground">{t.ticket(r.ticket_amount)}</span>}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <div className="space-y-3">
            {loans.length === 0 ? <Empty /> : loans.map((r) => (
              <Card key={r.id} r={r} actions={loanActions(r)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trips">
          <div className="space-y-3">
            {trips.length === 0 ? <Empty /> : trips.map((r) => (
              <Card key={r.id} r={r} actions={tripActions(r)}
                kindBadge={<span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 flex items-center gap-1"><Plane size={11} /> {r.trip_type === "external" ? t.tripExt : t.tripInt}</span>}>
                {Number(r.total_cost) > 0 && <span className="text-xs text-muted-foreground">{t.tripCost(r.total_cost)}</span>}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settlements">
          <div className="space-y-3">
            {settlements.length === 0 ? <Empty /> : settlements.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div>
                        <div className="font-medium text-sm">{r.employee_name || "—"}</div>
                        {r.national_id && <div className="text-xs text-muted-foreground tabular-nums" dir="ltr">{r.national_id}</div>}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{t.eosBadge}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t.totalSettleLabel}<b className="text-foreground">{formatCurrency(r.total_settlement)}</b> · {r.last_working_date || ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {settlementActions(r).map((a, i) => a.href ? (
                      <a key={i} href={a.href} target="_blank" rel="noreferrer" className={cn("inline-flex items-center gap-1 h-8 px-3 rounded-md text-xs font-medium", a.cls)}>
                        <Download size={14} /> {a.label}
                      </a>
                    ) : (
                      <Button key={i} size="sm" onClick={a.onClick} disabled={busy} className={cn("h-8 text-xs gap-1", a.cls)}>
                        {a.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* رفض */}
      <Dialog open={acting?.action === "reject"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.rejectTitle}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">{t.rejectReason}</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActing(null)}>{t.cancel}</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={busy} className="gap-1">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} {t.confirmReject}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* صرف */}
      <Dialog open={acting?.action === "confirm"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.payTitle}</DialogTitle></DialogHeader>
          {acting && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {acting.type === "leaves" ? t.leavePay(acting.req.ticket_amount || 0) : acting.type === "loans" ? t.loanPay(acting.req.amount) : acting.type === "settlements" ? t.settlePay(acting.req.total_settlement) : t.tripPay()}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.finNote}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={t.finNotePh} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.proof}</Label>
                <Input type="file" onChange={(e) => setProofFile(e.target.files?.[0])} />
              </div>
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{acting.type === "settlements" ? t.payNoteSettle : t.payNote}</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActing(null)}>{t.cancel}</Button>
                <Button onClick={confirmFinance} disabled={busy} className="gap-1 bg-blue-600 hover:bg-blue-700">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {t.confirmPay}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}