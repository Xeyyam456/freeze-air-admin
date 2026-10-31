import { UserCog } from "lucide-react";
import type { EmptyManagersProps } from "@/types/management";

export function EmptyManagers({ canEdit }: EmptyManagersProps) {
  return (
    <div className="card py-12 text-center">
      <span className="icon-tile mx-auto"><UserCog size={20} /></span>
      <p className="mt-3 font-semibold">Hələ rəhbər yoxdur</p>
      {canEdit && <p className="muted text-sm">Yuxarıdakı «Yeni rəhbər» düyməsi ilə müdir, servis müdiri və ya maliyyəçini əlavə et.</p>}
    </div>
  );
}
