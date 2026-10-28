import { Undo2 } from "lucide-react";
import { returnTool } from "@/services/depot";
import { ConfirmButton } from "@/components/ConfirmButton";
import { toast } from "@/lib/toast";
import { dateAz, fmt, type Holding, type Tool } from "@/pages/Depot/utils";

// Usta "Almadım" deyib: depo məsulu yoxlayır; doğrudursa depoya qaytarır (təhvil bağlanır)
export function DisputeRow({ h, tool }: { h: Holding; tool: Tool | undefined }) {
  const u = tool?.kind === "material" ? tool.unit : "ədəd";
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="w-[5.5rem] shrink-0 rounded-full bg-danger px-2 py-0.5 text-center text-[11px] font-bold text-white">Almadım</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm"><b className="font-semibold">{tool?.name ?? "—"}</b> <span className="text-ink/70">· {fmt(h.quantity)} {u}</span></span>
        <span className="muted block truncate text-xs">{h.employees?.full_name ?? "usta"} almadığını deyir · verilib {dateAz(h.taken_at)}</span>
      </span>
      <ConfirmButton className="btn btn-secondary btn-sm !h-8" title="Depoya qaytar" confirmLabel="Bəli, qaytar" success={false}
        question={`${tool?.name ?? "Alət"} (${fmt(h.quantity)} ${u}) ${h.employees?.full_name ?? "usta"} üzərindən götürülüb depoya qaytarılacaq.`}
        onConfirm={async () => {
          const r = await returnTool(h.id, h.quantity);
          if (r?.error) toast.error(r.error); else toast.success("Depoya qaytarıldı");
        }}>
        <Undo2 size={14} /> Depoya qaytar
      </ConfirmButton>
    </li>
  );
}
