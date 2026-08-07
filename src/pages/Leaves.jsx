import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Trash2, CalendarDays, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const typeLabel = {
  annual: { label: "سنوية", cls: "bg-blue-50 text-blue-600" },
  sick: { label: "مرضية", cls: "bg-rose-50 text-rose-600" },
  emergency: { label: "طارئة", cls: "bg-amber-50 text-amber-600" },
  unpaid: { label: "بدون راتب", cls: "bg-slate-100 text-slate-600" },
  maternity: { label: "أمومة", cls: "bg-violet-50 text-violet-600" },
};
const statusLabel = {
  pending_manager: { label: "بانتظار المدير", cls: "bg-amber-50 text-amber-600" },
  manager_approved: { label: "اعتمد المدير", cls: "bg-blue-50 text-blue-600" },
  hr_approved: { label: "اعتمدت الموارد", cls: "bg-indigo-50 text-indigo-600" },
  awaiting_finance: { label: "بانتظار المالية", cls: "bg-violet-50 text-violet-600" },
  paid: { label: "صُرفت", cls: "bg-emerald-50 text-emerald-600" },
  completed: { label: "مكتملة", cls: "bg-emerald-50 text-emerald-600" },
  rejected: { label: "مرفوضة", cls: "bg-rose-50 text-rose-600" },
  pending: { label: "قيد المراجعة", cls: "bg-amber-50 text-amber-600" },
  approved: { label: "معتمدة", cls: "bg-emerald-50 text-emerald-600" },
};

export default function Leaves() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const [r, e] = await Promise.all([
      base44.entities.LeaveRequest.list("-created_date", 500),
      base44.entities.Employee.list("-created_date", 500),
    ]);
    setRequests(r);
    setEmployees(e);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await base44.entities.LeaveRequest.delete(id);
    load();
  };

  const filtered = requests.filter((r) => {
    const text = `${r.employee_name || ""} ${r.reason || ""}`;
    if (q && !text.toLowerCase().includes(q.toLowerCase())) return false;
    if (typeFilter !== "all" && r.leave_type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => ["pending_manager", "manager_approved", "hr_approved", "awaiting_finance", "pending"].includes(r.status)).length,
    approved: requests.filter((r) => ["paid", "completed", "approved"].includes(r.status)).length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div>
      <PageHeader
        title="إدارة الإجازات"
        subtitle="متابعة طلبات الإجازات وأرصدتها وحالاتها"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<CalendarDays size={18} />} label="إجمالي الطلبات" value={stats.total} cls="bg-violet-50 text-violet-600" />
        <StatCard icon={<Clock size={18} />} label="قيد المعالجة" value={stats.pending} cls="bg-amber-50 text-amber-600" />
        <StatCard icon={<CheckCircle2 size={18} />} label="معتمدة" value={stats.approved} cls="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<XCircle size={18} />} label="مرفوضة" value={stats.rejected} cls="bg-rose-50 text-rose-600" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input placeholder="بحث بالموظف أو السبب" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="نوع الإجازة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {Object.entries(typeLabel).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {Object.entries(statusLabel).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="p-14 text-center bg-white rounded-2xl border border-border">
          <CalendarDays size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-muted-foreground">لا توجد طلبات إجازات بعد — أنشئ طلباً جديداً</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>من</TableHead>
                <TableHead>إلى</TableHead>
                <TableHead>الأيام</TableHead>
                <TableHead>السبب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const tp = typeLabel[r.leave_type] || typeLabel.annual;
                const st = statusLabel[r.status] || statusLabel.pending_manager;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.employee_name || "—"}</TableCell>
                    <TableCell><span className={cn("text-xs px-2 py-1 rounded-full font-medium", tp.cls)}>{tp.label}</span></TableCell>
                    <TableCell className="text-sm">{r.start_date}</TableCell>
                    <TableCell className="text-sm">{r.end_date}</TableCell>
                    <TableCell>{r.days_count || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">{r.reason || "—"}</TableCell>
                    <TableCell><span className={cn("text-xs px-2 py-1 rounded-full font-medium", st.cls)}>{st.label}</span></TableCell>
                    <TableCell>
                      <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500">
                        <Trash2 size={15} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

    </div>
  );
}

function StatCard({ icon, label, value, cls }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cls)}>{icon}</div>
      <div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}