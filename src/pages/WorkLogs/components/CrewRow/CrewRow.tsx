import { ChevronDown, MapPin, Play, Users } from "lucide-react";
import { FileBadges } from "@/components/work/FileBadges";
import type { CrewRowProps } from "@/types/workLogs";
import { placeOf } from "../../utils/logs";
import { timeOf } from "@/components/work/WorkLogModal/utils/time";

// Eyni üzvlü qrupun işləri bir açılan sətirdə (bağlı başlayır); bağlı halda da videolu iş görünür
export function CrewRow({ names, logs, open, onToggle, filesOf, onOpen }: CrewRowProps) {
  return (
    <li className="border-b border-line last:border-b-0">
      <button type="button" onClick={onToggle} aria-expanded={open}
        className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-primary-soft/40 max-sm:gap-2 max-sm:px-3 max-sm:py-2 ${open ? "bg-primary-soft/30" : ""}`}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary max-sm:h-7 max-sm:w-7"><Users size={16} className="max-sm:!h-3.5 max-sm:!w-3.5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold max-sm:text-[13px] max-sm:leading-tight sm:truncate">{names.split(" + ").map((n, i, all) => <span key={n} className="max-sm:block">{n}{i < all.length - 1 && <span className="max-sm:hidden"> + </span>}</span>)}</span>
          <span className="muted flex items-center gap-1.5 text-xs">Qrup işi · {logs.length} iş
            {/* Bağlı qrupda da videolu iş görünsün */}
            {logs.some((l) => (filesOf(l)?.video ?? 0) > 0) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-1.5 py-px text-[10px] font-bold text-violet-700"><Play size={9} fill="currentColor" /> Video</span>
            )}
          </span>
        </span>
        <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="border-t border-line bg-[#fbfcfe]">
          {logs.map((l) => (
            <li key={l.id} className="border-b border-line last:border-b-0">
              <button type="button" onClick={() => onOpen(l.id)}
                className="flex w-full items-start gap-3 py-3 pl-[76px] pr-5 text-left transition-colors hover:bg-primary-soft/40 max-sm:flex-wrap max-sm:gap-x-2 max-sm:gap-y-1 max-sm:px-3 max-sm:py-2">
                <span className="min-w-0 flex-1 max-sm:contents">
                  <span className="flex min-w-0 items-center gap-1 truncate text-sm font-semibold text-primary max-sm:min-w-0 max-sm:flex-1 max-sm:text-[13px]"><MapPin size={13} className="shrink-0" /> <span className="truncate">{placeOf(l)}</span></span>
                  <span className="muted mt-0.5 line-clamp-1 block text-sm max-sm:order-last max-sm:mt-0 max-sm:line-clamp-5 max-sm:basis-full max-sm:text-xs max-sm:leading-snug">{l.description}</span>
                </span>
                <FileBadges files={filesOf(l)} />
                <span className="shrink-0 text-sm font-semibold tabular-nums max-sm:text-xs">{timeOf(l.created_at)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
