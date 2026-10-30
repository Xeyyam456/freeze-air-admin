import { useActionState, useState } from "react";
import { Users } from "lucide-react";
import { giveTool } from "@/services/depot/assignments";
import { ActionForm, useOnSuccess } from "@/components/forms";
import { giveLimitText, QuantityInput } from "@/components/QuantityInput";
import { ToolPicker } from "@/components/ToolPicker";
import { toast } from "@/lib/toast";
import { isPacked, round2 } from "../../utils/quantity";
import type { GiveFormProps } from "@/types/depot";
import { MiniSeg } from "../MiniSeg";
import { Button } from "@/shared/components/Button";

// Ustaya ver. Qablı materialda say balonla (standart) və ya kq ilə yazılır; baza həmişə ölçü vahidi ilə işləyir (1 balon → 11,3 kq).
export function GiveForm({ tool, employees, onDone }: GiveFormProps) {
  const [state, action, pending] = useActionState(giveTool, null);
  const [picked, setPicked] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);
  const packed = isPacked(tool);
  const [byPack, setByPack] = useState(packed);
  useOnSuccess(state, () => { setPicked(null); setFormKey((k) => k + 1); onDone?.(); }, "Verildi: usta «Aldım» ilə təsdiqləyəcək");
  // Alət/material yalnız ustaya verilir (rəhbərlik siyahıda yoxdur; bazada da trigger yoxlayır)
  const items = employees.filter((e) => !e.is_management).map((e) => ({ id: e.id, name: e.full_name }));
  const factor = packed && byPack ? tool.pack_size : 1;
  const unitLabel = packed && byPack ? tool.pack_name : tool.kind === "material" ? tool.unit : "ədəd";
  const limit = packed && byPack ? Math.floor(round2(tool.available / factor)) : tool.available;

  // Göndərməzdən əvvəl də yoxla: say depodakından çoxdursa, sorğu getmir, tost çıxır
  function submit(fd: FormData) {
    const wanted = Number(fd.get("quantity"));
    const amount = round2(wanted * factor);
    if (!(amount > 0)) return toast.error("Miqdar 0-dan çox olmalıdır.");
    if (tool.kind === "tool" && !Number.isInteger(amount)) return toast.error("Alətin sayı tam ədəd olmalıdır.");
    if (amount > tool.available) return toast.error(giveLimitText(limit, wanted, unitLabel));
    fd.set("quantity", String(amount));
    action(fd);
  }

  if (!(tool.available > 0)) {
    return <p className="muted py-2 text-center text-sm">Depoda boş qalmayıb.</p>;
  }
  return (
    <ActionForm key={formKey} action={submit} className="flex flex-wrap gap-2">
      <input type="hidden" name="tool_id" value={tool.id} />
      <div className="min-w-[8rem] flex-1 max-sm:basis-full">
        <ToolPicker items={items} value={picked} onChange={setPicked} name="employee_id" icon={Users}
          placeholder="Kimə verilir?" emptyLabel="Aktiv əməkdaş yoxdur" searchLabel="Usta axtar..." />
      </div>
      <QuantityInput key={String(byPack)} limit={limit} limitText={(l, w) => giveLimitText(l, w, unitLabel)} className="max-sm:!h-7 max-sm:!w-16 max-sm:!text-xs" />
      {/* Vahid sahənin yanında: balonda keçid, qalanında materialın öz vahidi (metr, kq...) və ya "ədəd" */}
      {packed
        ? <span className="self-center"><MiniSeg value={byPack} onChange={setByPack} items={[[true, tool.pack_name], [false, tool.unit]]} label="Vahid" /></span>
        : <span className="muted self-center text-sm">{unitLabel}</span>}
      <Button size="sm" type="submit" disabled={pending || !picked} className="!h-9 max-sm:!h-7 max-sm:!px-4 max-sm:!text-[11px]">{pending ? "..." : "Ver"}</Button>
    </ActionForm>
  );
}
