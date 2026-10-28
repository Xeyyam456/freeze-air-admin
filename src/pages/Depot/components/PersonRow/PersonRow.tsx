import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/employees/EmployeeForms";
import type { Tone } from "@/pages/Depot/components/ui";
import { fmt, type DepotEmployee, type Holding, type Kind, type Tool } from "@/pages/Depot/utils";
import { StatusDot } from "@/pages/Depot/components/StatusDot";
import { HoldMenu } from "@/pages/Depot/components/HoldMenu";

// Ustalar cədvəlinin sətri: şəkil + ad + say xülasəsi, üzərindəki alətlər və materiallar (açılan siyahı), vəziyyət
export function PersonRow({ emp, holds, toolInfo, onOpen }: {
  emp: DepotEmployee; holds: Holding[]; toolInfo: Map<number, Tool>; onOpen: (kind: Kind) => void;
}) {
  const tools = holds.filter((h) => toolInfo.get(h.tool_id)?.kind !== "material");
  const mats = holds.filter((h) => toolInfo.get(h.tool_id)?.kind === "material");
  const toolsN = tools.reduce((n, h) => n + h.quantity, 0);
  const waiting = holds.filter((h) => !h.received_at && !h.disputed_at).length;
  const st: { tone: Tone; label: string } = holds.some((h) => h.disputed_at && !h.received_at) ? { tone: "red", label: "«Almadım» deyib" }
    : waiting ? { tone: "amber", label: `${waiting} «Aldım» gözləyir` } : holds.length ? { tone: "green", label: "Qaydasındadır" } : { tone: "slate", label: "Heç nə yoxdur" };
  const item = (h: Holding) => {
    const t = toolInfo.get(h.tool_id);
    return { name: t?.name ?? "—", qty: t?.kind === "material" ? `${fmt(h.quantity)} ${t.unit}` : h.quantity > 1 ? `×${h.quantity}` : "" };
  };
  const first: Kind = !tools.length && mats.length ? "material" : "tool";
  return (
    <tr tabIndex={0} onClick={() => onOpen(first)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && onOpen(first)}
      className="group cursor-pointer border-t border-line transition-colors hover:bg-[#faf8ff] focus-visible:outline-2 focus-visible:outline-primary">
      <td className="py-3 pl-5 pr-3 max-sm:pl-3 max-sm:pr-1">
        <span className="flex items-center gap-3 max-sm:gap-2.5">
          <span className="relative shrink-0">
            <Avatar employee={emp} className="!h-10 !w-10 !text-xs ring-2 ring-[#ede9fe] max-sm:!h-9 max-sm:!w-9" />
            {holds.length > 0 && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#8b5cf6] ring-2 ring-surface" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14.5px] font-semibold group-hover:text-[#6d28d9] max-sm:text-[13px]">{emp.full_name}</span>
            <span className="muted block truncate text-xs max-sm:text-[11px]">{toolsN ? `${toolsN} ədəd alət` : "alət yoxdur"} · {mats.length ? `${mats.length} növ material` : "material yoxdur"}</span>
          </span>
        </span>
      </td>
      <td className="px-3 py-3 max-sm:hidden"><HoldMenu items={tools.map(item)} tone="blue" word="alət" onOpen={() => onOpen("tool")} /></td>
      <td className="px-3 py-3 max-sm:hidden"><HoldMenu items={mats.map(item)} tone="teal" word="material" onOpen={() => onOpen("material")} /></td>
      <td className="px-3 py-3 max-md:hidden"><StatusDot tone={st.tone} label={st.label} /></td>
      <td className="py-3 pl-3 pr-5 text-right max-sm:pr-3">
        <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-bg text-muted transition group-hover:bg-[#7c3aed] group-hover:text-white"><ArrowRight size={15} /></span>
      </td>
    </tr>
  );
}
