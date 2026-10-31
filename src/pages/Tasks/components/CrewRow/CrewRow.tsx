import { Check, ChevronDown } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import type { CrewRowProps } from "@/types/tasks";
import { hasVideo, teamLabel } from "../../utils/labels";
import { GroupTaskRow } from "../GroupTaskRow";
import { VideoBadge } from "../VideoBadge";

// Eyni üzvlü qrup: başlıq (üzlər, adlar, tapşırıq sayı, vəziyyət); açılanda qrupun tapşırıqları
export function CrewRow({ crew, employees, open, onToggle, actions }: CrewRowProps) {
  const liveItems = crew.items.filter((g) => g.live.length > 0);
  const doneItems = liveItems.filter((g) => g.live.every((x) => x.done)).length;
  const crewVideo = crew.items.some((g) => hasVideo(g.rows));
  return (
    <li>
      <button type="button" onClick={onToggle} aria-expanded={open}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg ${open ? "bg-bg/70" : ""}`}>
        <span className="flex shrink-0 -space-x-2">
          {crew.ids.map((id) => employees.find((e) => e.id === id)).filter((e) => !!e).map((e) => (
            <Avatar key={e.id} employee={e} className="!h-9 !w-9 !text-[10px] !shadow-none ring-2 ring-surface max-sm:!h-7 max-sm:!w-7 max-sm:!text-[9px]" />
          ))}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold sm:truncate max-sm:leading-tight">{teamLabel(crew.ids, employees).split(" + ").map((n, i, all) => <span key={n} className="max-sm:block">{n}{i < all.length - 1 && <span className="max-sm:hidden"> + </span>}</span>)}</span>
          <span className="muted flex items-center gap-1.5 text-xs">{liveItems.length} tapşırıq{crewVideo && <VideoBadge className="" />}</span>
        </span>
        {liveItems.length > 0 && (doneItems === liveItems.length
          ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ok px-2.5 py-0.5 text-[11px] font-bold text-white"><Check size={12} strokeWidth={3} /> Hazır</span>
          : <span className="shrink-0 rounded-full bg-bg px-2.5 py-0.5 text-[11px] font-bold text-muted">{doneItems}/{liveItems.length} görülüb</span>)}
        <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="divide-y divide-line border-t border-line">
          {crew.items.map((g) => <GroupTaskRow key={g.id} g={g} actions={actions} />)}
        </ul>
      )}
    </li>
  );
}
