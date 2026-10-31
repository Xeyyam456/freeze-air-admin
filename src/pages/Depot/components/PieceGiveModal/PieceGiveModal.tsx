import { useState } from "react";
import { PackageOpen, Users } from "lucide-react";
import { givePiece } from "@/services/depot/assignments";
import { Modal } from "@/shared/components/Modal";
import { QuantityInput } from "@/components/QuantityInput";
import { ToolPicker } from "@/shared/components/ToolPicker";
import { toast } from "@/lib/toast";
import { DHead } from "../DHead";
import { fmt, isPacked, pieceWord, round2 } from "../../utils/quantity";
import type { PieceGiveModalProps } from "@/types/depot";
import { Button } from "@/shared/components/Button";

// Parçanı kimə və nə qədər verəsən: hamısı və ya bir hissəsi (qalan hissə depoda parça kimi qalır).
// Açıq balon bölünmür: bütöv verilir.
export function PieceGiveModal({ piece, tool, employees, onClose }: PieceGiveModalProps) {
  const unit = tool.unit;
  const whole = isPacked(tool);
  const [picked, setPicked] = useState<number | null>(null);
  const [amount, setAmount] = useState(piece.length);
  const [pending, setPending] = useState(false);
  const items = employees.filter((e) => !e.is_management).map((e) => ({ id: e.id, name: e.full_name }));
  const valid = !!picked && amount > 0 && amount <= piece.length;
  const rest = round2(piece.length - amount);

  async function give() {
    if (!valid || !picked) return;
    setPending(true);
    const r = await givePiece(piece.id, picked, whole ? undefined : round2(amount));
    setPending(false);
    if (r?.error) return toast.error(r.error);
    toast.success("Verildi");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="piece-give-title" className="!max-w-md">
      <DHead id="piece-give-title" icon={PackageOpen} tone="violet" title={tool.name} sub={`${pieceWord(tool)}: ${fmt(piece.length)} ${unit}`} onClose={onClose} />
      {!whole && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-semibold">Nə qədər</span>
          <QuantityInput limit={piece.length} defaultValue={piece.length} className="!w-20" onValue={setAmount}
            limitText={(limit) => `Parçada cəmi ${fmt(limit)} ${unit} var.`} />
          <span className="muted text-sm">{unit}{valid && rest > 0 ? ` · ${fmt(rest)} ${unit} depoda qalır` : ""}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <ToolPicker items={items} value={picked} onChange={setPicked} name="employee_id" icon={Users}
            placeholder="Kimə verilir?" emptyLabel="Aktiv əməkdaş yoxdur" searchLabel="Usta axtar..." />
        </div>
        <Button size="sm" disabled={pending || !valid} onClick={give} className="!h-9 max-sm:!h-7 max-sm:!px-3 max-sm:!text-[11px]">{pending ? "..." : "Ver"}</Button>
      </div>
    </Modal>
  );
}
