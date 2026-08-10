import React from "react";
import PageHeader from "@/components/PageHeader";
import { Briefcase } from "lucide-react";

export default function Recruitment() {
  return (
    <div>
      <PageHeader title="إدارة التوظيف" subtitle="إدارة الاحتياجات الوظيفية والمتقدمين وعروض العمل" />
      <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl border bg-card">
        <Briefcase className="text-muted-foreground mb-4" size={48} />
        <p className="text-muted-foreground">هذا القسم قيد التطوير — سيتم تفعيله قريباً.</p>
      </div>
    </div>
  );
}