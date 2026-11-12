import { Send, Trash2 } from "lucide-react";
import { fmtMs } from "../../utils/fmtMs";

// Yazı zamanı yazı sahəsinin yerinə: zibil qutusu (ləğv), nəbz edən qırmızı nöqtə + sayğac, göndər
export function VoiceBar({ ms, onCancel, onSend }: { ms: number; onCancel: () => void; onSend: () => void }) {
  return (
    <div className="flex items-center gap-2 border-t border-line px-4 py-3">
      <button type="button" onClick={onCancel} aria-label="Ləğv et" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-400 transition hover:bg-red-500/25"><Trash2 size={18} /></button>
      <div className="flex h-11 flex-1 items-center gap-3 rounded-3xl border border-line bg-surface-2 px-4">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
        <span className="text-[15px] font-extrabold tabular-nums">{fmtMs(ms)}</span>
        <span className="muted text-xs font-semibold">Yazılır…</span>
      </div>
      <button type="button" onClick={onSend} aria-label="Göndər" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white transition hover:brightness-110"><Send size={18} /></button>
    </div>
  );
}
