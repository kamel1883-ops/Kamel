import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import LeaveRequestForm from "@/components/LeaveRequestForm";
import LoanRequestForm from "@/components/LoanRequestForm";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Wallet, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { leaveTypeLabel } from "@/lib/hr";
import { badge } from "@/lib/approvals";

export default function MyRequests() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      const emps = await base44.entities.Employee.list("-created_date", 500);
      const emp = emps.find((e) => e.user_id === me?.id);
      setEmployee(emp || null);
      if (emp) {
        const [lv, ln] = await Promise.all([
          base44.entities.LeaveRequest.filter({ employee_id: emp.id }, "-created_date", 200),
          base44.entities.LoanRequest.filter({ employee_id: emp.id }, "-created_date", 200),
        ]);
        setLeaves(lv);
        setLoans(ln);
      }
    } catch {
      setEmployee(null);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>;

  if (!employee) {
    return (
      <div>
        <PageHeader title="طلباتي" subtitle="بوابة الموظف الذاتية" />
        <div className="p-14 text-center bg-white rounded-2xl border border-border">
          <UserX size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-muted-foreground">لم يتم ربط حسابك بسجل موظف بعد. تواصل مع قسم الموارد البشرية لربط حسابك.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="طلباتي"
        subtitle={`${employee.employee_number} - ${employee.position}`}
        action={
          <div className="flex gap-2">
            <Button onClick={() => setLeaveOpen(true)} variant="outline" className="gap-2"><CalendarPlus size={18} /> طلب إجازة</Button>
            <Button onClick={() => setLoanOpen(true)} className="gap-2"><Wallet size={18} /> طلب سلفة</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="رصيد الإجازات" value={`${employee.leave_balance || 0} يوم`} />
        <Stat label="استحقاق التذكرة" value={employee.ticket_entitlement === "yearly" ? "سنوي" : employee.ticket_entitlement === "biennial" ? "كل سنتين" : "لا يستحق"} />
        <Stat label="طالباتي (إجازات)" value={leaves.length} />
        <Stat label="طلباتي (سلف)" value={loans.length} />
      </div>

      <Section title="طلبات الإجازات">
        {leaves.length === 0 ? <Empty text="لا توجد طلبات إجازات" /> : leaves.map((r) => (
          <Row key={r.id}>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{leaveTypeLabel(r.leave_type)}</span>
                {r.is_full_clearance && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">تصفية كاملة</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{r.start_date} ← {r.end_date} · {r.days_count} يوم</div>
            </div>
            <span className={cn("text-xs px-3 py-1.5 rounded-full font-medium", badge(r.status).cls)}>{badge(r.status).label}</span>
          </Row>
        ))}
      </Section>

      <Section title="طلبات السلف">
        {loans.length === 0 ? <Empty text="لا توجد طلبات سلف" /> : loans.map((r) => (
          <Row key={r.id}>
            <div>
              <div className="font-medium text-sm">{Number(r.amount).toLocaleString()} ر.س</div>
              <div className="text-xs text-muted-foreground mt-1">{r.installment_count} قسط · {r.monthly_installment} ر.س شهرياً</div>
            </div>
            <span className={cn("text-xs px-3 py-1.5 rounded-full font-medium", badge(r.status).cls)}>{badge(r.status).label}</span>
          </Row>
        ))}
      </Section>

      <LeaveRequestForm open={leaveOpen} onClose={() => setLeaveOpen(false)} onSaved={load} employees={[employee]} currentUserEmployee={employee} />
      <LoanRequestForm open={loanOpen} onClose={() => setLoanOpen(false)} onSaved={load} employee={employee} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}
function Row({ children }) {
  return <div className="p-4 flex items-center justify-between gap-3">{children}</div>;
}
function Empty({ text }) {
  return <div className="p-8 text-center text-muted-foreground text-sm">{text}</div>;
}