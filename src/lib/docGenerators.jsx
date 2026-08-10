import React from "react";
import { base44 } from "@/api/base44Client";
import { renderToPdfBlob, uploadPdfBlob } from "@/lib/pdfDocs";
import { computeEntitlement, sumUsedDays, getEmployeeAnnualDays } from "@/lib/leaveBalance";
import LeaveClearanceDoc from "@/components/docs/LeaveClearanceDoc";
import LoanStatementDoc from "@/components/docs/LoanStatementDoc";
import BusinessTripApprovalDoc from "@/components/docs/BusinessTripApprovalDoc";

// مخالصة تصفية إجازة — تُولّد PDF، تُرفع، وتُخزّن على الطلب + تُرجع الرابط
export async function generateLeaveSettlement(leave, emp, org, allLeavesForEmp) {
  const annualDays = getEmployeeAnnualDays(emp, org);
  const asOf = leave?.end_date ? new Date(leave.end_date) : new Date();
  const entitlement = computeEntitlement(emp?.hire_date, annualDays, asOf);
  const others = (allLeavesForEmp || []).filter((l) => l.id !== leave.id);
  const usedBefore = sumUsedDays(others);
  const bBefore = Math.max(0, Math.round((entitlement - usedBefore) * 10) / 10);
  const bAfter = Math.max(0, Math.round((bBefore - (Number(leave.days_count) || 0)) * 10) / 10);

  const blob = await renderToPdfBlob(
    <LeaveClearanceDoc employee={emp} leave={leave} org={org} balanceBefore={bBefore} balanceAfter={bAfter} />
  );
  const url = await uploadPdfBlob(blob, `leave-settlement-${leave.id}.pdf`);
  await base44.entities.LeaveRequest.update(leave.id, {
    settlement_pdf_url: url,
    balance_before: bBefore,
    balance_after: bAfter,
  });
  return url;
}

// كشف سلفة — تُولّد PDF محدّث بالمدفوع/المتبقي وتُخزّن على الطلب
export async function generateLoanStatement(loan, emp, org) {
  const blob = await renderToPdfBlob(<LoanStatementDoc employee={emp} loan={loan} org={org} />);
  const url = await uploadPdfBlob(blob, `loan-statement-${loan.id}.pdf`);
  await base44.entities.LoanRequest.update(loan.id, { statement_pdf_url: url });
  return url;
}

// مستند موافقة الانتداب — يُولّد PDF بتفاصيل الرحلة والملاحظات ويُخزّن على الطلب، ويُرجع الرابط
export async function generateBusinessTripApproval(trip, emp, org) {
  const blob = await renderToPdfBlob(<BusinessTripApprovalDoc employee={emp} trip={trip} org={org} />);
  const url = await uploadPdfBlob(blob, `trip-approval-${trip.id}.pdf`);
  await base44.entities.BusinessTrip.update(trip.id, { approval_pdf_url: url });
  return url;
}