import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { ClipboardCheck, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { leaveTypeLabel, formatCurrency, todayISO } from "@/lib/hr";
import { badge, leaveTicketAmount, needsFinance } from "@/lib/approvals";
import { useI18n } from "@/lib/i18n";

export default function Approvals() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "الموافقات والطلبات", subtitle: "مسار الاعتماد: المدير المباشر ← الموارد البشرية ← المالية ← السداد بإثبات",
    loading: "جارٍ التحميل...", tabLeaves: (n) => `الإجازات (${n})`, tabLoans: (n) => `السلف (${n})`,
    mgrApprove: "موافقة المدير", hrApprove: "موافقة الموارد البشرية", reject: "رفض", pay: "تأكيد الصرف",
    fullClear: "تصفية كاملة", ticket: (v) => `تذكرة: ${formatCurrency(v)}`, deduct: (n) => `خصم رصيد: ${n} يوم`,
    loan: "سلفة", days: (s, e, n) => `${s} ← ${e} · ${n} يوم`, loanLine: (v, r) => `${formatCurrency(v)} · ${r}`,
    empty: "لا توجد طلبات", rejectTitle: "رفض الطلب", rejectReason: "سبب الرفض", cancel: "إلغاء", confirmReject: "تأكيد الرفض",
    payTitle: "تأكيد الصرف — المالية/المحاسبة", leavePay: (v) => <>تصفية إجازة كاملة — تعويض التذكرة: <b className="text-foreground">{formatCurrency(v)}</b></>,
    loanPay: (v) => <>سلفة بقيمة <b className="text-foreground">{formatCurrency(v)}</b></>, proof: "إثبات التحويل (صورة)",
    payNoteL: "عند التأكيد تُقفل العملية ويُسجّل إثبات التحويل. ويُحدّث آخر استخدام للتذكرة.",
    payNote: "عند التأكيد تُقفل العملية ويُسجّل إثبات التحويل.", confirmPay: "تأكيد الصرف",
  } : {
    title: "Approvals & Requests", subtitle: "Approval flow: Direct manager ← HR ← Finance ← Settlement with proof",
    loading: "Loading...", tabLeaves: (n) => `Leaves (${n})`, tabLoans: (n) => `Loans (${n})`,
    mgrApprove: "Manager approve", hrApprove: "HR approve", reject: "Reject", pay: "Confirm payment",
    fullClear: "Full clearance", ticket: (v) => `Ticket: ${formatCurrency(v)}`, deduct: (n) => `Balance deducted: ${n} days`,
    loan: "Loan", days: (s, e, n) => `${s} ← ${e} · ${n} days`, loanLine: (v, r) => `${formatCurrency(v)} · ${r}`,
    empty: "No requests", rejectTitle: "Reject request", rejectReason: "Rejection reason", cancel: "Cancel", confirmReject: "Confirm rejection",
    payTitle: "Confirm payment — Finance/Accounting", leavePay: (v) => <>Full leave clearance — ticket compensation: <b className="text-foreground">{formatCurrency(v)}</b></>,
    loanPay: (v) => <>Loan of <b className="text-foreground">{formatCurrency(v)}</b></>, proof: "Transfer proof (image)",
    payNoteL: "On confirmation the process closes and the transfer proof is recorded. Last ticket usage is updated.",
    payNote: "On confirmation the process closes and the transfer proof is recorded.", confirmPay: "Confirm payment",
  };

  const [leaves, setLeaves] = useState([]);
  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [org, setOrg] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [note, setNote] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [lv, ln, emps, orgs] = await Promise.all([
      base44.entities.LeaveRequest.list("-created_date", 500),
      base44.entities.LoanRequest.list("-created_date", 500),
      base44.entities.Employee.list("-created_date", 500),
      base44.entities.Organization.list("-created_date", 1),
    ]);
    setLeaves(lv); setLoans(ln); setEmployees(emps); setOrg(orgs[0]);
    try { setMe(await base44.auth.me()); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const empOf = (id) => employees.find((e) => e.id === id);

  const actionsFor = (type, r) => {
    const s = r.status;
    const btns = [];
    if (s === "pending_manager" || s === "pending") {
      btns.push({ label: t.mgrApprove, cls: "bg-emerald-600 hover:bg-emerald-700", onClick: () => managerApprove(type, r) });
      btns.push({ label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => reject(type, r, "manager") });
    } else if (s === "manager_approved") {
      btns.push({ label: t.hrApprove, cls: "bg-violet-600 hover:bg-violet-700", onClick: () => hrApprove(type, r) });
      btns.push({ label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => reject(type, r, "hr") });
    } else if (s === "awaiting_finance" || s === "hr_approved") {
      btns.push({ label: t.pay, cls: "bg-blue-600 hover:bg-blue-700", onClick: () => openFinance(type, r) });
    }
    return btns;
  };

  const managerApprove = async (type, r) => {
    await update(type, r.id, { manager_status: "approved", manager_id: me?.id, manager_name: me?.full_name, manager_date: todayISO(), status: "manager_approved" });
    load();
  };
  const hrApprove = async (type, r) => {
    if (type === "leaves") {
      const emp = empOf(r.employee_id);
      const balance = Number(emp?.leave_balance) || 0;
      const deduct = Math.min(r.days_count, balance);
      const fin = needsFinance(r, emp, org);
      const ticket = fin ? leaveTicketAmount(emp, org) : 0;
      await base44.entities.LeaveRequest.update(r.id, {
        hr_status: "approved", hr_id: me?.id, hr_name: me?.full_name, hr_date: todayISO(),
        balance_deducted: deduct, ticket_amount: ticket, settlement_amount: ticket,
        status: fin ? "awaiting_finance" : "completed", finance_status: "pending",
      });
      if (emp) {
        const newBalance = Math.max(0, balance - deduct);
        await base44.entities.Employee.update(emp.id, { leave_balance: newBalance, status: "on_leave" });
      }
    } else {
      await base44.entities.LoanRequest.update(r.id, { hr_status: "approved", hr_id: me?.id, hr_name: me?.full_name, hr_date: todayISO(), status: "awaiting_finance" });
    }
    load();
  };
  const reject = async (type, r, stage) => {
    const patch = { status: "rejected", [`${stage}_status`]: "rejected", [`${stage}_note`]: note };
    await update(type, r.id, patch);
    setActing(null); setNote(""); load();
  };
  const openFinance = (type, r) => { setActing({ type, req: r, action: "finance" }); setProofFile(null); setNote(""); };
  const confirmFinance = async () => {
    if (!acting) return;
    setBusy(true);
    let url = "";
    if (proofFile) { const { file_url } = await base44.integrations.Core.UploadFile({ file: proofFile }); url = file_url; }
    const patch = { finance_status: "paid", finance_paid_date: todayISO(), finance_proof_url: url, finance_proof_date: todayISO(), status: "completed" };
    await update(acting.type, acting.req.id, patch);
    if (acting.type === "leaves" && acting.req.ticket_amount > 0) {
      const emp = empOf(acting.req.employee_id);
      if (emp) await base44.entities.Employee.update(emp.id, { ticket_last_used_year: new Date().getFullYear() });
    }
    setBusy(false); setActing(null); setProofFile(null); load();
  };
  const update = async (type, id, patch) => {
    if (type === "leaves") await base44.entities.LeaveRequest.update(id, patch);
    else await base44.entities.LoanRequest.update(id, patch);
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
      ) : (
        <Tabs defaultValue="leaves">
          <TabsList className="mb-4">
            <TabsTrigger value="leaves">{t.tabLeaves(leaves.length)}</TabsTrigger>
            <TabsTrigger value="loans">{t.tabLoans(loans.length)}</TabsTrigger>
          </TabsList>

          <TabsContent value="leaves">
            <div className="space-y-3">
              {leaves.length === 0 ? <Empty t={t} /> : leaves.map((r) => (
                <RequestCard key={r.id} r={r} emp={empOf(r.employee_id)} actions={actionsFor("leaves", r)} onReject={() => { setActing({ type: "leaves", req: r, action: "reject" }); setNote(""); }} t={t}>
                  {r.is_full_clearance && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{t.fullClear}</span>}
                  {r.ticket_amount > 0 && <span className="text-xs text-muted-foreground">{t.ticket(r.ticket_amount)}</span>}
                  {r.balance_deducted > 0 && <span className="text-xs text-muted-foreground">{t.deduct(r.balance_deducted)}</span>}
                </RequestCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="loans">
            <div className="space-y-3">
              {loans.length === 0 ? <Empty t={t} /> : loans.map((r) => (
                <RequestCard key={r.id} r={r} emp={empOf(r.employee_id)} actions={actionsFor("loans", r)} onReject={() => { setActing({ type: "loans", req: r, action: "reject" }); setNote(""); }} t={t}>
                  <span className="text-xs text-muted-foreground">{r.installment_count} · {formatCurrency(r.monthly_installment)}</span>
                </RequestCard>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={acting?.action === "reject"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.rejectTitle}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">{t.rejectReason}</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActing(null)}>{t.cancel}</Button>
            <Button variant="destructive" onClick={() => reject(acting.type, acting.req, "manager")} className="gap-1">
              <X size={16} /> {t.confirmReject}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={acting?.action === "finance"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.payTitle}</DialogTitle></DialogHeader>
          {acting && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {acting.type === "leaves" ? t.leavePay(acting.req.ticket_amount) : t.loanPay(acting.req.amount)}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.proof}</Label>
                <Input type="file" onChange={(e) => setProofFile(e.target.files?.[0])} />
              </div>
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                {acting.type === "leaves" ? t.payNoteL : t.payNote}
              </div>
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

function RequestCard({ r, emp, actions, onReject, t, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{r.employee_name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {r.leave_type ? leaveTypeLabel(r.leave_type) : t.loan}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {r.start_date ? t.days(r.start_date, r.end_date, r.days_count) : t.loanLine(r.amount, r.reason || "")}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", badge(r.status).cls)}>{badge(r.status).label}</span>
            {children}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {actions.map((a, i) => (
            <Button key={i} size="sm" onClick={a.onClick} className={cn("h-8 text-xs gap-1", a.cls)}>{a.label}</Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Empty({ t }) {
  return (
    <div className="p-14 text-center bg-white rounded-2xl border border-border">
      <ClipboardCheck size={40} className="mx-auto text-slate-300 mb-3" />
      <p className="text-muted-foreground">{t.empty}</p>
    </div>
  );
}