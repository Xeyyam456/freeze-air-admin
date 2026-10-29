import { Building2, Check, MapPin, Store, Undo2 } from "lucide-react";
import type { TaskStatusIconProps } from "@/types/tasks";

// Tapşırığın vəziyyəti: geri alınıb / görülüb / görülməyib (yerin ikonu: mağaza, şirkət, yazılan yer)
export function TaskStatusIcon({ t, cancelled, done }: TaskStatusIconProps) {
  const PlaceIcon = t.stores ? Store : t.companies ? Building2 : MapPin;
  return (
    <span title={cancelled ? "Geri alınıb" : done ? "Görülüb" : "Görülməyib"}
      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg max-sm:h-6 max-sm:w-6 max-sm:rounded-md max-sm:[&_svg]:!h-3.5 max-sm:[&_svg]:!w-3.5 ${
        cancelled ? "bg-bg text-muted" : done ? "bg-ok text-white" : "bg-primary-soft text-primary"}`}>
      {cancelled ? <Undo2 size={15} /> : done ? <Check size={16} strokeWidth={3} /> : <PlaceIcon size={15} />}
    </span>
  );
}
