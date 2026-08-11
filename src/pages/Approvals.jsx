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
import { ClipboardCheck, Check, X, Loader2, Search, Download, RefreshCw, Wallet, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { leaveTypeLabel, formatCurrency, todayISO } from "@/lib/hr";
import { badge, leaveTicketAmount, needsFinance } from "@/lib/approvals";
import { useI18n } from "@/lib/i18n";
import { generateLeaveSettlement, generateLoanStatement, generateBusinessTripApproval } from "@/lib/docGenerators";

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
    tabTrips: (n) => `الانتدابات (${n})`, hrTripApprove: "اعتماد الموارد البشرية", tripReject: "رفض",
    tripApproveTitle: "اعتماد انتداب — إدارة الموارد البشرية", tripNote: "ملاحظات/وصف الموارد البشرية",
    tripNotePh: "متى السفر والعودة، ترتيبات التذاكر/الفندق، التكلفة، …. تُسجّل على الطلب وتظهر في المستند.",
    tripDoc: "مستندات إضافية (سداد/حجوزات)", tripRejectTitle: "رفض انتداب",
    tripPayNote: "عند الاعتماد يُولّد مستند الموافقة آلياً ويُحفظ في ملف الموظف.", tripApproveBtn: "اعتماد وتوليد المستند",
    tripExt: "خارجية", tripInt: "داخلية", tripCost: (c) => `التكلفة: ${formatCurrency(c)}`, tripDocBtn: "مستند الانتداب",
    tripLine: (d, p) => d ? `${d} — ${p}` : "—",
    leaveHrTitle: "احتساب التصفية ومراجعة الإجازة", leaveHrNote: "ملاحظات الموارد البشرية",
    leaveHrNotePh: "حجز تذاكر الطيران، تأكيد التواريخ، …. تُسجّل على الطلب وتظهر في المخالصة ومسار الطلب.",
    leaveHrDoc: "مرفقات الموارد البشرية (تذاكر طيران/حجوزات)", leaveHrBtn: "احتساب وحفظ كمسودة",
    leaveHrWarn: "عند الحفظ يُحسب تعويض التذكرة/التصفية ويُولّد مستند المخالصة (PDF) للمعاينة والطباعة لأخذ الموافقة الورقية أولاً. يُحفظ الطلب كمسودة ولن يُحوّل للمالية حتى تعتمده لاحقاً من القائمة.",
    forwardBtn: "اعتماد وتحويل للمالية", printSettle: "معاينة/طباعة المخالصة",
    deductionLabel: "مستحقات دائنة (تُخصم)", deductionPh: "بيان الخصم",
    additionLabel: "مستحقات إضافية (تُضاف للموظف)", additionPh: "بيان الإضافة", settleTotal: "إجمالي التصفية المتوقع",
    finNote: "ملاحظات/وصف المالية", finNotePh: "تحويل بنكي / سند توقيع / …. يُسجّل على الطلب.",
    tripFinTitle: "صرف الانتداب — المالية/المحاسبة", tripFinWarn: "عند التأكيد تُقفل العملية ويُسجّل إثبات التحويل ويصبح الطلب مكتملًا.",
    finProof: "إثبات التحويل",
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
    tabTrips: (n) => `Trips (${n})`, hrTripApprove: "HR approve", tripReject: "Reject",
    tripApproveTitle: "Trip approval — HR", tripNote: "HR notes/description",
    tripNotePh: "Travel/return dates, ticket/hotel arrangements, cost, …. Recorded on the request and shown in the document.",
    tripDoc: "Additional documents (payment/bookings)", tripRejectTitle: "Reject trip",
    tripPayNote: "On approval the approval document is generated automatically and saved to the employee file.", tripApproveBtn: "Approve & generate doc",
    tripExt: "External", tripInt: "Internal", tripCost: (c) => `Cost: ${formatCurrency(c)}`, tripDocBtn: "Trip doc",
    tripLine: (d, p) => d ? `${d} — ${p}` : "—",
    leaveHrTitle: "Leave review & settlement preview", leaveHrNote: "HR notes",
    leaveHrNotePh: "Flight tickets booking, confirm dates, …. Recorded on the request and shown in the clearance.",
    leaveHrDoc: "HR attachments (tickets/bookings)", leaveHrBtn: "Calculate & save as draft",
    leaveHrWarn: "On save the ticket/settlement is calculated and a clearance PDF is generated for preview/print to get the paper approval first. The request is saved as draft and won't be sent to finance until you approve it later.",
    forwardBtn: "Approve & forward to finance", printSettle: "Preview/print settlement",
    deductionLabel: "Debit dues (deducted)", deductionPh: "Deduction note",
    additionLabel: "Additional dues (added)", additionPh: "Addition note", settleTotal: "Expected settlement total",
    finNote: "Finance notes/description", finNotePh: "Bank transfer / receipt / …. Recorded on the request.",
    tripFinTitle: "Trip payout — Finance/Accounting", tripFinWarn: "On confirmation the process closes, the transfer proof is recorded and the request is completed.",
    finProof: "Transfer proof",
  };

  const [leaves, setLeaves] = useState([]);
  const [loans, setLoans] = useState([]);
  const [trips, setTrips] = useState([]);
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
  const [deductionAmount, setDeductionAmount] = useState("");
  const [deductionNote, setDeductionNote] = useState("");
  const [additionAmount, setAdditionAmount] = useState("");
  const [additionNote, setAdditionNote] = useState("");

  const load = async () => {
    setLoading(true);
    const [lv, ln, tr, emps, orgs] = await Promise.all([
      base44.entities.LeaveRequest.list("-created_date", 500),
      base44.entities.LoanRequest.list("-created_date", 500),
      base44.entities.BusinessTrip.list("-created_date", 500),
      base44.entities.Employee.list("-created_date", 500),
      base44.entities.Organization.list("-created_date", 1),
    ]);
    setLeaves(lv); setLoans(ln); setTrips(tr); setEmployees(emps); setOrg(orgs[0]);
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
  const visTrips = matchedIds ? trips.filter((l) => matchedIds.has(l.employee_id)) : trips;

  const actionsFor = (type, r) => {
    const s = r.status;
    if (type === "trips") {
      const tb = [];
      if (s === "pending" || s === "draft") {
        tb.push({ label: t.hrTripApprove, cls: "bg-violet-600 hover:bg-violet-700", onClick: () => openTripApprove(r) });
        tb.push({ label: t.tripReject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openTripReject(r) });
      } else if (s === "awaiting_finance") {
        tb.push({ label: t.pay, cls: "bg-blue-600 hover:bg-blue-700", onClick: () => openTripFinance(r) });
      }
      if (r.approval_pdf_url) tb.push({ label: t.tripDocBtn, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.approval_pdf_url, icon: "download" });
      if (r.finance_proof_url) tb.push({ label: t.finProof, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.finance_proof_url, icon: "download" });
      return tb;
    }

    // السلف: تتجه مباشرة لمعتمد الموارد البشرية داخل النظام (لا مرور بالمدير المباشر)
    if (type === "loans") {
      const btns = [];
      if (s === "pending") {
        btns.push({ label: t.hrApprove, cls: "bg-violet-600 hover:bg-violet-700", onClick: () => hrApprove("loans", r) });
        btns.push({ label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject("loans", r, "hr") });
      } else if (s === "awaiting_finance" || s === "hr_approved") {
        btns.push({ label: t.pay, cls: "bg-blue-600 hover:bg-blue-700", onClick: () => openFinance("loans", r) });
      }
      const closed = (Number(r.amount) || 0) > 0 && (Number(r.paid_amount) || 0) >= (Number(r.amount) || 0);
      if (!closed) btns.push({ label: t.loanPayBtn, cls: "bg-amber-100 text-amber-700 hover:bg-amber-200", onClick: () => openLoanPay(r) });
      if (r.statement_pdf_url) {
        btns.push({ label: t.statement, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.statement_pdf_url, icon: "download" });
      } else {
        btns.push({ label: t.genStatement, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", onClick: () => makeLoanStatement(r), icon: "refresh", busyKey: "loan" + r.id });
      }
      return btns;
    }

    // الإجازات: المدير المباشر ← الموارد البشرية ← المالية
    const btns = [];
    if (s === "pending_manager" || s === "pending") {
      btns.push({ label: t.mgrApprove, cls: "bg-emerald-600 hover:bg-emerald-700", onClick: () => managerApprove(type, r) });
      btns.push({ label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject(type, r, "manager") });
    } else if (s === "manager_approved") {
      btns.push({ label: t.leaveHrBtn, cls: "bg-violet-600 hover:bg-violet-700", onClick: () => openLeaveHr(r) });
      btns.push({ label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject(type, r, "hr") });
    } else if (s === "hr_settled") {
      btns.push({ label: t.forwardBtn, cls: "bg-violet-600 hover:bg-violet-700", onClick: () => forwardToFinance(r) });
      btns.push({ label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject(type, r, "hr") });
    } else if (s === "awaiting_finance" || s === "hr_approved") {
      btns.push({ label: t.pay, cls: "bg-blue-600 hover:bg-blue-700", onClick: () => openFinance(type, r) });
    }

    if (r.settlement_pdf_url) {
      btns.push({ label: t.printSettle, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", href: r.settlement_pdf_url, icon: "download" });
    } else if (s === "completed" || s === "paid") {
      btns.push({ label: t.genSettlement, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", onClick: () => makeSettlement(r), icon: "refresh", busyKey: "l" + r.id });
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
  const openLeaveHr = (r) => { setActing({ type: "leaves", req: r, action: "leavehr" }); setNote(""); setProofFile(null); setDeductionAmount(""); setDeductionNote(""); setAdditionAmount(""); setAdditionNote(""); };
  const confirmLeaveHr = async () => {
    if (!acting) return;
    setBusy(true);
    let url = "";
    if (proofFile) { const { file_url } = await base44.integrations.Core.UploadFile({ file: proofFile }); url = file_url; }
    try {
      const r = acting.req;
      const emp = empOf(r.employee_id);
      const balance = Number(emp?.leave_balance) || 0;
      const deduct = Math.min(r.days_count, balance);
      const after = Math.max(0, balance - deduct);
      const ticket = leaveTicketAmount(emp, org);
      const ded = Math.max(0, Number(deductionAmount) || 0);
      const add = Math.max(0, Number(additionAmount) || 0);
      const total = Math.max(0, ticket + add - ded);
      const patch = {
        hr_status: "settled", hr_id: me?.id, hr_name: me?.full_name, hr_date: todayISO(),
        hr_note: note, hr_document_url: url,
        balance_before: balance, balance_after: after, balance_deducted: deduct,
        ticket_amount: ticket,
        deduction_amount: ded, deduction_note: deductionNote,
        addition_amount: add, addition_note: additionNote,
        settlement_amount: total, status: "hr_settled",
      };
      await base44.entities.LeaveRequest.update(r.id, patch);
      try { await generateLeaveSettlement({ ...r, ...patch }, emp, org, leaves); } catch (e) {}
    } catch (e) {}
    setBusy(false); setActing(null); setNote(""); setProofFile(null);
    setDeductionAmount(""); setDeductionNote(""); setAdditionAmount(""); setAdditionNote("");
    load();
  };
  const forwardToFinance = async (r) => {
    try {
      const emp = empOf(r.employee_id);
      const balance = Number(emp?.leave_balance) || 0;
      const deduct = Math.min(r.days_count, balance);
      const fin = needsFinance(r, emp, org);
      const finalStatus = fin ? "awaiting_finance" : "completed";
      await base44.entities.LeaveRequest.update(r.id, {
        hr_status: "approved", status: finalStatus, finance_status: "pending", balance_deducted: deduct,
      });
      if (emp) {
        await base44.entities.Employee.update(emp.id, { leave_balance: Math.max(0, balance - deduct), status: "on_leave" });
      }
    } catch (e) {}
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
    if (acting.type === "leaves") patch.finance_note = note;
    await update(acting.type, acting.req.id, patch);
    if (acting.type === "leaves" && acting.req.ticket_amount > 0) {
      const emp = empOf(acting.req.employee_id);
      if (emp) await base44.entities.Employee.update(emp.id, { ticket_last_used_year: new Date().getFullYear() });
    }
    if (acting.type === "leaves") { try { await generateLeaveSettlement(acting.req, empOf(acting.req.employee_id), org, leaves); } catch (e) {} }
    setBusy(false); setActing(null); setNote(""); setProofFile(null); load();
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
  const openTripApprove = (r) => { setActing({ type: "trips", req: r, action: "tripapprove" }); setNote(""); setProofFile(null); };
  const openTripReject = (r) => { setActing({ type: "trips", req: r, action: "tripreject" }); setNote(""); };
  const confirmTripApprove = async () => {
    if (!acting) return;
    setBusy(true);
    let url = "";
    if (proofFile) { const { file_url } = await base44.integrations.Core.UploadFile({ file: proofFile }); url = file_url; }
    try {
      const r = acting.req;
      const emp = empOf(r.employee_id);
      const patch = {
        status: "awaiting_finance", finance_status: "pending",
        approver_id: me?.id, approver_name: me?.full_name, approved_date: todayISO(),
        hr_note: note, hr_document_url: url,
      };
      await base44.entities.BusinessTrip.update(r.id, patch);
      try { await generateBusinessTripApproval({ ...r, ...patch }, emp, org); } catch (e) {}
    } catch (e) {}
    setBusy(false); setActing(null); setNote(""); setProofFile(null); load();
  };
  const confirmTripReject = async () => {
    if (!acting) return;
    setBusy(true);
    try {
      await base44.entities.BusinessTrip.update(acting.req.id, { status: "rejected", hr_note: note });
    } catch (e) {}
    setBusy(false); setActing(null); setNote(""); load();
  };
  const openTripFinance = (r) => { setActing({ type: "trips", req: r, action: "tripfinance" }); setNote(""); setProofFile(null); };
  const confirmTripFinance = async () => {
    if (!acting) return;
    setBusy(true);
    let url = "";
    if (proofFile) { const { file_url } = await base44.integrations.Core.UploadFile({ file: proofFile }); url = file_url; }
    try {
      await base44.entities.BusinessTrip.update(acting.req.id, {
        status: "completed", finance_status: "paid", finance_note: note,
        finance_paid_date: todayISO(), finance_proof_url: url, finance_proof_date: todayISO(),
      });
    } catch (e) {}
    setBusy(false); setActing(null); setNote(""); setProofFile(null); load();
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
              <TabsTrigger value="trips">{t.tabTrips(visTrips.length)}</TabsTrigger>
            </TabsList>

            <TabsContent value="leaves">
              <div className="space-y-3">
                {visLeaves.length === 0 ? <Empty t={t} /> : visLeaves.map((r) => (
                  <RequestCard key={r.id} r={r} emp={empOf(r.employee_id)} actions={actionsFor("leaves", r)} t={t} genBusy={genBusy}>
                    {r.is_full_clearance && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{t.fullClear}</span>}
                    {r.ticket_amount > 0 && <span className="text-xs text-muted-foreground">{t.ticket(r.ticket_amount)}</span>}
                    {r.balance_deducted > 0 && <span className="text-xs text-muted-foreground">{t.deduct(r.balance_deducted)}</span>}
                    {r.hr_document_url && <a href={r.hr_document_url} target="_blank" rel="noreferrer" className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">تذاكر الموارد البشرية</a>}
                    {r.finance_proof_url && <a href={r.finance_proof_url} target="_blank" rel="noreferrer" className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">إثبات المالية</a>}
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

            <TabsContent value="trips">
              <div className="space-y-3">
                {visTrips.length === 0 ? <Empty t={t} /> : visTrips.map((r) => {
                  const emp = empOf(r.employee_id);
                  const rc = { ...r, employee_name: emp?.full_name || r.employee_name };
                  return (
                    <RequestCard key={r.id} r={rc} emp={emp} actions={actionsFor("trips", r)} t={t} genBusy={genBusy}
                      kindBadge={<span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 flex items-center gap-1"><Plane size={11} /> {r.trip_type === "external" ? t.tripExt : t.tripInt}</span>}
                      extra={<div className="text-xs text-muted-foreground mt-1">{t.tripLine(r.destination, r.purpose)} · {t.days(r.start_date, r.end_date, r.days_count)}</div>}>
                      {r.total_cost > 0 && <span className="text-xs text-muted-foreground">{t.tripCost(r.total_cost)}</span>}
                      {r.employee_document_url && <a href={r.employee_document_url} target="_blank" rel="noreferrer" className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">مرفق الموظف</a>}
                      {r.hr_document_url && <a href={r.hr_document_url} target="_blank" rel="noreferrer" className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">مرفق المالية</a>}
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
                <Label className="text-xs font-medium text-muted-foreground">{t.finNote}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={t.finNotePh} />
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

      <Dialog open={acting?.action === "leavehr"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.leaveHrTitle}</DialogTitle></DialogHeader>
          {acting && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">{leaveTypeLabel(acting.req.leave_type)} · {t.days(acting.req.start_date, acting.req.end_date, acting.req.days_count)}</div>
              {acting.req.medical_report_url && <a href={acting.req.medical_report_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-600">تقرير طبي مرفق</a>}
              {(() => {
                const emp = empOf(acting.req.employee_id);
                const ticket = leaveTicketAmount(emp, org);
                const balance = Number(emp?.leave_balance) || 0;
                const deduct = Math.min(acting.req.days_count, balance);
                return (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-lg bg-slate-50 p-2.5"><div className="text-xs text-muted-foreground">{isAr ? "رصيد الإجازات" : "Balance"}</div><div className="font-bold">{balance}</div></div>
                    <div className="rounded-lg bg-violet-50 p-2.5"><div className="text-xs text-muted-foreground">{isAr ? "المخصوم" : "Deducted"}</div><div className="font-bold">{deduct}</div></div>
                    <div className="rounded-lg bg-blue-50 p-2.5"><div className="text-xs text-muted-foreground">{isAr ? "تعويض التذكرة" : "Ticket"}</div><div className="font-bold">{formatCurrency(ticket)}</div></div>
                  </div>
                );
              })()}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{t.deductionLabel}</Label>
                  <Input type="number" dir="ltr" value={deductionAmount} placeholder="0" onChange={(e) => setDeductionAmount(e.target.value)} />
                  <Input value={deductionNote} placeholder={t.deductionPh} onChange={(e) => setDeductionNote(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{t.additionLabel}</Label>
                  <Input type="number" dir="ltr" value={additionAmount} placeholder="0" onChange={(e) => setAdditionAmount(e.target.value)} />
                  <Input value={additionNote} placeholder={t.additionPh} onChange={(e) => setAdditionNote(e.target.value)} className="text-xs" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{t.settleTotal}: <b className="text-foreground">{formatCurrency(Math.max(0, (leaveTicketAmount(empOf(acting.req.employee_id), org) || 0) + (Number(additionAmount) || 0) - (Number(deductionAmount) || 0)))}</b></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.leaveHrNote}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder={t.leaveHrNotePh} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.leaveHrDoc}</Label>
                <Input type="file" onChange={(e) => setProofFile(e.target.files?.[0])} />
              </div>
              <div className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg p-3">{t.leaveHrWarn}</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActing(null)} disabled={busy}>{t.cancel}</Button>
                <Button onClick={confirmLeaveHr} disabled={busy} className="gap-1 bg-violet-600 hover:bg-violet-700">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {t.leaveHrBtn}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={acting?.action === "tripapprove"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.tripApproveTitle}</DialogTitle></DialogHeader>
          {acting && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {acting.req.trip_type === "external" ? t.tripExt : t.tripInt} — {acting.req.destination} · {t.days(acting.req.start_date, acting.req.end_date, acting.req.days_count)}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.tripNote}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder={t.tripNotePh} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.tripDoc}</Label>
                <Input type="file" onChange={(e) => setProofFile(e.target.files?.[0])} />
              </div>
              <div className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg p-3">{t.tripPayNote}</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActing(null)} disabled={busy}>{t.cancel}</Button>
                <Button onClick={confirmTripApprove} disabled={busy} className="gap-1 bg-violet-600 hover:bg-violet-700">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {t.tripApproveBtn}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={acting?.action === "tripreject"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.tripRejectTitle}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">{t.rejectReason}</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActing(null)} disabled={busy}>{t.cancel}</Button>
            <Button variant="destructive" onClick={confirmTripReject} disabled={busy} className="gap-1">
              {busy && <Loader2 size={16} className="animate-spin" />} <X size={16} /> {t.confirmReject}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={acting?.action === "tripfinance"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.tripFinTitle}</DialogTitle></DialogHeader>
          {acting && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {acting.req.destination} · {t.days(acting.req.start_date, acting.req.end_date, acting.req.days_count)}
                {acting.req.total_cost > 0 && <> · {t.tripCost(acting.req.total_cost)}</>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.finNote}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={t.finNotePh} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.proof}</Label>
                <Input type="file" onChange={(e) => setProofFile(e.target.files?.[0])} />
              </div>
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{t.tripFinWarn}</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActing(null)} disabled={busy}>{t.cancel}</Button>
                <Button onClick={confirmTripFinance} disabled={busy} className="gap-1 bg-blue-600 hover:bg-blue-700">
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

function RequestCard({ r, emp, actions, onReject, t, children, genBusy, extra, kindBadge }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{r.employee_name}</span>
            {emp?.national_id && <span className="text-xs text-muted-foreground">· {emp.national_id}</span>}
            {kindBadge || (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {r.leave_type ? leaveTypeLabel(r.leave_type) : t.loan}
              </span>
            )}
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