import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import LeaveRequestForm from "@/components/LeaveRequestForm";
import LoanRequestForm from "@/components/LoanRequestForm";
import BusinessTripForm from "@/components/BusinessTripForm";
import EmployeeClock from "@/components/EmployeeClock";
import EmployeeWarnings from "@/components/EmployeeWarnings";
import ApprovalsPortal from "@/pages/ApprovalsPortal";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { Image } from "@/components/ui/image";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarPlus, Wallet, Loader2, BadgeCheck, Clock, Banknote, CalendarCheck, Plane, LogOut, Crown, ArrowRight, ShieldCheck, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { leaveTypeLabel, formatCurrency, attendanceStatusLabel } from "@/lib/hr";
import { badge } from "@/lib/approvals";
import { computeEntitlement, sumUsedDays } from "@/lib/leaveBalance";
import { portalSession } from "@/lib/portalSession";

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const nowHM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function MyRequests() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const tripStatus = isAr ? {
    draft: { label: "مسودة", cls: "bg-slate-100 text-slate-600" },
    pending: { label: "قيد الاعتماد", cls: "bg-amber-50 text-amber-600" },
    approved: { label: "معتمدة", cls: "bg-blue-50 text-blue-600" },
    in_progress: { label: "قيد التنفيذ", cls: "bg-indigo-50 text-indigo-600" },
    completed: { label: "مكتملة", cls: "bg-emerald-50 text-emerald-600" },
    cancelled: { label: "ملغاة", cls: "bg-rose-50 text-rose-600" },
  } : {
    draft: { label: "Draft", cls: "bg-slate-100 text-slate-600" },
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-600" },
    approved: { label: "Approved", cls: "bg-blue-50 text-blue-600" },
    in_progress: { label: "In progress", cls: "bg-indigo-50 text-indigo-600" },
    completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-600" },
    cancelled: { label: "Cancelled", cls: "bg-rose-50 text-rose-600" },
  };
  const t = isAr ? {
    dir: "rtl", brandSub: "بوابة الموظف الذاتية", brandOnly: "خاص بالموظف", logout: "خروج",
    loading: "جارٍ التحميل...",
    gTitle: "تسجيل الدخول للبوابة", gSubtitle: "بوابة الموظف الذاتية — خاص بالموظفين المسجّلين والمنتمين لمنشأة",
    gDesc: "أدخل رقم هويتك الوطنية أو رقم إقامتك مع تاريخ ميلادك للتحقق. متاح فقط للموظفين المسجّلين لدى المنشآت.",
    gIdLabel: "رقم الهوية الوطنية / الإقامة", gIdPh: "مثال: 1234567890",
    gBirthLabel: "تاريخ الميلاد", gBtn: "تسجيل الدخول",
    gFail: "البيانات غير مطابقة لسجل موظف مسجّل في المنشأة.",
    gInactive: "حالتك الوظيفية لا تسمح بالدخول للبوابة.",
    gNote: "لا يمكن إنشاء حساب جديد من هنا؛ يتم إضافة الموظفين من الموارد البشرية فقط.",
    orgLabel: "المنشأة",
    delegatedManager: "معتمد إجازات (مدير مباشر)",
    delegatedFinance: "معتمد مالي (صرف)",
    title: "بوابة الموظف الذاتية", subtitle: "",
    leaveBtn: "طلب إجازة", loanBtn: "طلب سلفة", tripBtn: "طلب رحلة/انتداب",
    yearsLabel: "سنوات الخدمة", yearsVal: (n) => `${n} سنة`, yearsSub: (d) => `من ${d}`,
    leaveLabel: "رصيد الإجازات", leaveVal: (n) => `${n} يوم`, leaveSub: (e, u) => `مستحق: ${e} · مستخدم: ${u}`,
    grossLabel: "الراتب الإجمالي", grossSub: (b) => `أساسي ${formatCurrency(b)}`,
    ticketLabel: "استحقاق التذكرة", ticketYearly: "سنوي", ticketBiennial: "كل سنتين", ticketNone: "لا يستحق", ticketSaudi: "سعودي", ticketExpat: "مقيم",
    detailTitle: "تفاصيل الخدمة والراتب",
    dPosition: "المسمى الوظيفي", dDept: "الإدارة", dHire: "تاريخ التعيين", dService: "مدة الخدمة",
    dContract: "نوع العقد", contractFT: "دوام كامل", contractPT: "جزئي", contractC: "عقد",
    dBase: "الراتب الأساسي", dHousing: "بدل السكن", dTransport: "بدل المواصلات", dOther: "بدلات أخرى", dTotal: "الإجمالي",
    attTitle: "سجل الحضور والانصراف (آخر 10)", attEmpty: "لا توجد سجلات حضور.",
    thDate: "التاريخ", thIn: "الحضور", thOut: "الانصراف", thHours: "الساعات", thStatus: "الحالة",
    leavesTitle: "طلبات الإجازات", loansTitle: "طلبات السلف", tripsTitle: "رحلات العمل والانتداب",
    noLeaves: "لا توجد طلبات إجازات", noLoans: "لا توجد طلبات سلف", noTrips: "لا توجد طلبات رحلات",
    fullClear: "تصفية كاملة", medReport: "تقرير طبي",
    days: (n) => `${n} يوم`, loanMonthly: (m) => `${m} ر.س شهرياً`, loanInst: (n) => `${n} قسط`,
    tripExternal: "خارجية", tripInternal: "داخلية", sar: "ر.س",
    selfTab: "خدماتي", approvalsTab: "الاعتمادات",
  } : {
    dir: "ltr", brandSub: "Employee Self‑Service Portal", brandOnly: "Employees only", logout: "Sign out",
    loading: "Loading...",
    gTitle: "Portal sign‑in", gSubtitle: "Employee Self‑Service Portal — for registered employees only",
    gDesc: "Enter your national ID / Iqama number and your birth date to sign in. Available only to employees registered with an organization.",
    gIdLabel: "National ID / Iqama number", gIdPh: "e.g. 1234567890",
    gBirthLabel: "Date of birth", gBtn: "Sign in",
    gFail: "These credentials do not match any registered employee.",
    gInactive: "Your employment status does not allow portal access.",
    gNote: "New accounts can't be created here; employees are added by HR only.",
    orgLabel: "Organization",
    delegatedManager: "Leave approver (direct manager)",
    delegatedFinance: "Finance approver (payment)",
    title: "Employee Self‑Service Portal", subtitle: "",
    leaveBtn: "Leave request", loanBtn: "Loan request", tripBtn: "Business trip",
    yearsLabel: "Years of service", yearsVal: (n) => `${n} yr`, yearsSub: (d) => `since ${d}`,
    leaveLabel: "Leave balance", leaveVal: (n) => `${n} days`, leaveSub: (e, u) => `Entitled: ${e} · Used: ${u}`,
    grossLabel: "Gross salary", grossSub: (b) => `Base ${formatCurrency(b)}`,
    ticketLabel: "Ticket entitlement", ticketYearly: "Yearly", ticketBiennial: "Biennial", ticketNone: "None", ticketSaudi: "Saudi", ticketExpat: "Expat",
    detailTitle: "Service & Salary Details",
    dPosition: "Job title", dDept: "Department", dHire: "Hire date", dService: "Length of service",
    dContract: "Contract type", contractFT: "Full time", contractPT: "Part time", contractC: "Contract",
    dBase: "Base salary", dHousing: "Housing allowance", dTransport: "Transport allowance", dOther: "Other allowances", dTotal: "Total",
    attTitle: "Attendance log (last 10)", attEmpty: "No attendance records.",
    thDate: "Date", thIn: "Check in", thOut: "Check out", thHours: "Hours", thStatus: "Status",
    leavesTitle: "Leave requests", loansTitle: "Loan requests", tripsTitle: "Business Trips & Deputation",
    noLeaves: "No leave requests", noLoans: "No loan requests", noTrips: "No trip requests",
    fullClear: "Full clearance", medReport: "Medical report",
    days: (n) => `${n} days`, loanMonthly: (m) => `${formatCurrency(m)} / month`, loanInst: (n) => `${n} installments`,
    tripExternal: "External", tripInternal: "Internal", sar: "SAR",
    selfTab: "My Services", approvalsTab: "Approvals",
  };

  const [session, setSession] = useState(() => portalSession.load());
  const [employee, setEmployee] = useState(null);
  const [org, setOrg] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loans, setLoans] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [trips, setTrips] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [todayAtt, setTodayAtt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const [view, setView] = useState("self");

  // نموذج الدخول
  const [nid, setNid] = useState("");
  const [birth, setBirth] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [signInMsg, setSignInMsg] = useState({ type: "", text: "" });

  const load = useCallback(async (sess = session) => {
    if (!sess) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("portalData", {
        token: sess.token, employee_id: sess.employee_id, action: "fetch",
      });
      const data = res?.data || res;
      if (!data?.ok) {
        if (data?.error === "invalid_session") { handlePortalLogout(); return; }
        setSignInMsg({ type: "err", text: data?.error || t.loading });
        setLoading(false); return;
      }
      setEmployee(data.employee); setOrg(data.org);
      setLeaves(data.leaves || []); setLoans(data.loans || []);
      setAttendance(data.attendance || []); setTrips(data.trips || []);
      setWarnings(data.warnings || []);
      setTodayAtt(data.attendance?.find((a) => a.date === localToday()) || null);
    } catch (e) {
      setSignInMsg({ type: "err", text: e?.message || t.loading });
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { if (session) load(session); }, [session]);

  const handlePortalLogin = async (e) => {
    e.preventDefault();
    const id = nid.trim(), bd = birth.trim();
    if (!id || !bd) return;
    setSigningIn(true); setSignInMsg({ type: "", text: "" });
    try {
      const res = await base44.functions.invoke("verifyEmployeePortal", {
        national_id: id, birth_date: bd,
      });
      const data = res?.data || res;
      if (data?.ok) {
        const newSession = {
          token: data.token,
          employee_id: data.employee.id,
          employee: data.employee,
          org: data.org,
          expires_at: data.expires_at,
        };
        portalSession.save(newSession);
        setSession(newSession);
        setNid(""); setBirth("");
      } else {
        setSignInMsg({
          type: "err",
          text: data?.error === "inactive" ? t.gInactive : t.gFail,
        });
      }
    } catch (err) {
      setSignInMsg({ type: "err", text: err?.response?.data?.error || err?.message || t.gFail });
    } finally {
      setSigningIn(false);
    }
  };

  const handlePortalLogout = () => {
    portalSession.clear();
    setSession(null);
    setEmployee(null); setOrg(null);
    setLeaves([]); setLoans([]); setAttendance([]); setTrips([]); setWarnings([]);
    setView("self");
  };

  const portalArgs = session
    ? { token: session.token, employee_id: session.employee_id }
    : {};

  const portalCreateLeave = async (payload) => {
    const res = await base44.functions.invoke("portalData", {
      ...portalArgs, action: "create_leave", payload,
    });
    const data = res?.data || res;
    if (!data?.ok) throw new Error(data?.error || "fail");
    return data.leave;
  };
  const portalCreateLoan = async (payload) => {
    const res = await base44.functions.invoke("portalData", {
      ...portalArgs, action: "create_loan", payload,
    });
    const data = res?.data || res;
    if (!data?.ok) throw new Error(data?.error || "fail");
    return data.loan;
  };
  const portalCreateTrip = async (payload) => {
    const res = await base44.functions.invoke("portalData", {
      ...portalArgs, action: "create_trip", payload,
    });
    const data = res?.data || res;
    if (!data?.ok) throw new Error(data?.error || "fail");
    return data.trip;
  };

  const clockApi = {
    today: async () => {
      const res = await base44.functions.invoke("portalData", { ...portalArgs, action: "today_attendance" });
      return res?.data?.today || null;
    },
    clockIn: async () => {
      const res = await base44.functions.invoke("portalData", {
        ...portalArgs, action: "clock_in", check_in: nowHM(),
      });
      const data = res?.data || res;
      if (!data?.ok) throw new Error(data?.error || "fail");
      setTodayAtt(data.today);
    },
    clockOut: async (workHours) => {
      const res = await base44.functions.invoke("portalData", {
        ...portalArgs, action: "clock_out", check_out: nowHM(), work_hours: workHours,
      });
      const data = res?.data || res;
      if (!data?.ok) throw new Error(data?.error || "fail");
      setTodayAtt(data.today);
    },
  };

  let content;
  if (!session) {
    content = (
      <div>
        <PageHeader title={t.title} subtitle={t.gSubtitle} />
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-border p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
              <ShieldCheck size={22} className="text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold">{t.gTitle}</h3>
              <p className="text-xs text-muted-foreground">{t.gDesc}</p>
            </div>
          </div>
          <form onSubmit={handlePortalLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.gIdLabel}</Label>
              <Input value={nid} onChange={(e) => setNid(e.target.value)} placeholder={t.gIdPh} required disabled={signingIn} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>{t.gBirthLabel}</Label>
              <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} required disabled={signingIn} dir="ltr" />
            </div>
            {signInMsg.text && (
              <div className={cn("text-sm rounded-lg p-3 leading-relaxed", signInMsg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                {signInMsg.text}
              </div>
            )}
            <Button type="submit" disabled={signingIn} className="gap-2">
              {signingIn && <Loader2 size={16} className="animate-spin" />}
              {t.gBtn}
            </Button>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.gNote}</p>
          </form>
        </div>
      </div>
    );
  } else if (loading || !employee) {
    content = <div className="p-10 text-center text-muted-foreground">{t.loading}</div>;
  } else {
    const hireDate = employee.hire_date ? new Date(employee.hire_date) : null;
    const serviceYears = hireDate ? Math.floor((Date.now() - hireDate.getTime()) / (365.25 * 24 * 3600 * 1000)) : 0;
    const gross =
      (employee.base_salary || 0) + (employee.housing_allowance || 0) +
      (employee.transport_allowance || 0) + (employee.other_allowances || 0);
    const annualDays = org?.annual_leave_days || 21;
    const entitled = computeEntitlement(employee.hire_date, annualDays);
    const used = sumUsedDays(leaves);
    const remaining = Math.max(0, Math.round((entitled - used) * 10) / 10);
    const ticketLabel = employee.ticket_entitlement === "yearly" ? t.ticketYearly : employee.ticket_entitlement === "biennial" ? t.ticketBiennial : t.ticketNone;

    const hasApprovals = Boolean(employee.is_approver_manager || employee.is_approver_finance);
    content = (
      <div>
        {/* بطاقة المنشأة + الصلاحيات */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {org?.logo_url ? (
                <Image src={org.logo_url} fittingType="fit" className="h-14 w-14 rounded-xl bg-slate-50 p-1.5 border border-border shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <Building2 size={26} className="text-violet-600" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{t.orgLabel}</div>
                <div className="text-lg font-bold truncate">{org?.name || "—"}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {employee.employee_number} · {employee.position} · {employee.department || ""}
                </div>
              </div>
            </div>
            {(hasApprovals) && (
              <div className="flex flex-wrap gap-2">
                {employee.is_approver_manager && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <BadgeCheck size={14} /> {t.delegatedManager}
                  </span>
                )}
                {employee.is_approver_finance && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    <BadgeCheck size={14} /> {t.delegatedFinance}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {hasApprovals && (
          <div className="flex gap-2 mb-5 border-b border-border">
            <button type="button" onClick={() => setView("self")} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition", view === "self" ? "border-violet-500 text-violet-700" : "border-transparent text-muted-foreground hover:text-foreground")}>{t.selfTab}</button>
            <button type="button" onClick={() => setView("approvals")} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition", view === "approvals" ? "border-violet-500 text-violet-700" : "border-transparent text-muted-foreground hover:text-foreground")}>{t.approvalsTab}</button>
          </div>
        )}
        {hasApprovals && view === "approvals" ? (
          <ApprovalsPortal portalSession={session} />
        ) : (
          <>
            <PageHeader
              title={t.title}
              subtitle={`${employee.full_name || ""}`}
              action={
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setLeaveOpen(true)} variant="outline" className="gap-2"><CalendarPlus size={18} /> {t.leaveBtn}</Button>
                  <Button onClick={() => setLoanOpen(true)} variant="outline" className="gap-2"><Wallet size={18} /> {t.loanBtn}</Button>
                  <Button onClick={() => setTripOpen(true)} className="gap-2"><Plane size={18} /> {t.tripBtn}</Button>
                </div>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <InfoCard icon={Clock} label={t.yearsLabel} value={t.yearsVal(serviceYears)} sub={employee.hire_date ? t.yearsSub(employee.hire_date) : ""} />
              <InfoCard icon={CalendarCheck} label={t.leaveLabel} value={t.leaveVal(remaining)} sub={t.leaveSub(entitled, used)} />
              <InfoCard icon={Banknote} label={t.grossLabel} value={formatCurrency(gross)} sub={t.grossSub(employee.base_salary || 0)} />
              <InfoCard icon={BadgeCheck} label={t.ticketLabel} value={ticketLabel} sub={employee.is_saudi ? t.ticketSaudi : t.ticketExpat} />
            </div>

            <EmployeeClock employee={employee} org={org} onChanged={() => load(session)} clockApi={clockApi} initialToday={todayAtt} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <SideCard title={t.detailTitle}>
                <DLine label={t.dPosition} value={employee.position} />
                <DLine label={t.dDept} value={employee.department} />
                <DLine label={t.dHire} value={employee.hire_date} />
                <DLine label={t.dService} value={t.yearsVal(serviceYears)} />
                <DLine label={t.dContract} value={employee.contract_type === "full_time" ? t.contractFT : employee.contract_type === "part_time" ? t.contractPT : t.contractC} />
                <DLine label={t.dBase} value={formatCurrency(employee.base_salary || 0)} />
                <DLine label={t.dHousing} value={formatCurrency(employee.housing_allowance || 0)} />
                <DLine label={t.dTransport} value={formatCurrency(employee.transport_allowance || 0)} />
                <DLine label={t.dOther} value={formatCurrency(employee.other_allowances || 0)} />
                <DLine label={t.dTotal} value={formatCurrency(gross)} strong />
              </SideCard>

              <div className="lg:col-span-2">
                <SideCard title={t.attTitle}>
                  {attendance.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">{t.attEmpty}</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-muted-foreground">
                            <th className="text-right font-medium pb-2">{t.thDate}</th>
                            <th className="text-right font-medium pb-2">{t.thIn}</th>
                            <th className="text-right font-medium pb-2">{t.thOut}</th>
                            <th className="text-right font-medium pb-2">{t.thHours}</th>
                            <th className="text-right font-medium pb-2">{t.thStatus}</th>
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
              <Section title={t.leavesTitle}>
                {leaves.length === 0 ? <Empty text={t.noLeaves} /> : leaves.map((r) => (
                  <Row key={r.id}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{leaveTypeLabel(r.leave_type)}</span>
                        {r.is_full_clearance && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{t.fullClear}</span>}
                        {r.medical_report_url && (
                          <a href={r.medical_report_url} target="_blank" rel="noreferrer" className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{t.medReport}</a>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{r.start_date} ← {r.end_date} · {t.days(r.days_count)}</div>
                    </div>
                    <span className={cn("text-xs px-3 py-1.5 rounded-full font-medium", badge(r.status).cls)}>{badge(r.status).label}</span>
                  </Row>
                ))}
              </Section>
              <Section title={t.loansTitle}>
                {loans.length === 0 ? <Empty text={t.noLoans} /> : loans.map((r) => (
                  <Row key={r.id}>
                    <div>
                      <div className="font-medium text-sm">{Number(r.amount).toLocaleString()} {t.sar}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t.loanInst(r.installment_count)} · {t.loanMonthly(r.monthly_installment)}</div>
                    </div>
                    <span className={cn("text-xs px-3 py-1.5 rounded-full font-medium", badge(r.status).cls)}>{badge(r.status).label}</span>
                  </Row>
                ))}
              </Section>
            </div>

            <div className="mt-6">
              <Section title={t.tripsTitle}>
                {trips.length === 0 ? <Empty text={t.noTrips} /> : trips.map((r) => {
                  const st = tripStatus[r.status] || tripStatus.pending;
                  return (
                    <Row key={r.id}>
                      <div>
                        <div className="font-medium text-sm">{r.trip_type === "external" ? t.tripExternal : t.tripInternal} — {r.destination || "—"}</div>
                        <div className="text-xs text-muted-foreground mt-1">{r.start_date} ← {r.end_date} · {t.days(r.days_count)}</div>
                      </div>
                      <span className={cn("text-xs px-3 py-1.5 rounded-full font-medium", st.cls)}>{st.label}</span>
                    </Row>
                  );
                })}
              </Section>
            </div>

            <LeaveRequestForm open={leaveOpen} onClose={() => setLeaveOpen(false)} onSaved={() => load(session)} employees={[employee]} currentUserEmployee={employee} portalCreate={portalCreateLeave} />
            <LoanRequestForm open={loanOpen} onClose={() => setLoanOpen(false)} onSaved={() => load(session)} employee={employee} portalCreate={portalCreateLoan} />
            <BusinessTripForm open={tripOpen} onClose={() => setTripOpen(false)} onSaved={() => load(session)} employees={[employee]} currentUserEmployee={employee} portalCreate={portalCreateTrip} />

            <div className="mt-6">
              <EmployeeWarnings employee={employee} warnings={warnings} />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={t.dir}>
      <header className="sticky top-0 z-40 bg-[#0b1120] text-white border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/portal"><Logo tone="light" size={38} /></Link>
            <div className="hidden sm:block text-xs text-white/60 leading-tight">
              {t.brandSub}<br />
              <span className="text-white/40">{t.brandOnly}</span>
            </div>
            {session && org && (
              <div className="hidden sm:flex items-center gap-2 ps-3 border-s border-white/10">
                {org.logo_url ? <Image src={org.logo_url} fittingType="fit" className="h-8 w-8 rounded bg-white/90 p-0.5" /> : null}
                <span className="text-sm font-medium text-white/90 truncate max-w-[160px]" title={org.name}>{org.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition">
              <ArrowRight size={16} style={{ transform: isAr ? "none" : "scaleX(-1)" }} /> {isAr ? "العودة للموقع" : "Back to site"}
            </Link>
            <LanguageToggle />
            {session && (
              <button onClick={handlePortalLogout} className="flex items-center gap-2 text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition">
                <LogOut size={18} /> {t.logout}
              </button>
            )}
          </div>
        </div>
      </header>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.10] via-indigo-500/[0.05] to-amber-200/[0.10] dark:from-violet-500/[0.14] dark:via-indigo-500/[0.10] dark:to-amber-500/[0.08]" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-24 -right-16 w-[420px] h-[420px] rounded-full bg-violet-500/[0.10] dark:bg-violet-500/[0.16] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 w-[380px] h-[380px] rounded-full bg-amber-400/[0.10] dark:bg-amber-500/[0.10] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07] dark:opacity-[0.10]" aria-hidden="true">
          <Crown size={400} className="text-amber-500 dark:text-amber-400" strokeWidth={0.8} />
        </div>
        <div className="relative">{content}</div>
      </div>
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