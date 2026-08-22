import React from "react";
import EmployeePortalScreen from "@/components/landing/EmployeePortalScreen";
import ApprovalPortalScreen from "@/components/landing/ApprovalPortalScreen";
import BankTransferScreen from "@/components/landing/BankTransferScreen";

export default function SceneScreen({ index }) {
  const screens = [<EmployeePortalScreen />, <ApprovalPortalScreen />, <BankTransferScreen />];
  if (!screens[index]) return null;
  return (
    <div className="absolute inset-y-0 left-0 z-10 hidden w-[42%] items-center justify-center overflow-hidden bg-primary/95 lg:flex">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90" />
      <div className="relative z-10">{screens[index]}</div>
    </div>
  );
}