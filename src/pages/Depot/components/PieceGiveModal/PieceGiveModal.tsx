import { useState } from "react";
import { PackageOpen, Users } from "lucide-react";
import { givePiece } from "@/services/depot";
import { Modal } from "@/shared/components/Modal";
import { QuantityInput } from "@/components/QuantityInput";
import { ToolPicker } from "@/components/ToolPicker";
import { toast } from "@/lib/toast";
import { DHead } from "@/pages/Depot/components/ui";
import { fmt, isPacked, pieceWord, round2, type DepotEmployee, type Piece, type Tool } from "@/pages/Depot/utils";

// Parçanı kimə və nə qədər verəsən: hamısı və ya bir hissəsi (qalan hissə depoda parça kimi qalır).
// Açıq balon bölünmür: bütöv verilir.
export function PieceGiveModal({ piece, tool, employees, onClose }: { piece: Piece; tool: Tool; employees: DepotEmployee[]; onClose: () => void }) {
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
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <ToolPicker items={items} value={picked} onChange={setPicked} name="employee_id" icon={Users}
            placeholder="Kimə verilir?" emptyLabel="Aktiv əməkdaş yoxdur" searchLabel="Usta axtar..." />
        </div>
        <button type="button" disabled={pending || !valid} onClick={give} className="btn btn-primary btn-sm !h-9">{pending ? "..." : "Ver"}</button>
      </div>
    </Modal>
  );
}
