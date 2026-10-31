import { X } from "lucide-react";
import type { ProfileBannerProps } from "@/types/employees";

// Məlumat pəncərəsinin başlıq zolağı: header ilə eyni rəng keçidi, şəkil zolağın üstünə çıxır
export function ProfileBanner({ onClose }: ProfileBannerProps) {
  return (
    <div className="relative h-24 bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)]">
      <button type="button" onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Bağla">
        <X size={18} />
      </button>
    </div>
  );
}
