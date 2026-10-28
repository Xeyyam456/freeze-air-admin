import { fmt, isPacked, parseQty, round2, unitOf, type Tool } from "@/pages/Depot/utils";
import { Seg } from "@/pages/Depot/components/Seg";

// Miqdar + vahid: qablı materialda "balon | kq" keçidi (standart balon). Qaytarır: ölçü vahidi ilə miqdar.
export function AmountInput({ tool, text, onText, byPack, onByPack, label = "Miqdar" }: {
  tool: Tool | null; text: string; onText: (v: string) => void; byPack: boolean; onByPack: (v: boolean) => void; label?: string;
}) {
  const packed = isPacked(tool);
  const n = parseQty(text);
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-2">
        <input value={text} onChange={(e) => onText(e.target.value)} inputMode="decimal" required autoComplete="off" aria-label={label} className="field !w-32" />
        {packed ? (
          <Seg label="Vahid" value={byPack ? "p" : "u"} onChange={(v) => onByPack(v === "p")} items={[["p", tool.pack_name], ["u", tool.unit]] as const} />
        ) : (
          <span className="muted text-sm">{tool ? unitOf(tool) : ""}</span>
        )}
      </div>
      {packed && byPack && n > 0 && <p className="muted mt-1 text-xs">= {fmt(round2(n * tool.pack_size))} {tool.unit}</p>}
    </div>
  );
}
