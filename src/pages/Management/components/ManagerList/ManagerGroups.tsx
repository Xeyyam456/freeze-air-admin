import type { ManagerGroupsProps } from "@/types/management";
import { rank } from "../../utils/rank";
import { LeadCard } from "../LeadCard";
import { ManagerCard } from "../ManagerCard";

// Müdir iri kartda üstdə, qalan rəhbərlər altda kartlar şəbəkəsində
export function ManagerGroups({ filtered, cardOf }: ManagerGroupsProps) {
  const lead = filtered[0] && rank(filtered[0].position) === 0 ? filtered[0] : null;
  const rest = lead ? filtered.slice(1) : filtered;

  return (
    <>
      {lead && <LeadCard {...cardOf(lead)} />}
      {rest.length > 0 && (
        <section>
          <h2 className="muted mb-3 text-xs font-semibold uppercase tracking-wider">{lead ? "Komanda rəhbərləri" : "Rəhbərlik"} · {rest.length}</h2>
          <div className="flex flex-wrap gap-4">
            {rest.map((m) => (
              <div key={m.id} className="flex min-w-0 grow basis-[320px] [&>*]:flex-1"><ManagerCard {...cardOf(m)} /></div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
