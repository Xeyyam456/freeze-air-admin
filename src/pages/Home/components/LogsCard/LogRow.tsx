import { MapPin } from "lucide-react";
import { FileBadges } from "@/components/work/FileBadges";
import { timeOf } from "@/components/work/WorkLogModal";
import { Avatar } from "@/shared/components/Avatar";
import { localDate } from "@/shared/utils/localDate";
import type { LogRowProps } from "@/types/dashboard";
import { ago } from "../../utils/dateText";
import { placeOf } from "../../utils/placeOf";

// İş qeydinin sətri: klik → işin ətraflı pəncərəsi
export function LogRow({ log: l, files, onOpen }: LogRowProps) {
  return (
    <li>
      <button type="button" onClick={onOpen}
        className="group flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-bg max-sm:gap-2 max-sm:px-0 max-sm:py-1.5">
        <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-10 !w-10 shrink-0 !text-xs max-sm:!h-7 max-sm:!w-7 max-sm:!text-[9px]" />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-semibold max-sm:flex max-sm:min-w-0 max-sm:basis-full max-sm:flex-col max-sm:text-[12px] max-sm:leading-tight">{(l.employees?.full_name ?? "—").split(" + ").map((n, i, all) => <span key={n} className="max-sm:min-w-0"><span className="block truncate sm:hidden">{n}</span><span className="max-sm:hidden">{n}{i < all.length - 1 && " + "}</span></span>)}</span>
            <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-primary max-sm:basis-full max-sm:text-[11px]"><MapPin size={12} className="shrink-0" /> <span className="truncate">{placeOf(l)}</span></span>
          </span>
          <span className="muted mt-0.5 block truncate text-sm max-sm:line-clamp-1 max-sm:text-[12px] max-sm:leading-snug">{l.description}</span>
        </span>
        <FileBadges files={files} />
        <span className="shrink-0 text-right">
          <span className="block text-sm font-semibold tabular-nums max-sm:text-xs">{timeOf(l.created_at)}</span>
          <span className="muted block text-[11px] max-sm:hidden">{l.work_date === localDate() ? ago(l.created_at) : l.work_date.split("-").reverse().join(".")}</span>
        </span>
      </button>
    </li>
  );
}
