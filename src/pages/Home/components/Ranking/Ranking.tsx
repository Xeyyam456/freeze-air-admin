import { Trophy } from "lucide-react";
import { Avatar } from "@/components/employees/EmployeeForms";
import type { RankingProps } from "@/types/dashboard";

// Ustalar üzrə reyting: nazik parlayan zolaqlar, klik → ustanın işləri
export function Ranking({ ranking, onUsta }: RankingProps) {
  const maxN = ranking[0]?.n ?? 1;
  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur max-sm:p-3">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold"><Trophy size={16} className="text-frost" /> Ustalar üzrə</h3>
      {ranking.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/60">Aktiv usta yoxdur.</p>
      ) : (
        // 6 usta görünür (hər sətir ~49px + 14px aralıq = 366px), çoxdursa gizli zolaqla sürüşür və aşağıda solğunlaşır
        <ul className={`max-h-[366px] space-y-3.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          ranking.length > 6 ? "[mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)]" : ""}`}>
          {ranking.map((r, i) => (
            <li key={r.id}>
              <button type="button" onClick={() => onUsta(r.members[0].full_name)} disabled={r.n === 0} title={r.n ? `${r.members.map((m) => m.full_name).join(" + ")}: işlərinə bax` : "Bu ay iş yazmayıb"}
                className="group w-full text-left disabled:cursor-default">
                <span className="flex items-center gap-2.5">
                  <span className="w-4 shrink-0 text-center text-xs font-bold tabular-nums text-white/40">{i + 1}</span>
                  <span className="flex shrink-0 -space-x-3">
                    {r.members.slice(0, 2).map((m) => <Avatar key={m.id} employee={m} className="!h-8 !w-8 !text-[11px] ring-2 ring-[#0f2a44] max-sm:!h-7 max-sm:!w-7 max-sm:!text-[10px]" />)}
                  </span>
                  <span className={`min-w-0 flex-1 truncate text-sm font-semibold max-sm:text-[12.5px] ${r.n ? "text-white group-hover:text-frost" : "text-white/40"}`}>{r.members.length > 1 ? r.members.map((m) => m.full_name.split(" ").slice(-1)[0]).join(" + ") : r.members[0].full_name}</span>
                  <span className={`shrink-0 text-sm font-bold tabular-nums ${r.n ? "text-white" : "text-white/40"}`}>{r.n}</span>
                </span>
                <span className="ml-[26px] mt-1.5 block h-1.5 max-sm:ml-[22px] overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#6da7ec] shadow-[0_0_10px_rgba(45,212,191,0.7)] transition-[width] duration-500"
                    style={{ width: `${r.n ? Math.max(6, (r.n / maxN) * 100) : 0}%` }} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
