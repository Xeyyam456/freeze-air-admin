import { useState } from "react";
import { History, Package, PackagePlus, Send, Trash2, Wrench } from "lucide-react";
import { RepairModal } from "../RepairModal";
import { WriteoffModal } from "../WriteoffModal";
import { HistoryModal } from "../HistoryModal";
import { Modal } from "@/shared/components/Modal";
import type { Kind, ToolModalProps } from "@/types/depot";
import { fmt, isPacked } from "../../utils/quantity";
import { DAction } from "../DAction";
import { DHead } from "../DHead";
import { DSection } from "../DSection";
import { EditToolModal } from "../EditToolModal";
import { GiveForm } from "../GiveForm";
import { HolderRow } from "../HolderRow";
import { PieceRow } from "../PieceRow";
import { RepairRow } from "../RepairRow";
import { ToolHeadActions } from "../ToolHeadActions";
import { ToolLosses } from "../ToolLosses";
import { ToolStats } from "../ToolStats";

// Alətin / materialın pəncərəsi (2026-10-23 yeni dizayn): başlıq (rəngli ikon, ad, ölçü; redaktə, sil), 3 göstərici,
// "Ustaya ver" kartı, əməliyyat kafelləri (Mədaxil, Silinmə, Təmirə, Hərəkətlər), Kimdədir, Təmirdə, Açıq balonlar / Parçalar.
export function ToolModal({ tool, holders, pieces, repairs, losses = [], requests, employees, canManage, onReceipt, onClose }: ToolModalProps) {
  const [editing, setEditing] = useState(false);
  const [doc, setDoc] = useState<"writeoff" | "repair" | "history" | null>(null);
  const kind = tool.kind as Kind;
  const material = kind === "material";
  const unit = material ? tool.unit : "ədəd";
  const empty = tool.quantity === 0 && tool.pieces_total === 0 && holders.length === 0;
  const pendingPieces = new Set(requests.filter((r) => r.type === "writeoff" && r.piece_id).map((r) => r.piece_id!));
  const pendingReturns = new Set(requests.filter((r) => r.type === "return" && r.assignment_id).map((r) => r.assignment_id!));
  const measure = !material ? "Alət · ədəd" : isPacked(tool) ? `Material · 1 ${tool.pack_name} = ${fmt(tool.pack_size)} ${tool.unit}` : `Material · ${tool.unit}`;
  const piecesTitle = !isPacked(tool) ? "Parçalar" : tool.pack_name === "balon" ? "Açıq balonlar" : "Açıq qablar";
  const actions = [
    canManage && { icon: PackagePlus, tone: "green" as const, label: "Mədaxil", onClick: onReceipt },
    canManage && { icon: Trash2, tone: "red" as const, label: "Silinmə", onClick: () => setDoc("writeoff") },
    canManage && !material && { icon: Wrench, tone: "amber" as const, label: "Təmirə", onClick: () => setDoc("repair") },
    { icon: History, tone: "slate" as const, label: "Hərəkətlər", onClick: () => setDoc("history") },
  ].filter((a) => !!a);

  return (
    <Modal onClose={onClose} labelledBy={`tool-${tool.id}-title`} className="!max-w-2xl">
      {editing && <EditToolModal tool={tool} onClose={() => setEditing(false)} />}
      {doc === "writeoff" && <WriteoffModal tool={tool} source={{ kind: "depot" }} onClose={() => setDoc(null)} />}
      {doc === "repair" && <RepairModal tool={tool} onClose={() => setDoc(null)} />}
      {doc === "history" && <HistoryModal kind={kind} toolId={tool.id} toolName={tool.name} onClose={() => setDoc(null)} />}
      <DHead id={`tool-${tool.id}-title`} icon={material ? Package : Wrench} tone={material ? "teal" : "blue"} title={tool.name} sub={measure} onClose={onClose}>
        {canManage && <ToolHeadActions tool={tool} kind={kind} holders={holders} empty={empty} onEdit={() => setEditing(true)} />}
      </DHead>

      <ToolStats tool={tool} holders={holders} material={material} piecesTitle={piecesTitle} />
      {losses.length > 0 && <ToolLosses losses={losses} unit={unit} />}

      {canManage && (
        <div className="mt-4 rounded-2xl border border-[#dbe7ff] bg-[linear-gradient(135deg,#f4f8ff,#ffffff)] p-4">
          <p className="mb-2.5 flex items-center gap-2 text-sm font-bold"><Send size={15} className="text-primary" /> Ustaya ver</p>
          <GiveForm tool={tool} employees={employees} />
        </div>
      )}

      <div className={`mt-3 grid gap-2 ${actions.length === 4 ? "grid-cols-4" : actions.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}>
        {actions.map((a) => <DAction key={a.label} icon={a.icon} tone={a.tone} label={a.label} onClick={a.onClick} />)}
      </div>

      <DSection title="Kimdədir" count={holders.length}>
        {holders.length === 0 ? (
          <p className="muted rounded-2xl border border-dashed border-line py-4 text-center text-sm">Heç kimdə deyil</p>
        ) : (
          <ul className="nice-scroll max-h-72 divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
            {holders.map((h) => <HolderRow key={h.id} holding={h} canManage={canManage} tool={tool} pendingReturn={pendingReturns.has(h.id)} />)}
          </ul>
        )}
      </DSection>

      {repairs.length > 0 && (
        <DSection title="Təmirdə" count={repairs.reduce((n, r) => n + r.quantity, 0)}>
          <ul className="divide-y divide-line rounded-2xl border border-line px-3">
            {repairs.map((r) => <RepairRow key={r.id} r={r} unit={unit} canManage={canManage} />)}
          </ul>
        </DSection>
      )}

      {material && pieces.length > 0 && (
        <DSection title={piecesTitle} count={pieces.length}>
          <ul className="nice-scroll max-h-[210px] divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
            {pieces.map((p) => <PieceRow key={p.id} piece={p} tool={tool} employees={employees} canManage={canManage} writeoffPending={pendingPieces.has(p.id)} />)}
          </ul>
        </DSection>
      )}
    </Modal>
  );
}
