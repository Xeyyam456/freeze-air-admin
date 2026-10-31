import type { TextGroupNavProps } from "@/types/site";

// Mətn qruplarının siyahısı (solda); saxlanmamış dəyişikliyi olan qrupda nöqtə
export function TextGroupNav({ groups, current, onSelect, changedIn }: TextGroupNavProps) {
  return (
    <nav className="card h-fit !p-2">
      {groups.map((g) => (
        <button key={g.id} type="button" onClick={() => onSelect(g.id)}
          className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
            g.id === current ? "bg-primary-soft text-primary" : "text-ink hover:bg-bg"
          }`}>
          {g.title}
          {changedIn(g.id) && <span className="h-2 w-2 rounded-full bg-frost" title="Saxlanmamış dəyişiklik" />}
        </button>
      ))}
    </nav>
  );
}
