import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import LeaveRequestForm from "@/components/LeaveRequestForm";
import LoanRequestForm from "@/components/LoanRequestForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarPlus, Wallet, Link2, Loader2, BadgeCheck, Clock, Banknote, CalendarCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { leaveTypeLabel, formatCurrency, attendanceStatusLabel } from "@/lib/hr";
import { badge } from "@/lib/approvals";

export default function MyRequests() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [org, setOrg] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loans, setLoans] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);

  // ربط الحساب
  const [nationalId, setNationalId] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState({ type: "", text: "" });

  const load = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      const [emps, orgs] = await Promise.all([
        base44.entities.Employee.list("-created_date", 500),
        base44.entities.Organization.list("-created_date", 1),
      ]);
      const emp = emps.find((e) => e.user_id === me?.id);
      setEmployee(emp || null);
      setOrg(orgs[0] || null);
      if (emp) {
        const [lv, ln, att] = await Promise.all([
          base44.entities.LeaveRequest.filter({ employee_id: emp.id }, "-created_date", 200),
          base44.entities.LoanRequest.filter({ employee_id: emp.id }, "-created_date", 200),
          base44.entities.Attendance.filter({ employee_id: emp.id }, "-date", 10),
        ]);
        setLeaves(lv); setLoans(ln); setAttendance(att);
      }
    } catch {
      setEmployee(null);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const linkAccount = async (e) => {
    e.preventDefault();
    const id = nationalId.trim();
    if (!id) return;
    setLinking(true);
    setLinkMsg({ type: "", text: "" });
    try {
      const res = await base44.functions.invoke("linkEmployee", { national_id: id });
      const data = res?.data || res;
      if (data?.ok) {
        setLinkMsg({ type: "ok", text: "تم ربط حسابك بسجلك كموظف بنجاح." });
        setNationalId("");
        await load();
      } else {
        setLinkMsg({ type: "err", text: data?.error || "تعذر الربط" });
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "تعذر الربط";
      setLinkMsg({ type: "err", text: msg });
    } finally {
      setLinking(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>;

  if (!employee) {
    return (
      <div>
        <PageHeader title="بوابة الموظف الذاتية" subtitle="اربط حسابك بسجلك كموظف للوصول إلى طلباتك ومعلوماتك" />
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-border p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
              <Link2 size={22} className="text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold">ربط الحساب بالسجل الوظيفي</h3>
              <p className="text-xs text-muted-foreground">متاح فقط للموظفين المسجلين مسبقاً لدى المنشأة.</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-4 bg-slate-50 rounded-lg p-3 leading-relaxed">
            سجلك كموظف موجود مسبقاً لدى الموارد البشرية. أدخل رقم هويتك الوطنية أو رقم إقامتك للربط بحسابك
            (<b className="text-foreground">{user?.email}</b>). لا يمكن التسجيل إلا إذا تطابق الرقم مع سجل موظف فعلي.
          </div>
          <form onSubmit={linkAccount} className="space-y-4">
            <div className="space-y-1.5">
              <Label>رقم الهوية الوطنية / الإقامة</Label>
              <Input
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="مثال: 1234567890"
                required
                disabled={linking}
              />
            </div>
            {linkMsg.text && (
              <div className={cn("text-sm rounded-lg p-3", linkMsg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                {linkMsg.text}
              </div>
            )}
            <Button type="submit" disabled={linking} className="gap-2">
              {linking && <Loader2 size={16} className="animate-spin" />}
              ربط الحساب
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // لوحة الموظف
  const hireDate = employee.hire_date ? new Date(employee.hire_date) : null;
  const serviceYears = hireDate ? Math.floor((Date.now() - hireDate.getTime()) / (365.25 * 24 * 3600 * 1000)) : 0;
  const gross =
    (employee.base_salary || 0) +
    (employee.housing_allowance || 0) +
    (employee.transport_allowance || 0) +
    (employee.other_allowances || 0);
  const entitled = org?.annual_leave_days || 21;
  const remaining = employee.leave_balance || 0;
  const used = Math.max(0, entitled - remaining);

  return (
    <div>
      <PageHeader
        title="بوابة الموظف الذاتية"
        subtitle={`${employee.employee_number} — ${employee.position} — ${employee.department || ""}`}
        action={
          <div className="flex gap-2">
            <Button onClick={() => setLeaveOpen(true)} variant="outline" className="gap-2"><CalendarPlus size={18} /> طلب إجازة</Button>
            <Button onClick={() => setLoanOpen(true)} className="gap-2"><Wallet size={18} /> طلب سلفة</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InfoCard icon={Clock} label="سنوات الخدمة" value={`${serviceYears} سنة`} sub={employee.hire_date ? `من ${employee.hire_date}` : ""} />
        <InfoCard icon={CalendarCheck} label="رصيد الإجازات" value={`${remaining} يوم`} sub={`مستحق: ${entitled} · مستخدم: ${used}`} />
        <InfoCard icon={Banknote} label="الراتب الإجمالي" value={formatCurrency(gross)} sub={`أساسي ${formatCurrency(employee.base_salary || 0)}`} />
        <InfoCard icon={BadgeCheck} label="استحقاق التذكرة" value={employee.ticket_entitlement === "yearly" ? "سنوي" : employee.ticket_entitlement === "biennial" ? "كل سنتين" : "لا يستحق"} sub={employee.is_saudi ? "سعودي" : "مقيم"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SideCard title="تفاصيل الخدمة والراتب">
          <DLine label="المسمى الوظيفي" value={employee.position} />
          <DLine label="الإدارة" value={employee.department} />
          <DLine label="تاريخ التعيين" value={employee.hire_date} />
          <DLine label="مدة الخدمة" value={`${serviceYears} سنة`} />
          <DLine label="نوع العقد" value={employee.contract_type === "full_time" ? "دوام كامل" : employee.contract_type === "part_time" ? "جزئي" : "عقد"} />
          <DLine label="الراتب الأساسي" value={formatCurrency(employee.base_salary || 0)} />
          <DLine label="بدل السكن" value={formatCurrency(employee.housing_allowance || 0)} />
          <DLine label="بدل المواصلات" value={formatCurrency(employee.transport_allowance || 0)} />
          <DLine label="بدلات أخرى" value={formatCurrency(employee.other_allowances || 0)} />
          <DLine label="الإجمالي" value={formatCurrency(gross)} strong />
        </SideCard>

        <div className="lg:col-span-2">
          <SideCard title="سجل الحضور والانصراف (آخر 10)">
            {attendance.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">لا توجد سجلات حضور.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-right font-medium pb-2">التاريخ</th>
                      <th className="text-right font-medium pb-2">الحضور</th>
                      <th className="text-right font-medium pb-2">الانصراف</th>
                      <th className="text-right font-medium pb-2">الساعات</th>
                      <th className="text-right font-medium pb-2">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a) => {
                      const st = attendanceStatusLabel(a.status);
                      return (
                        <tr key={a.id} className="border-t border-border">
                          <td className="py-2">{a.date}</td>
                          <td className="py-2">{a.check_in || "—"}</td>
                          <td className="py-2">{a.check_out || "—"}</td>
                          <td className="py-2">{a.work_hours || "—"}</td>
                          <td className="py-2"><span className={cn("text-xs px-2 py-0.5 rounded-full", st.cls)}>{st.label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SideCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="طلبات الإجازات">
          {leaves.length === 0 ? <Empty text="لا توجد طلبات إجازات" /> : leaves.map((r) => (
            <Row key={r.id}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{leaveTypeLabel(r.leave_type)}</span>
                  {r.is_full_clearance && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">تصفية كاملة</span>}
                  {r.medical_report_url && (
                    <a href={r.medical_report_url} target="_blank" rel="noreferrer" className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">تقرير طبي</a>
                  )}
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
      </div>

      <LeaveRequestForm open={leaveOpen} onClose={() => setLeaveOpen(false)} onSaved={load} employees={[employee]} currentUserEmployee={employee} />
      <LoanRequestForm open={loanOpen} onClose={() => setLoanOpen(false)} onSaved={load} employee={employee} />
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-violet-600" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold truncate">{value}</div>
        {sub && <div className="text-xs text-muted-foreground truncate">{sub}</div>}
      </div>
    </div>
  );
}
function SideCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
function DLine({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(strong && "font-bold")}>{value || "—"}</span>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div>
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