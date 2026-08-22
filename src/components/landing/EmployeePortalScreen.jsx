import React from "react";
import { Image } from "@/components/ui/image";
import { PhoneFrame } from "@/components/landing/DeviceFrames";

// شاشة حقيقية من بوابة الموظف — نموذج طلب إجازة سنوية + تأكيد الإرسال
export default function EmployeePortalScreen() {
  return (
    <PhoneFrame>
      <Image
        src="https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/b939f0cd7_image.png"
        alt="بوابة الموظف — تقديم طلب إجازة سنوية"
        fittingType="fit"
        className="aspect-[9/19] w-full bg-[#0c2543]"
      />
    </PhoneFrame>
  );
}