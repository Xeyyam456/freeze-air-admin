import { MapPin } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import { FileBadges } from "@/components/work/FileBadges";
import { timeOf } from "@/components/work/WorkLogModal";
import type { SoloRowProps } from "@/types/workLogs";
import { placeOf } from "../../utils/logs";

// Tək iş: usta, yer, görülən iş, fayl nişanları, saat; klik → iş pəncərəsi
export function SoloRow({ l, files, onOpen }: SoloRowProps) {
  return (
    <li className="border-b border-line last:border-b-0">
      <button type="button" onClick={() => onOpen(l.id)}
        className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-primary-soft/40 max-sm:gap-2 max-sm:px-3 max-sm:py-2">
        <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-9 !w-9 shrink-0 !text-xs max-sm:!h-7 max-sm:!w-7 max-sm:!text-[9px]" />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-semibold">{l.employees?.full_name ?? "—"}</span>
            <span className="flex min-w-0 items-center gap-1 truncate text-xs font-semibold text-primary"><MapPin size={12} /> {placeOf(l)}</span>
          </span>
          <span className="muted mt-0.5 line-clamp-1 block text-sm max-sm:line-clamp-3 max-sm:text-xs">{l.description}</span>
        </span>
        <FileBadges files={files} />
        <span className="shrink-0 text-sm font-semibold tabular-nums">{timeOf(l.created_at)}</span>
      </button>
    </li>
  );
}
