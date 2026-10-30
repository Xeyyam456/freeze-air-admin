import { fmt, isPacked, parseQty, round2, unitOf } from "../../utils/quantity";
import type { AmountInputProps } from "@/types/depot";
import { MiniSeg } from "../MiniSeg";

// Miqdar + vahid: qablı materialda "balon | kq" keçidi (standart balon). Qaytarır: ölçü vahidi ilə miqdar.
export function AmountInput({ tool, text, onText, byPack, onByPack, label = "Miqdar" }: AmountInputProps) {
  const packed = isPacked(tool);
  const n = parseQty(text);
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-2">
        <input value={text} onChange={(e) => onText(e.target.value)} inputMode="decimal" required autoComplete="off" aria-label={label} className="field !w-32" />
        {packed ? (
          <MiniSeg label="Vahid" value={byPack} onChange={onByPack} items={[[true, tool.pack_name], [false, tool.unit]]} />
        ) : (
          <span className="muted text-sm">{tool ? unitOf(tool) : ""}</span>
        )}
      </div>
      {packed && byPack && n > 0 && <p className="muted mt-1 text-xs">= {fmt(round2(n * tool.pack_size))} {tool.unit}</p>}
    </div>
  );
}
