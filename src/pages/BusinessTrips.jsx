import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import BusinessTripForm from "@/components/BusinessTripForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Plane, MapPin, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const typeLabel = {
  internal: { label: "داخلية", cls: "bg-blue-50 text-blue-600" },
  external: { label: "خارجية", cls: "bg-violet-50 text-violet-600" },
};
const statusLabel = {
  draft: { label: "مسودة", cls: "bg-slate-100 text-slate-600" },
  pending: { label: "قيد الاعتماد", cls: "bg-amber-50 text-amber-600" },
  approved: { label: "معتمدة", cls: "bg-blue-50 text-blue-600" },
  in_progress: { label: "قيد التنفيذ", cls: "bg-indigo-50 text-indigo-600" },
  completed: { label: "مكتملة", cls: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "ملغاة", cls: "bg-rose-50 text-rose-600" },
};
const transportLabel = { plane: "طيران", car: "سيارة", bus: "حافلة", train: "قطار", none: "—" };

export default function BusinessTrips() {
  const [trips, setTrips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const [t, e] = await Promise.all([
      base44.entities.BusinessTrip.list("-created_date", 500),
      base44.entities.Employee.list("-created_date", 500),
    ]);
    setTrips(t);
    setEmployees(e);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await base44.entities.BusinessTrip.delete(id);
    load();
  };

  const filtered = trips.filter((t) => {
    const emp = employees.find((x) => x.id === t.employee_id);
    const text = `${t.employee_name || ""} ${emp?.position || ""} ${t.destination || ""} ${t.purpose || ""}`;
    if (q && !text.toLowerCase().includes(q.toLowerCase())) return false;
    if (typeFilter !== "all" && t.trip_type !== typeFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: trips.length,
    internal: trips.filter((t) => t.trip_type === "internal").length,
    external: trips.filter((t) => t.trip_type === "external").length,
    cost: trips.reduce((s, t) => s + (Number(t.total_cost) || 0), 0),
  };

  return (
    <div>
      <PageHeader
        title="رحلات العمل والانتداب"
        subtitle="إدارة انتدابات الموظفين الداخلية والخارجية والتكاليف المرتبطة بها"
        action={
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
            <Plus size={18} /> رحلة جديدة
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Plane size={18} />} label="إجمالي الرحلات" value={stats.total} cls="bg-violet-50 text-violet-600" />
        <StatCard icon={<MapPin size={18} />} label="داخلية" value={stats.internal} cls="bg-blue-50 text-blue-600" />
        <StatCard icon={<MapPin size={18} />} label="خارجية" value={stats.external} cls="bg-indigo-50 text-indigo-600" />
        <StatCard icon={<Wallet size={18} />} label="إجمالي التكاليف" value={stats.cost.toLocaleString()} cls="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input placeholder="بحث بالموظف أو الوجهة أو الغرض" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="نوع الرحلة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="internal">داخلية</SelectItem>
            <SelectItem value="external">خارجية</SelectItem>
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
          <Plane size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-muted-foreground">لا توجد رحلات عمل بعد — ابدأ بإنشاء رحلة جديدة</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الوجهة</TableHead>
                <TableHead>الفترة</TableHead>
                <TableHead>الأيام</TableHead>
                <TableHead>التنقل</TableHead>
                <TableHead>التكلفة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => {
                const tp = typeLabel[t.trip_type] || typeLabel.internal;
                const st = statusLabel[t.status] || statusLabel.pending;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.employee_name || "—"}</TableCell>
                    <TableCell><span className={cn("text-xs px-2 py-1 rounded-full font-medium", tp.cls)}>{tp.label}</span></TableCell>
                    <TableCell>{t.destination || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.start_date} ← {t.end_date}</TableCell>
                    <TableCell>{t.days_count || 0}</TableCell>
                    <TableCell className="text-sm">{transportLabel[t.transport_mode] || "—"}</TableCell>
                    <TableCell className="font-medium">{(Number(t.total_cost) || 0).toLocaleString()}</TableCell>
                    <TableCell><span className={cn("text-xs px-2 py-1 rounded-full font-medium", st.cls)}>{st.label}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(t); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove(t.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <BusinessTripForm
        open={showForm}
        employees={employees}
        editing={editing}
        onClose={() => setShowForm(false)}
        onSaved={load}
      />
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