import { initials } from "@/lib/experience";
import type { RequestListProps } from "@/types/requests";
import { agoShort, toneOf } from "../utils/requestFormat";

// Solda siyahı: ad, yeni nöqtəsi, vaxt, mesajın əvvəli
export function RequestList({ list, selectedId, onSelect }: RequestListProps) {
  return (
    <ul className="card nice-scroll !p-2 lg:h-[calc(100dvh/var(--zoom)-300px)] lg:min-h-[380px] lg:overflow-y-auto">
      {list.map((r) => (
        <li key={r.id}>
          <button type="button" onClick={() => onSelect(r.id)}
            className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${selectedId === r.id ? "bg-primary-soft" : "hover:bg-bg"}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${toneOf(r.name)} text-xs font-bold text-white`}>
              {initials(r.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className={`truncate text-sm ${r.handled ? "font-medium" : "font-bold"}`}>{r.name}</span>
                {!r.handled && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" title="Yeni" />}
                <span className="muted ml-auto shrink-0 text-[11px]">{agoShort(r.created_at)}</span>
              </span>
              <span className="muted mt-0.5 block truncate text-xs">{r.message || r.phone}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
