import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import type { Movement, RecentMovementsProps } from "@/types/depot";
import { localDate, dayOf, timeOf, dayLabel, KINDS, amount } from "../../utils/journal";

// Son hərəkətlər (Depo səhifəsinin sağ sütunu): hər iki növ, son 12; Realtime ilə yenilənir (revalidate)
export function RecentMovements({ onOpenAll, limit = 12 }: RecentMovementsProps) {
  const rows = useData("depot-tool-history", async () => {
    const { data } = await createClient().from("stock_movements").select("*, employees(full_name)").order("at", { ascending: false }).limit(limit);
    return (data ?? []) as Movement[];
  }, [limit]);
  // Zaman xətti: solda rəngli ikonlar şaquli xətlə bağlanır; ad + miqdar çipi, növ nişanı və kim, sağda vaxt
  return (
    <section className="flex h-full flex-col rounded-3xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="flex-1 text-[15px] font-bold">Son hərəkətlər</h2>
        <button type="button" onClick={onOpenAll}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-bg px-3 text-xs font-semibold text-ink/80 transition-colors hover:bg-primary hover:text-white">
          <History size={13} /> Bütün jurnal
        </button>
      </div>
      {rows === null ? (
        <ul className="space-y-3">{Array.from({ length: Math.min(limit, 5) }, (_, i) => <li key={i} className="h-11 animate-pulse rounded-xl bg-line/50" />)}</ul>
      ) : rows.length === 0 ? (
        <p className="muted rounded-2xl border border-dashed border-line py-6 text-center text-sm">Hələ hərəkət yoxdur.</p>
      ) : (
        <ol className="relative">
          <span aria-hidden className="absolute bottom-5 left-[17px] top-5 w-px bg-line" />
          {rows.map((m) => {
            const k = KINDS[m.kind] ?? KINDS.give;
            const Icon = k.icon;
            const qty = amount(m);
            return (
              <li key={m.id} className="relative flex items-center gap-3 rounded-xl py-2 pr-1 transition-colors hover:bg-bg">
                <span className={`relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-surface ${k.tone}`}><Icon size={15} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <b className="truncate text-[13.5px] font-semibold">{m.tool_name}</b>
                    {qty && <span className="shrink-0 rounded-md bg-bg px-1.5 py-px text-[11px] font-bold tabular-nums text-ink/80">{qty}</span>}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5 text-[11.5px]">
                    <span className={`shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold ${k.tone}`}>{k.label}</span>
                    <span className="muted truncate">{m.employees?.full_name ?? m.actor_name ?? ""}</span>
                  </span>
                </span>
                <span className="shrink-0 text-right text-[11px] tabular-nums leading-tight">
                  <b className="block font-semibold text-ink/80">{timeOf(m.at)}</b>
                  <span className="muted">{dayOf(m.at) === localDate() ? "bu gün" : dayLabel(dayOf(m.at))}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
