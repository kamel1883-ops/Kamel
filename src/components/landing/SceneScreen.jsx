import React from "react";
import EmployeePortalScreen from "@/components/landing/EmployeePortalScreen";
import ApprovalPortalScreen from "@/components/landing/ApprovalPortalScreen";
import BankTransferScreen from "@/components/landing/BankTransferScreen";

export default function SceneScreen({ index }) {
  const screens = [<EmployeePortalScreen />, <ApprovalPortalScreen />, <BankTransferScreen />];
  if (!screens[index]) return null;
  return (
    <div className="pointer-events-none absolute left-10 top-1/2 z-10 hidden -translate-y-1/2 scale-90 drop-shadow-2xl lg:block">
      {screens[index]}
    </div>
  );
}