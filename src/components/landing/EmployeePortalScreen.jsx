import React from "react";
import { Image } from "@/components/ui/image";
import { PhoneFrame } from "@/components/landing/DeviceFrames";

export default function EmployeePortalScreen() {
  return (
    <PhoneFrame>
      <Image
        src="https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/0f71ef715_image.png"
        alt="شاشة جدارة لرفع طلب إجازة من بوابة الموظف"
        fittingType="fit"
        className="aspect-[4/5] w-full bg-white"
      />
    </PhoneFrame>
  );
}