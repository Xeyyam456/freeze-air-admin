import { useState } from "react";
import { Trash2 } from "lucide-react";
import { WriteoffModal } from "../WriteoffModal";
import { dateAz } from "../../utils/dates";
import { fmt } from "../../utils/quantity";
import type { PieceRowProps } from "@/types/depot";
import { PieceGiveModal } from "../PieceGiveModal";

// Depodakı bir parça / açıq balon: nə qədər, kimdən qalıb, nə vaxt; ustaya vermək və ya silinmə aktı (təsdiqdən sonra silinir)
export function PieceRow({ piece, tool, employees, canManage, writeoffPending }: PieceRowProps) {
  const unit = tool.unit;
  const [giving, setGiving] = useState(false);
  const [writeoff, setWriteoff] = useState(false);
  const original = piece.original_length ?? piece.length;
  const who = piece.employees ? `${piece.employees.full_name} qaytarıb` : "";
  return (
    <li className="flex flex-wrap items-center gap-3 py-2 max-sm:gap-x-2 max-sm:gap-y-0.5 max-sm:py-1.5">
      {giving && <PieceGiveModal piece={piece} tool={tool} employees={employees} onClose={() => setGiving(false)} />}
      {writeoff && <WriteoffModal tool={tool} source={{ kind: "piece", piece }} onClose={() => setWriteoff(false)} />}
      {/* Qalan miqdar; hissə verilibsə ilkin miqdar da yazılır */}
      <span className="w-24 shrink-0 max-sm:w-auto max-sm:flex-1">
        <span className="block text-sm max-sm:text-[13px] font-bold tabular-nums">{fmt(piece.length)} {unit}</span>
        {original > piece.length && <span className="muted block text-[11px]">ilkin {fmt(original)}</span>}
      </span>
      <span className="muted min-w-0 flex-1 truncate text-[13px] max-sm:order-last max-sm:basis-full max-sm:text-[11px]" title={who}>{who ? `${who} · ` : ""}{dateAz(piece.created_at)}</span>
      {writeoffPending && <span className="shrink-0 rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger">silinmə gözləyir</span>}
      {canManage && (
        <>
          <button type="button" onClick={() => setGiving(true)} className="btn btn-secondary btn-sm !h-8 max-sm:!h-6 max-sm:!px-2 max-sm:!text-[11px]">Ver</button>
          {!writeoffPending && (
            <button type="button" onClick={() => setWriteoff(true)} className="icon-btn icon-btn-danger max-sm:!h-6 max-sm:!w-6" title="Silinmə aktı (sərf olunub)" aria-label="Silinmə aktı">
              <Trash2 size={15} />
            </button>
          )}
        </>
      )}
    </li>
  );
}
