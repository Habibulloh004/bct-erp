// src/components/Logo.tsx
import SmartPicture from '@/components/shared/SmartPicture';

export default function Logo() {
  return (
    <SmartPicture
      name="logo1"                 // src/assets/raw/logo.png -> "logo"
      alt="Company logo"
      sizes="(max-width:768px) 60px, 90px" // layoutga mos
      priority                    // LCP bo'lsa: tez yuklansin
      className="h-10 w-auto"     // ixtiyoriy
    />
  );
}
