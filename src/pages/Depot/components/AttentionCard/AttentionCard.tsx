import { ArrowRight, CheckCircle2, Wrench } from "lucide-react";
import { SOFT, type Tone } from "@/pages/Depot/components/ui";

// Diqqət: dörd sətir həmişə görünür (yanındakı "Son hərəkətlər" ilə eyni hündürlükdə, simmetrik); 0 olanlar sakit, yaşıl ✓ ilə
export function AttentionCard({ items }: { items: { icon: typeof Wrench; tone: Tone; label: string; hint: string; n: number; onClick: () => void }[] }) {
  const clear = items.every((i) => i.n === 0);
  return (
    <section className="flex h-full flex-col rounded-3xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="flex-1 text-[15px] font-bold">Diqqət</h2>
        {clear && <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#ecfbf1] px-3 text-xs font-semibold text-[#15803d]"><CheckCircle2 size={13} /> Hər şey qaydasındadır</span>}
      </div>
      <ul className="grid flex-1 content-between gap-2">
        {items.map((i) => {
          const on = i.n > 0;
          return (
            <li key={i.label}>
              <button type="button" onClick={i.onClick} disabled={!on}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${on ? "border-line hover:bg-bg" : "cursor-default border-transparent bg-bg/60"}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${on ? SOFT[i.tone] : SOFT.green}`}>
                  {on ? <i.icon size={17} /> : <CheckCircle2 size={17} />}
                </span>
                <span className="min-w-0 flex-1">
                  <b className={`block text-sm ${on ? "" : "font-semibold text-ink/60"}`}>{i.label}</b>
                  <span className="muted block truncate text-xs">{on ? i.hint : "yoxdur"}</span>
                </span>
                <span className={`text-xl font-extrabold tabular-nums ${on ? "" : "text-muted/60"}`}>{i.n}</span>
                <ArrowRight size={16} className={on ? "text-muted" : "invisible"} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
