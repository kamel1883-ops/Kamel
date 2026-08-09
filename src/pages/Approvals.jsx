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
import { ClipboardCheck, Check, X, Loader2, Search, Download, RefreshCw, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { leaveTypeLabel, formatCurrency, todayISO } from "@/lib/hr";
import { badge, leaveTicketAmount, needsFinance } from "@/lib/approvals";
import { useI18n } from "@/lib/i18n";
import { generateLeaveSettlement, generateLoanStatement } from "@/lib/docGenerators";

export default function Approvals() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "الموافقات والطلبات", subtitle: "مسار الاعتماد: المدير المباشر ← الموارد البشرية ← المالية ← السداد بإثبات",
    loading: "جارٍ التحميل...", tabLeaves: (n) => `الإجازات (${n})`, tabLoans: (n) => `السلف (${n})`,
    searchPh: "ابحث برقم هوية الموظف لعرض كل طلباته…",
    mgrApprove: "موافقة المدير", hrApprove: "موافقة الموارد البشرية", reject: "رفض", pay: "تأكيد الصرف",
    fullClear: "تصفية كاملة", ticket: (v) => `تذكرة: ${formatCurrency(v)}`, deduct: (n) => `خصم رصيد: ${n} يوم`,
    loan: "سلفة", days: (s, e, n) => `${s} ← ${e} · ${n} يوم`, loanLine: (v, r) => `${formatCurrency(v)} · ${r}`,
    settlement: "المخالصة", genSettlement: "توليد المخالصة",
    statement: "كشف السلفة", genStatement: "توليد الكشف",
    loanPayBtn: "سداد / إغلاق", loanPayTitle: "تسجيل سداد السلفة",
    paidLabel: "تم سداد (ريال)", paidHint: "أدخل إجمالي المبلغ المُسدَّد حتى الآن. عند بلوغ قيمة السلفة تُغلقة تلقائياً.",
    remaining: "المتبقي", totalLoan: "إجمالي السلفة", save: "حفظ",
    empty: "لا توجد طلبات", rejectTitle: "رفض الطلب", rejectReason: "سبب الرفض", cancel: "إلغاء", confirmReject: "تأكيد الرفض",
    payTitle: "تأكيد الصرف — المالية/المحاسبة", leavePay: (v) => <>تصفية إجازة كاملة — تعويض التذكرة: <b className="text-foreground">{formatCurrency(v)}</b></>,
    loanPay: (v) => <>سلفة بقيمة <b className="text-foreground">{formatCurrency(v)}</b></>, proof: "إثبات التحويل (صورة)",
    payNoteL: "عند التأكيد تُقفل العملية ويُسجّل إثبات التحويل. ويُحدّث آخر استخدام للتذكرة.",
    payNote: "عند التأكيد تُقفل العملية ويُسجّل إثبات التحويل.", confirmPay: "تأكيد الصرف",
  } : {
    title: "Approvals & Requests", subtitle: "Approval flow: Direct manager ← HR ← Finance ← Settlement with proof",
    loading: "Loading...", tabLeaves: (n) => `Leaves (${n})`, tabLoans: (n) => `Loans (${n})`,
    searchPh: "Search by employee national ID to show all requests…",
    mgrApprove: "Manager approve", hrApprove: "HR approve", reject: "Reject", pay: "Confirm payment",
    fullClear: "Full clearance", ticket: (v) => `Ticket: ${formatCurrency(v)}`, deduct: (n) => `Balance deducted: ${n} days`,
    loan: "Loan", days: (s, e, n) => `${s} ← ${e} · ${n} days`, loanLine: (v, r) => `${formatCurrency(v)} · ${r}`,
    settlement: "Settlement", genSettlement: "Generate settlement",
    statement: "Loan statement", genStatement: "Generate statement",
    loanPayBtn: "Payment / close", loanPayTitle: "Record loan payment",
    paidLabel: "Amount paid (SAR)", paidHint: "Enter total paid so far. When it reaches the loan value it closes automatically.",
    remaining: "Remaining", totalLoan: "Loan total", save: "Save",
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
  const [q, setQ] = useState("");
  const [loanPayAmount, setLoanPayAmount] = useState("");
  const [genBusy, setGenBusy] = useState(null);

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

  // فلترة بالهوية الوطنية
  const query = q.trim();
  const matchedIds = query
    ? new Set(employees.filter((e) => (e.national_id || "").replace(/\s/g, "").includes(query.replace(/\s/g, ""))).map((e) => e.id))
    : null;
  const visLeaves = matchedIds ? leaves.filter((l) => matchedIds.has(l.employee_id)) : leaves;
  const visLoans = matchedIds ? loans.filter((l) => matchedIds.has(l.employee_id)) : loans;

  const actionsFor = (type, r) => {
    const s = r.status;
    const btns = [];
    if (s === "pending_manager" || s === "pending") {
      btns.push({ label: t.mgrApprove, cls: "bg-emerald-600 hover:bg-emerald-700", onClick: () => managerApprove(type, r) });
      btns.push({ label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject(type, r, "manager") });
    } else if (s === "manager_approved") {
      btns.push({ label: t.hrApprove, cls: "bg-violet-600 hover:bg-violet-700", onClick: () => hrApprove(type, r) });
      btns.push({ label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject(type, r, "hr") });
    } else if (s === "awaiting_finance" || s === "hr_approved") {
      btns.push({ label: t.pay, cls: "bg-blue-600 hover:bg-blue-700", onClick: () => openFinance(type, r) });
    }

    if (type === "leaves") {
      if (r.settlement_pdf_url) {
        btns.push({ label: t.settlement, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.settlement_pdf_url, icon: "download" });
      } else if (s === "completed" || s === "paid") {
        btns.push({ label: t.genSettlement, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", onClick: () => makeSettlement(r), icon: "refresh", busyKey: "l" + r.id });
      }
    } else {
      const closed = (Number(r.amount) || 0) > 0 && (Number(r.paid_amount) || 0) >= (Number(r.amount) || 0);
      if (!closed) btns.push({ label: t.loanPayBtn, cls: "bg-amber-100 text-amber-700 hover:bg-amber-200", onClick: () => openLoanPay(r) });
      if (r.statement_pdf_url) {
        btns.push({ label: t.statement, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.statement_pdf_url, icon: "download" });
      } else {
        btns.push({ label: t.genStatement, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", onClick: () => makeLoanStatement(r), icon: "refresh", busyKey: "loan" + r.id });
      }
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
      const finalStatus = fin ? "awaiting_finance" : "completed";
      await base44.entities.LeaveRequest.update(r.id, {
        hr_status: "approved", hr_id: me?.id, hr_name: me?.full_name, hr_date: todayISO(),
        balance_deducted: deduct, ticket_amount: ticket, settlement_amount: ticket,
        status: finalStatus, finance_status: "pending",
      });
      if (emp) {
        await base44.entities.Employee.update(emp.id, { leave_balance: Math.max(0, balance - deduct), status: "on_leave" });
      }
      if (!fin) { try { await generateLeaveSettlement(r, empOf(r.employee_id), org, leaves); } catch (e) {} }
    } else {
      await base44.entities.LoanRequest.update(r.id, { hr_status: "approved", hr_id: me?.id, hr_name: me?.full_name, hr_date: todayISO(), status: "awaiting_finance" });
    }
    load();
  };
  const openReject = (type, r, stage) => { setActing({ type, req: r, action: "reject", stage }); setNote(""); };
  const reject = async () => {
    if (!acting) return;
    const { type, req, stage } = acting;
    const patch = { status: "rejected", [`${stage}_status`]: "rejected", [`${stage}_note`]: note };
    await update(type, req.id, patch);
    setActing(null); setNote(""); load();
  };
  const openFinance = (type, r) => { setActing({ type, req: r, action: "finance" }); setProofFile(null); setNote(""); };
  const confirmFinance = async () => {
    if (!acting) return;
    setBusy(true);
    let url = "";
    if (proofFile) { const { file_url } = await base44.integrations.Core.UploadFile({ file: proofFile }); url = file_url; }
    const patch = { finance_status: "paid", finance_paid_date: todayISO(), finance_proof_url: url, finance_proof_date: todayISO(), status: "completed" };
    if (acting.type === "loans") patch.paid_amount = Number(acting.req.amount) || 0;
    await update(acting.type, acting.req.id, patch);
    if (acting.type === "leaves" && acting.req.ticket_amount > 0) {
      const emp = empOf(acting.req.employee_id);
      if (emp) await base44.entities.Employee.update(emp.id, { ticket_last_used_year: new Date().getFullYear() });
    }
    if (acting.type === "leaves") { try { await generateLeaveSettlement(acting.req, empOf(acting.req.employee_id), org, leaves); } catch (e) {} }
    setBusy(false); setActing(null); setProofFile(null); load();
  };
  const update = async (type, id, patch) => {
    if (type === "leaves") await base44.entities.LeaveRequest.update(id, patch);
    else await base44.entities.LoanRequest.update(id, patch);
  };

  const makeSettlement = async (r) => {
    setGenBusy("l" + r.id);
    try { await generateLeaveSettlement(r, empOf(r.employee_id), org, leaves); } catch (e) {}
    finally { setGenBusy(null); load(); }
  };
  const makeLoanStatement = async (r) => {
    setGenBusy("loan" + r.id);
    try { await generateLoanStatement(r, empOf(r.employee_id), org); } catch (e) {}
    finally { setGenBusy(null); load(); }
  };
  const openLoanPay = (r) => { setActing({ type: "loans", req: r, action: "loanpay" }); setLoanPayAmount(String(r.paid_amount || 0)); };
  const confirmLoanPay = async () => {
    if (!acting) return;
    setBusy(true);
    const amt = Math.max(0, Number(loanPayAmount) || 0);
    const total = Number(acting.req.amount) || 0;
    const closed = total > 0 && amt >= total;
    await update("loans", acting.req.id, {
      paid_amount: amt,
      finance_status: closed ? "paid" : (amt > 0 ? "pending" : "pending"),
      status: closed ? "completed" : acting.req.status,
    });
    setBusy(false); setActing(null); setLoanPayAmount(""); load();
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
      ) : (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPh}
              className="pr-9 max-w-md"
            />
          </div>

          <Tabs defaultValue="leaves">
            <TabsList className="mb-4">
              <TabsTrigger value="leaves">{t.tabLeaves(visLeaves.length)}</TabsTrigger>
              <TabsTrigger value="loans">{t.tabLoans(visLoans.length)}</TabsTrigger>
            </TabsList>

            <TabsContent value="leaves">
              <div className="space-y-3">
                {visLeaves.length === 0 ? <Empty t={t} /> : visLeaves.map((r) => (
                  <RequestCard key={r.id} r={r} emp={empOf(r.employee_id)} actions={actionsFor("leaves", r)} t={t} genBusy={genBusy}>
                    {r.is_full_clearance && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{t.fullClear}</span>}
                    {r.ticket_amount > 0 && <span className="text-xs text-muted-foreground">{t.ticket(r.ticket_amount)}</span>}
                    {r.balance_deducted > 0 && <span className="text-xs text-muted-foreground">{t.deduct(r.balance_deducted)}</span>}
                  </RequestCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="loans">
              <div className="space-y-3">
                {visLoans.length === 0 ? <Empty t={t} /> : visLoans.map((r) => {
                  const paid = Number(r.paid_amount) || 0;
                  const remaining = Math.max(0, (Number(r.amount) || 0) - paid);
                  const closed = (Number(r.amount) || 0) > 0 && paid >= (Number(r.amount) || 0);
                  return (
                    <RequestCard key={r.id} r={r} emp={empOf(r.employee_id)} actions={actionsFor("loans", r)} t={t} genBusy={genBusy} extra={
                      <div className="text-xs text-muted-foreground mt-1">
                        {t.totalLoan}: <b className="text-foreground">{formatCurrency(r.amount)}</b> · {t.paidLabel.replace(" (ريال)","").replace(" (SAR)","")}: <b className="text-emerald-600">{formatCurrency(paid)}</b> · {t.remaining}: <b className="text-amber-600">{formatCurrency(remaining)}</b> {closed && <span className="px-1.5 rounded-full bg-rose-50 text-rose-600">مغلقة</span>}
                      </div>
                    }>
                      <span className="text-xs text-muted-foreground">{r.installment_count} · {formatCurrency(r.monthly_installment)}</span>
                    </RequestCard>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </>
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
            <Button variant="destructive" onClick={reject} className="gap-1">
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

      <Dialog open={acting?.action === "loanpay"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.loanPayTitle}</DialogTitle></DialogHeader>
          {acting && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <div className="text-xs text-muted-foreground">{t.totalLoan}</div>
                  <div className="font-bold">{formatCurrency(acting.req.amount)}</div>
                </div>
                <div className="rounded-lg bg-amber-50 p-2.5">
                  <div className="text-xs text-muted-foreground">{t.remaining}</div>
                  <div className="font-bold text-amber-700">{formatCurrency(Math.max(0, (Number(acting.req.amount)||0) - (Number(loanPayAmount)||0)))}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.paidLabel}</Label>
                <Input type="number" value={loanPayAmount} onChange={(e) => setLoanPayAmount(e.target.value)} />
              </div>
              <div className="text-xs text-muted-foreground bg-slate-50 border border-border rounded-lg p-2.5">{t.paidHint}</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActing(null)} disabled={busy}>{t.cancel}</Button>
                <Button onClick={confirmLoanPay} disabled={busy} className="gap-1 bg-violet-600 hover:bg-violet-700">
                  {busy && <Loader2 size={16} className="animate-spin" />} {t.save}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestCard({ r, emp, actions, onReject, t, children, genBusy, extra }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{r.employee_name}</span>
            {emp?.national_id && <span className="text-xs text-muted-foreground">· {emp.national_id}</span>}
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {r.leave_type ? leaveTypeLabel(r.leave_type) : t.loan}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {r.start_date ? t.days(r.start_date, r.end_date, r.days_count) : t.loanLine(r.amount, r.reason || "")}
          </div>
          {extra}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", badge(r.status).cls)}>{badge(r.status).label}</span>
            {children}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {actions.map((a, i) => {
            if (a.href) {
              return (
                <a key={i} href={a.href} target="_blank" rel="noreferrer"
                  className={cn("inline-flex items-center gap-1 h-8 px-3 rounded-md text-xs font-medium", a.cls)}>
                  <Download size={14} /> {a.label}
                </a>
              );
            }
            return (
              <Button key={i} size="sm" onClick={a.onClick} disabled={a.busyKey && genBusy === a.busyKey}
                className={cn("h-8 text-xs gap-1", a.cls)}>
                {a.busyKey && genBusy === a.busyKey ? <Loader2 size={14} className="animate-spin" /> : a.icon === "refresh" ? <RefreshCw size={14} /> : null}
                {a.label}
              </Button>
            );
          })}
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