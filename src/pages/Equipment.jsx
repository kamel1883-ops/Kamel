import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Search, Printer, Package, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { todayISO } from "@/lib/hr";
import { badge } from "@/lib/approvals";
import PullToRefresh from "@/components/PullToRefresh";
import EquipmentHandoverDoc from "@/components/docs/EquipmentHandoverDoc";

const ITEM_TYPES = [
  { value: "laptop", ar: "لابتوب" }, { value: "phone", ar: "جوال" }, { value: "work_phone", ar: "جوال عمل" },
  { value: "sim", ar: "شريحة جوال" }, { value: "tablet", ar: "جهاز لوحي" }, { value: "clothing", ar: "ملابس عمل" },
  { value: "camera", ar: "كاميرا" }, { value: "tool", ar: "أداة/عدة" }, { value: "other", ar: "أخرى" },
];
const typeLabel = (v) => ITEM_TYPES.find((i) => i.value === v)?.ar || v || "—";
const stBadge = (s) => {
  const m = {
    pending_manager: { label: "بانتظار المدير", cls: "bg-amber-50 text-amber-600" },
    manager_approved: { label: "وافق المدير — بانتظار الموارد", cls: "bg-blue-50 text-blue-600" },
    completed: { label: "تم التسليم ✅", cls: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "مرفوض", cls: "bg-rose-50 text-rose-600" },
    active: { label: "سارية", cls: "bg-emerald-50 text-emerald-600" },
    returned: { label: "مُعادة", cls: "bg-slate-100 text-slate-600" },
    lost: { label: "مفقودة", cls: "bg-rose-50 text-rose-600" },
    damaged: { label: "تالفة", cls: "bg-amber-50 text-amber-600" },
  };
  return m[s] || { label: s || "—", cls: "bg-slate-100 text-slate-600" };
};

export default function Equipment() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "العهد والمصروفات", subtitle: "طلبات العهد عبر بوابة الموظف (مدير ← موارد بشرية) + سجل العهد المسلّمة",
    tabReq: (n) => `طلبات العهد (${n})`, tabCust: (n) => `العهد المسلّمة (${n})`,
    loading: "جارٍ التحميل...", empty: "لا توجد سجلات", searchPh: "ابحث برقم الهوية...",
    mgrApprove: "موافقة المدير", hrApprove: "اعتماد وتسليم", reject: "رفض", print: "طباعة السند",
    addCust: "تسليم عهدة جديدة", emp: "الموظف", type: "نوع العهدة", custom: "نوع مخصص",
    label: "البيان", serial: "الرقم التسلسلي", assigned: "تاريخ التسليم", cost: "التكلفة", cond: "الحالة", notes: "ملاحظات",
    cancel: "إلغاء", save: "حفظ", hrNote: "ملاحظة الموارد البشرية", mgrNote: "ملاحظة المدير",
    rejectTitle: "رفض الطلب", rejectReason: "سبب الرفض", confirmReject: "تأكيد الرفض",
    hrTitle: "اعتماد طلب العهدة — الموارد البشرية", hrWarn: "عند الاعتماد يُنشأ سند العهدة ويُسجّل في ملف الموظف ويُؤرشف المستند بين الأطراف.",
    reqFrom: "طلب العهدة", delCust: "حذف", retCust: "إرجاع",
  } : {
    title: "Custody & Expenses", subtitle: "Equipment requests (manager ← HR) + assigned custody",
    tabReq: (n) => `Requests (${n})`, tabCust: (n) => `Custody (${n})`,
    loading: "Loading...", empty: "No records", searchPh: "Search by ID...",
    mgrApprove: "Manager approve", hrApprove: "Approve & handover", reject: "Reject", print: "Print voucher",
    addCust: "New custody", emp: "Employee", type: "Item type", custom: "Custom type",
    label: "Description", serial: "Serial", assigned: "Assigned date", cost: "Cost", cond: "Condition", notes: "Notes",
    cancel: "Cancel", save: "Save", hrNote: "HR note", mgrNote: "Manager note",
    rejectTitle: "Reject", rejectReason: "Reason", confirmReject: "Confirm",
    hrTitle: "Approve equipment — HR", hrWarn: "On approval a custody voucher is created, saved to the employee file, and archived.",
    reqFrom: "Request", delCust: "Delete", retCust: "Return",
  };

  const [reqs, setReqs] = useState([]);
  const [custody, setCustody] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [org, setOrg] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [acting, setActing] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [custOpen, setCustOpen] = useState(false);
  const [printEq, setPrintEq] = useState(null);
  const [custForm, setCustForm] = useState({ employee_id: "", item_type: "laptop", custom_type: "", item_label: "", serial_number: "", assigned_date: todayISO(), cost: 0, condition_note: "", notes: "" });

  const load = async () => {
    setLoading(true);
    const [r, c, emps, orgs] = await Promise.all([
      base44.entities.EquipmentRequest.list("-created_date", 500),
      base44.entities.Equipment.list("-created_date", 500),
      base44.entities.Employee.list("-created_date", 500),
      base44.entities.Organization.list("-created_date", 1),
    ]);
    setReqs(r); setCustody(c); setEmployees(emps); setOrg(orgs[0]);
    try { setMe(await base44.auth.me()); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const empOf = (id) => employees.find((e) => e.id === id);
  const myEmployee = employees.find((e) => e.user_id && e.user_id === me?.id) || null;
  const isAdmin = me?.role === "admin";
  const isHR = isAdmin || !!myEmployee?.is_approver_hr;
  const isManager = isAdmin || !!myEmployee?.is_approver_manager;
  const isManagerOf = (r) => isAdmin || (isManager && !!r.manager_id && r.manager_id === myEmployee?.id);

  const query = q.trim();
  const matchedIds = query ? new Set(employees.filter((e) => (e.national_id || "").replace(/\s/g, "").includes(query.replace(/\s/g, ""))).map((e) => e.id)) : null;
  const visReqs = matchedIds ? reqs.filter((r) => matchedIds.has(r.employee_id)) : reqs;
  const visCust = matchedIds ? custody.filter((c) => matchedIds.has(c.employee_id)) : custody;

  const managerApprove = async (r) => {
    await base44.entities.EquipmentRequest.update(r.id, { manager_status: "approved", manager_id: me?.id, manager_name: me?.full_name, manager_date: todayISO(), status: "manager_approved", manager_note: note || "" });
    setNote(""); load();
  };
  const openHr = (r) => { setActing({ req: r, action: "hr" }); setNote(""); };
  const confirmHr = async () => {
    if (!acting) return;
    setBusy(true);
    try {
      const r = acting.req;
      const emp = empOf(r.employee_id);
      const eq = await base44.entities.Equipment.create({
        employee_id: r.employee_id, employee_user_id: r.employee_user_id || emp?.user_id || "",
        employee_name: r.employee_name || emp?.full_name || "", department: emp?.department || "",
        item_type: r.item_type, custom_type: r.custom_type, item_label: r.item_label || r.custom_type || typeLabel(r.item_type),
        assigned_date: todayISO(), status: "active", request_id: r.id,
        condition_note: note || "", cost: 0,
        prepared_by_name: me?.full_name || "", prepared_by_id: myEmployee?.national_id || "",
      });
      await base44.entities.EquipmentRequest.update(r.id, {
        hr_status: "approved", hr_id: me?.id, hr_name: me?.full_name, hr_date: todayISO(), hr_note: note,
        status: "completed", equipment_id: eq?.id || "",
      });
      setPrintEq(eq);
    } catch (e) {}
    setBusy(false); setActing(null); setNote(""); load();
  };
  const openReject = (r) => { setActing({ req: r, action: "reject" }); setNote(""); };
  const confirmReject = async () => {
    if (!acting) return;
    await base44.entities.EquipmentRequest.update(acting.req.id, { status: "rejected", hr_status: "rejected", hr_note: note });
    setActing(null); setNote(""); load();
  };
  const managerReject = async (r) => {
    await base44.entities.EquipmentRequest.update(r.id, { manager_status: "rejected", manager_note: note, status: "rejected" });
    setNote(""); load();
  };
  const returnCustody = async (c) => {
    await base44.entities.Equipment.update(c.id, { status: "returned", return_date: todayISO() });
    load();
  };
  const deleteCustody = async (c) => {
    await base44.entities.Equipment.delete(c.id); load();
  };
  const saveCustody = async () => {
    const emp = empOf(custForm.employee_id);
    await base44.entities.Equipment.create({
      ...custForm,
      employee_name: emp?.full_name || "", employee_user_id: emp?.user_id || "", department: emp?.department || "",
      status: "active", prepared_by_name: me?.full_name || "", prepared_by_id: myEmployee?.national_id || "",
    });
    setCustOpen(false); load();
  };
  const printHandover = (c) => { setPrintEq(c); setTimeout(() => window.print(), 200); };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} action={
        <Button onClick={() => setCustOpen(true)} className="gap-2"><Package size={18} /> {t.addCust}</Button>
      } />

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
      ) : (
        <PullToRefresh onRefresh={load}>
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPh} className="pr-9 max-w-md" />
          </div>

          <Tabs defaultValue="reqs">
            <TabsList className="mb-4">
              <TabsTrigger value="reqs">{t.tabReq(visReqs.length)}</TabsTrigger>
              <TabsTrigger value="cust">{t.tabCust(visCust.length)}</TabsTrigger>
            </TabsList>

            <TabsContent value="reqs">
              <div className="space-y-3">
                {visReqs.length === 0 ? <Empty t={t} /> : visReqs.map((r) => {
                  const emp = empOf(r.employee_id);
                  const actions = [];
                  if (r.status === "pending_manager" && isManagerOf(r)) {
                    actions.push({ label: t.mgrApprove, cls: "bg-emerald-600 hover:bg-emerald-700", onClick: () => managerApprove(r) });
                    actions.push({ label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => { setActing({ req: r, action: "mreject" }); setNote(""); } });
                  } else if (r.status === "manager_approved" && isHR) {
                    actions.push({ label: t.hrApprove, cls: "bg-violet-600 hover:bg-violet-700", onClick: () => openHr(r) });
                    actions.push({ label: t.reject, cls: "bg-rose-50 text-rose-600 hover:bg-rose-100", onClick: () => openReject(r) });
                  }
                  if (r.equipment_id) actions.push({ label: t.print, cls: "bg-slate-100 text-slate-700 hover:bg-slate-200", onClick: () => { const eq = custody.find((c) => c.id === r.equipment_id); if (eq) printHandover(eq); } });
                  return (
                    <Card key={r.id}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{emp?.full_name || r.employee_name}</div>
                          <div className="text-xs text-muted-foreground">{emp?.national_id || "—"}</div>
                          <div className="text-xs text-muted-foreground mt-1">{typeLabel(r.item_type)}{r.custom_type ? ` — ${r.custom_type}` : ""} · {r.item_label}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">تاريخ الطلب: <b className="text-foreground tabular-nums">{r.request_date || (r.created_date || "").slice(0, 10) || "—"}</b></div>
                          {r.reason && <div className="text-xs text-muted-foreground mt-0.5">{r.reason}</div>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", stBadge(r.status).cls)}>{stBadge(r.status).label}</span>
                          {actions.map((a, i) => (
                            <Button key={i} size="sm" onClick={a.onClick} className={cn("h-8 text-xs", a.cls)}>{a.label}</Button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="cust">
              <div className="space-y-3">
                {visCust.length === 0 ? <Empty t={t} /> : visCust.map((c) => (
                  <Card key={c.id}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{c.employee_name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{typeLabel(c.item_type)}{c.custom_type ? ` — ${c.custom_type}` : ""} · {c.item_label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">تاريخ التسليم: <b className="text-foreground tabular-nums">{c.assigned_date || "—"}</b>{c.serial_number ? ` · سريال: ${c.serial_number}` : ""}{c.cost ? ` · ${c.cost} ر.س` : ""}</div>
                        {c.prepared_by_name && <div className="text-[11px] text-violet-700 mt-0.5">أُعدّت بواسطة: {c.prepared_by_name}{c.prepared_by_id ? ` — ${c.prepared_by_id}` : ""}</div>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", stBadge(c.status).cls)}>{stBadge(c.status).label}</span>
                        <Button size="sm" variant="outline" onClick={() => printHandover(c)} className="gap-1 h-8"><Printer size={14} /> {t.print}</Button>
                        {c.status === "active" && <Button size="sm" variant="outline" onClick={() => returnCustody(c)} className="h-8">{t.retCust}</Button>}
                        {isAdmin && <Button size="sm" variant="ghost" onClick={() => deleteCustody(c)} className="h-8 text-rose-500">{t.delCust}</Button>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
        </PullToRefresh>
      )}

      {/* اعتماد الموارد البشرية */}
      <Dialog open={acting?.action === "hr"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.hrTitle}</DialogTitle></DialogHeader>
          {acting && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">{empOf(acting.req.employee_id)?.full_name || acting.req.employee_name} · {typeLabel(acting.req.item_type)} — {acting.req.item_label}</div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.hrNote}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              </div>
              <div className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg p-3">{t.hrWarn}</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActing(null)} disabled={busy}>{t.cancel}</Button>
                <Button onClick={confirmHr} disabled={busy} className="gap-1 bg-violet-600 hover:bg-violet-700">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {t.hrApprove}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* رفض / رفض المدير */}
      <Dialog open={acting?.action === "reject" || acting?.action === "mreject"} onOpenChange={() => setActing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.rejectTitle}</DialogTitle></DialogHeader>
          {acting && (
            <div className="space-y-3">
              <div className="font-medium text-sm">{empOf(acting.req.employee_id)?.full_name || acting.req.employee_name}</div>
              <Label className="text-xs font-medium text-muted-foreground">{t.rejectReason}</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setActing(null)}>{t.cancel}</Button>
                <Button variant="destructive" onClick={acting.action === "mreject" ? () => managerReject(acting.req) : confirmReject} className="gap-1">
                  <X size={16} /> {t.confirmReject}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* تسليم عهدة جديدة */}
      <Dialog open={custOpen} onOpenChange={setCustOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t.addCust}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground">{t.emp}</Label>
              <Select value={custForm.employee_id} onValueChange={(v) => setCustForm((f) => ({ ...f, employee_id: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder={isAr ? "اختر الموظف" : "Select employee"} /></SelectTrigger>
                <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name} — {e.national_id || "—"}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t.type}</Label>
              <Select value={custForm.item_type} onValueChange={(v) => setCustForm((f) => ({ ...f, item_type: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{ITEM_TYPES.map((i) => <SelectItem key={i.value} value={i.value}>{i.ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {custForm.item_type === "other" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.custom}</Label>
                <Input value={custForm.custom_type} onChange={(e) => setCustForm((f) => ({ ...f, custom_type: e.target.value }))} />
              </div>
            )}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground">{t.label}</Label>
              <Input value={custForm.item_label} onChange={(e) => setCustForm((f) => ({ ...f, item_label: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t.serial}</Label>
              <Input value={custForm.serial_number} onChange={(e) => setCustForm((f) => ({ ...f, serial_number: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t.assigned}</Label>
              <Input type="date" value={custForm.assigned_date} onChange={(e) => setCustForm((f) => ({ ...f, assigned_date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t.cost}</Label>
              <Input type="number" dir="ltr" value={custForm.cost} onChange={(e) => setCustForm((f) => ({ ...f, cost: Number(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground">{t.cond}</Label>
              <Input value={custForm.condition_note} onChange={(e) => setCustForm((f) => ({ ...f, condition_note: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustOpen(false)}>{t.cancel}</Button>
            <Button onClick={saveCustody} disabled={!custForm.employee_id || !custForm.item_label} className="gap-1"><Check size={16} /> {t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مستند قابل للطباعة — يُحتوى خارج الشاشة ويظهر عند الطباعة */}
      {printEq && (
        <div className="print-mount">
          <EquipmentHandoverDoc equipment={printEq} org={org} isAr={isAr} />
        </div>
      )}
    </div>
  );
}

function Card({ children }) {
  return <div className="bg-white rounded-2xl border border-border p-4">{children}</div>;
}
function Empty({ t }) {
  return <div className="p-14 text-center bg-white rounded-2xl border border-border"><Package size={40} className="mx-auto text-slate-300 mb-3" /><p className="text-muted-foreground">{t.empty}</p></div>;
}