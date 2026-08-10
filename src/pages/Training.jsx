import React from "react";
import PageHeader from "@/components/PageHeader";
import { GraduationCap } from "lucide-react";

export default function Training() {
  return (
    <div>
      <PageHeader title="التدريب والتطوير" subtitle="إدارة البرامج التدريبية ومسارات تطوير الموظفين" />
      <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl border bg-card">
        <GraduationCap className="text-muted-foreground mb-4" size={48} />
        <p className="text-muted-foreground">هذا القسم قيد التطوير — سيتم تفعيله قريباً.</p>
      </div>
    </div>
  );
}