import React from "react";
import EmployeePortalScreen from "@/components/landing/EmployeePortalScreen";
import ApprovalPortalScreen from "@/components/landing/ApprovalPortalScreen";
import BankTransferScreen from "@/components/landing/BankTransferScreen";

export default function SceneScreen({ index }) {
  const screens = [<EmployeePortalScreen />, <ApprovalPortalScreen />, <BankTransferScreen />];
  if (!screens[index]) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B2545]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] via-[#14315a] to-[#0B2545]" />
      <div className="relative z-10 scale-90 lg:scale-100">{screens[index]}</div>
    </div>
  );
}