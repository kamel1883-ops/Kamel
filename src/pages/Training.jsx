import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TrainingPlanFormDialog from "@/components/training/TrainingPlanFormDialog";

const statusMap = {
  draft: { ar: "مسودة", cls: "bg-slate-100 text-slate-700" },
  in_progress: { ar: "قيد التنفيذ", cls: "bg-amber-100 text-amber-800" },
  completed: { ar: "مكتملة", cls: "bg-emerald-100 text-emerald-800" },
  cancelled: { ar: "ملغاة", cls: "bg-red-100 text-red-700" },
};

export default function Training() {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [pl, emps] = await Promise.all([
        base44.entities.TrainingPlan.list("-created_date", 200),
        base44.entities.Employee.list("-created_date", 500).catch(() => []),
      ]);
      setPlans(pl || []);
      setEmployees(emps || []);
    } catch (e) { toast({ title: "تعذر التحميل", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setDialogOpen(true); };
  const del = async (p) => {
    if (!confirm("حذف هذه الخطة؟")) return;
    try { await base44.entities.TrainingPlan.delete(p.id); toast({ title: "تم الحذف" }); load(); }
    catch (e) { toast({ title: "تعذر الحذف", description: e.message, variant: "destructive" }); }
  };

  return (
    <div>
      <PageHeader title="التدريب والتطوير" subtitle="إدارة الخطط التدريبية للموظفين والإدارات وتتبع أهدافها وتكلفتها" action={
        <Button onClick={openNew}><Plus size={16} /> خطة تدريبية جديدة</Button>
      } />
      {loading ? (
        <div className="py-24 text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl border bg-card">
          <GraduationCap className="text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground mb-4">لا توجد خطط تدريبية بعد — ابدأ بإنشاء أول خطة.</p>
          <Button onClick={openNew}><Plus size={16} /> خطة تدريبية جديدة</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => {
            const st = statusMap[p.status] || statusMap.draft;
            return (
              <Card key={p.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <Badge className={st.cls + " border-0"}>{st.ar}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.scope === "department" ? <span>جهة/قسم: {p.department || "—"}</span> : <span>الموظف: {p.employee_name || "—"}</span>}
                </div>
                {p.deficiency && <div className="text-sm text-muted-foreground line-clamp-2">النقص: {p.deficiency}</div>}
                {p.goal && <div className="text-sm text-muted-foreground line-clamp-2">الهدف: {p.goal}</div>}
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">{p.cost ? `${p.cost} ريال` : ""} {p.start_date ? `· ${p.start_date}` : ""}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil size={15} /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(p)}><Trash2 size={15} /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <TrainingPlanFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} plan={editing} employees={employees} />
    </div>
  );
}