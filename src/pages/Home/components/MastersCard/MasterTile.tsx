import { Avatar } from "@/shared/components/Avatar";
import type { MasterTileProps } from "@/types/dashboard";

// Usta (və ya qrup) kartı: sağda bugünkü iş sayı nişanı (klik → işlər)
export function MasterTile({ card: c, onOpenLogs }: MasterTileProps) {
  const crew = c.members.length > 1;
  const m = c.members[0];
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 max-lg:gap-2.5 max-lg:px-2.5 max-lg:py-1.5">
      <span className="relative flex shrink-0 -space-x-3">
        {c.members.slice(0, 3).map((e) => <Avatar key={e.id} employee={e} className="!h-10 !w-10 !text-xs ring-2 ring-surface max-lg:!h-8 max-lg:!w-8 max-lg:!text-[10px]" />)}
        {!crew && <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface max-lg:h-3 max-lg:w-3 ${c.n ? "bg-ok" : "bg-line"}`} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold max-lg:text-[13px] max-lg:leading-tight" title={c.members.map((e) => e.full_name).join(" + ")}>{crew ? c.members.map((e) => e.full_name.split(" ").slice(-1)[0]).join(" + ") : m.full_name}</span>
        <span className="muted block truncate text-xs max-lg:text-[11px] max-lg:leading-tight">{crew ? "Qrup işi" : m.specialty ?? "Usta"}</span>
      </span>
      {c.n > 0 ? (
        <button type="button" onClick={() => onOpenLogs(m.full_name)} title={`Bu gün ${c.n} iş: bax`}
          className="flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-full bg-ok px-2.5 text-sm font-bold text-white max-lg:h-7 max-lg:min-w-7 max-lg:px-2 max-lg:text-xs shadow-[0_4px_10px_rgba(18,161,80,0.3)] transition-transform hover:scale-105">
          {c.n} <span className="text-[10px] font-semibold opacity-90">iş</span>
        </button>
      ) : (
        <span className="grid h-8 min-w-8 shrink-0 place-items-center rounded-full bg-bg px-2.5 text-sm font-bold text-muted max-lg:h-7 max-lg:min-w-7 max-lg:px-2 max-lg:text-xs" title="Bu gün iş yazmayıb">0</span>
      )}
    </li>
  );
}
