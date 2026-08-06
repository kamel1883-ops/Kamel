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

export default function Approvals() {
  const [leaves, setLeaves] = useState([]);
  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [org, setOrg] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // {type, req, action}
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
    setLeaves(lv);
    setLoans(ln);
    setEmployees(emps);
    setOrg(orgs[0]);
    try { setMe(await base44.auth.me()); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const empOf = (id) => employees.find((e) => e.id === id);

  // أزرار الإجراءات حسب المرحلة
  const actionsFor = (type, r) => {
    const s = r.status;
    const btns = [];
    if (s === "pending_manager" || s === "pending") {
      btns.push({ label: "موافقة المدير", cls: "bg-emerald-600 hover:bg-emerald-700", onClick: () => managerApprove(type, r) });
      btns.push({ label: "رفض", cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => reject(type, r, "manager") });
    } else if (s === "manager_approved") {
      btns.push({ label: "موافقة الموارد البشرية", cls: "bg-violet-600 hover:bg-violet-700", onClick: () => hrApprove(type, r) });
      btns.push({ label: "رفض", cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => reject(type, r, "hr") });
    } else if (s === "awaiting_finance" || s === "hr_approved") {
      btns.push({ label: "تأكيد الصرف", cls: "bg-blue-600 hover:bg-blue-700", onClick: () => openFinance(type, r) });
    }
    return btns;
  };

  const managerApprove = async (type, r) => {
    const patch = {
      manager_status: "approved", manager_id: me?.id, manager_name: me?.full_name,
      manager_date: todayISO(), status: "manager_approved",
    };
    await update(type, r.id, patch);
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
        status: fin ? "awaiting_finance" : "completed",
        finance_status: fin ? "pending" : "pending",
      });
      if (emp) {
        const newBalance = Math.max(0, balance - deduct);
        await base44.entities.Employee.update(emp.id, { leave_balance: newBalance, status: "on_leave" });
      }
    } else {
      await base44.entities.LoanRequest.update(r.id, {
        hr_status: "approved", hr_id: me?.id, hr_name: me?.full_name, hr_date: todayISO(),
        status: "awaiting_finance",
      });
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
    if (proofFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: proofFile });
      url = file_url;
    }
    const patch = {
      finance_status: "paid", finance_paid_date: todayISO(),
      finance_proof_url: url, finance_proof_date: todayISO(),
      status: "completed",
    };
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
    <div>
      <PageHeader title="الموافقات والطلبات" subtitle="مسار الاعتماد: المدير المباشر ← الموارد البشرية ← المالية ← السداد بإثبات" />

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <Tabs defaultValue="leaves">
          <TabsList className="mb-4">
            <TabsTrigger value="leaves">الإجازات ({leaves.length})</TabsTrigger>
            <TabsTrigger value="loans">السلف ({loans.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="leaves">
            <div className="space-y-3">
              {leaves.length === 0 ? <Empty /> : leaves.map((r) => (
                <RequestCard key={r.id} r={r} emp={empOf(r.employee_id)} actions={actionsFor("leaves", r)} onReject={() => { setActing({ type: "leaves", req: r, action: "reject" }); setNote(""); }}>
                  {r.is_full_clearance && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">تصفية كاملة</span>}
                  {r.ticket_amount > 0 && <span className="text-xs text-muted-foreground">تذكرة: {formatCurrency(r.ticket_amount)}</span>}
                  {r.balance_deducted > 0 && <span className="text-xs text-muted-foreground">خصم رصيد: {r.balance_deducted} يوم</span>}
                </RequestCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="loans">
            <div className="space-y-3">
              {loans.length === 0 ? <Empty /> : loans.map((r) => (
                <RequestCard key={r.id} r={r} emp={empOf(r.employee_id)} actions={actionsFor("loans", r)} onReject={() => { setActing({ type: "loans", req: r, action: "reject" }); setNote(""); }}>
                  <span className="text-xs text-muted-foreground">{r.installment_count} قسط · {formatCurrency(r.monthly_installment)} شهرياً</span>
                </RequestCard>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* محاورة الرفض */}
      <Dialog open={acting?.action === "reject"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>رفض الطلب</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">سبب الرفض</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActing(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => reject(acting.type, acting.req, "manager")} className="gap-1">
              <X size={16} /> تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* محاورة الصرف المالي */}
      <Dialog open={acting?.action === "finance"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>تأكيد الصرف — المالية/المحاسبة</DialogTitle></DialogHeader>
          {acting && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {acting.type === "leaves" ? (
                  <>تصفية إجازة كاملة — تعويض التذكرة: <b className="text-foreground">{formatCurrency(acting.req.ticket_amount)}</b></>
                ) : (
                  <>سلفة بقيمة <b className="text-foreground">{formatCurrency(acting.req.amount)}</b></>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">إثبات التحويل (صورة)</Label>
                <Input type="file" onChange={(e) => setProofFile(e.target.files?.[0])} />
              </div>
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                عند التأكيد تُقفل العملية ويُسجّل إثبات التحويل. {acting.type === "leaves" ? "ويُحدّث آخر استخدام للتذكرة." : ""}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActing(null)}>إلغاء</Button>
                <Button onClick={confirmFinance} disabled={busy} className="gap-1 bg-blue-600 hover:bg-blue-700">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} تأكيد الصرف
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestCard({ r, emp, actions, onReject, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{r.employee_name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {r.leave_type ? leaveTypeLabel(r.leave_type) : "سلفة"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {r.start_date ? `${r.start_date} ← ${r.end_date} · ${r.days_count} يوم` : `${formatCurrency(r.amount)} · ${r.reason || ""}`}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", badge(r.status).cls)}>{badge(r.status).label}</span>
            {children}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {actions.map((a, i) => (
            <Button key={i} size="sm" onClick={a.onClick} className={cn("h-8 text-xs gap-1", a.cls)}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="p-14 text-center bg-white rounded-2xl border border-border">
      <ClipboardCheck size={40} className="mx-auto text-slate-300 mb-3" />
      <p className="text-muted-foreground">لا توجد طلبات</p>
    </div>
  );
}