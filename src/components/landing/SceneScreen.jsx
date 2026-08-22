import React from "react";
import EmployeePortalScreen from "@/components/landing/EmployeePortalScreen";
import ApprovalPortalScreen from "@/components/landing/ApprovalPortalScreen";
import BankTransferScreen from "@/components/landing/BankTransferScreen";

export default function SceneScreen({ index }) {
  const screens = [<EmployeePortalScreen />, <ApprovalPortalScreen />, <BankTransferScreen />];
  if (!screens[index]) return null;
  return <div className="absolute left-8 top-24 z-10 hidden lg:block">{screens[index]}</div>;
}