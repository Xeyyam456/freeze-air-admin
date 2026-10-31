import { MapPin } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import { FileBadges } from "@/components/work/FileBadges";
import type { AllLogRowProps } from "@/types/dashboard";
import { allPlaceOf } from "../../utils/allLogs";
import { timeOf } from "@/components/work/WorkLogModal/utils/time";

// İş sətri: usta(lar), yer, görülən iş, fayl nişanları, saat
export function AllLogRow({ l, files, onOpen }: AllLogRowProps) {
  return (
    <li>
      <button type="button" onClick={() => onOpen(l.id)}
        className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-bg max-sm:items-center max-sm:gap-2 max-sm:px-1 max-sm:py-1.5">
        <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-9 !w-9 shrink-0 !text-xs max-sm:!h-8 max-sm:!w-8 max-sm:!text-[10px]" />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-semibold max-sm:flex max-sm:min-w-0 max-sm:basis-full max-sm:flex-col max-sm:text-[13px] max-sm:leading-tight">{(l.employees?.full_name ?? "—").split(" + ").map((n, i, all) => <span key={n} className="max-sm:min-w-0"><span className="block sm:hidden">{n}</span><span className="max-sm:hidden">{n}{i < all.length - 1 && " + "}</span></span>)}</span>
            <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-primary max-sm:basis-full max-sm:text-[11px]"><MapPin size={12} className="shrink-0" /> <span className="truncate">{allPlaceOf(l)}</span></span>
          </span>
          <span className="muted mt-0.5 line-clamp-1 block text-sm max-sm:hidden">{l.description}</span>
        </span>
        <FileBadges files={files} />
        <span className="shrink-0 text-sm font-semibold tabular-nums max-sm:text-xs">{timeOf(l.created_at)}</span>
      </button>
    </li>
  );
}
