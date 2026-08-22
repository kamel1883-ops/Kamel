import React from "react";
import { Image } from "@/components/ui/image";
import { LaptopFrame } from "@/components/landing/DeviceFrames";

// شاشة حقيقية من بوابة الشركات — طلب إجازة بانتظار اعتماد الموارد البشرية
export default function CompanyPortalScreen() {
  return (
    <LaptopFrame>
      <Image
        src="https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/93ad9354b_image.png"
        alt="بوابة الشركات — طلب إجازة بانتظار الموافقة"
        fittingType="fill"
        className="aspect-[16/10] w-full bg-[#0d223f]"
      />
    </LaptopFrame>
  );
}