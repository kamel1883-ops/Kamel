import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import LeaveRequestForm from "@/components/LeaveRequestForm";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { ClipboardList, Plus, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { leaveTypeLabel } from "@/lib/hr";

export default function LeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [reviewing, setReviewing] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.LeaveRequest.list("-created_date", 500);
    setRequests(data);
    const emps = await base44.entities.Employee.filter({ status: "active" }, "-created_date", 500);
    setEmployees(emps);
    setLoading(false);
  };
  useEffect(() => { load(); }, [formOpen]);

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const review = async (id, status) => {
    setSaving(true);
    await base44.entities.LeaveRequest.update(id, {
      status, review_note: reviewNote, reviewed_date: new Date().toISOString().slice(0, 10),
    });
    if (status === "approved") {
      const req = requests.find((r) => r.id === id);
      if (req?.employee_id) {
        await base44.entities.Employee.update(req.employee_id, { status: "on_leave" });
      }
    }
    setSaving(false);
    setReviewing(null);
    setReviewNote("");
    load();
  };

  return (
    <div>
      <PageHeader
        title="طلبات الإجازة"
        subtitle="استقبال ومراجعة طلبات إجازات الموظفين"
        action={<Button onClick={() => setFormOpen(true)} className="gap-2"><Plus size={18} /> طلب جديد</Button>}
      />

      <div className="flex gap-3 mb-5 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
              filter === f ? "bg-slate-900 text-white border-slate-900" : "bg-white text-muted-foreground border-border hover:bg-slate-50"
            )}
          >
            {f === "all" ? "الكل" : f === "pending" ? "بانتظار" : f === "approved" ? "موافق عليها" : "مرفوضة"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center">
            <ClipboardList size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-muted-foreground">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((r) => (
              <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{r.employee_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{leaveTypeLabel(r.leave_type)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {r.start_date} ← {r.end_date} · {r.days_count} يوم
                  </div>
                  {r.reason && <div className="text-sm text-muted-foreground mt-1">السبب: {r.reason}</div>}
                  {r.review_note && <div className="text-xs text-slate-500 mt-1">ملاحظة المراجع: {r.review_note}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.status === "pending" ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => { setReviewing(r); setReviewNote(""); }} className="gap-1">مراجعة</Button>
                    </>
                  ) : (
                    <span className={cn("text-xs px-3 py-1.5 rounded-full font-medium",
                      r.status === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                      {r.status === "approved" ? "موافق عليها" : "مرفوضة"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <LeaveRequestForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} employees={employees} />

      <Dialog open={!!reviewing} onOpenChange={() => setReviewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>مراجعة طلب الإجازة</DialogTitle></DialogHeader>
          {reviewing && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div><b className="text-foreground">{reviewing.employee_name}</b></div>
                <div className="mt-1">{leaveTypeLabel(reviewing.leave_type)} · {reviewing.days_count} يوم</div>
                <div className="mt-1">{reviewing.start_date} ← {reviewing.end_date}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">ملاحظة (اختياري)</label>
                <Textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={2} />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setReviewing(null)} disabled={saving}>إلغاء</Button>
                <Button variant="destructive" onClick={() => review(reviewing.id, "rejected")} disabled={saving} className="gap-1">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} رفض
                </Button>
                <Button onClick={() => review(reviewing.id, "approved")} disabled={saving} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} موافقة
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}