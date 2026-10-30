import { ArrowRight, Clock } from "lucide-react";

// "Təsdiq gözləyir" zolağı (səhifədə): gradient kart, ikon kafeli, say, sənəd növləri çip kimi, "Bax" düyməsi; basanda pəncərə açılır
export function PendingBanner({ total, parts, onOpen }: { total: number; parts: string[]; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen}
      className="group flex w-full items-center gap-3 rounded-2xl border border-[#fcd9a0] bg-[linear-gradient(135deg,#fff4dc,#fffdf8_70%)] p-3 text-left shadow-[0_8px_20px_-14px_rgba(180,83,9,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(180,83,9,0.55)] max-sm:gap-2.5 max-sm:p-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#f59e0b,#d97706)] text-white shadow-[0_6px_14px_-6px_rgba(217,119,6,0.8)] max-sm:h-8 max-sm:w-8"><Clock size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <b className="text-sm max-sm:text-[13px]">Təsdiq gözləyir</b>
          <span className="rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold leading-none text-white">{total}</span>
        </span>
        <span className="mt-1 flex flex-wrap gap-1">
          {parts.map((x) => <span key={x} className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-[#92400e] ring-1 ring-[#fde3b4] max-sm:text-[10px]">{x}</span>)}
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary ring-1 ring-primary/25 transition-colors group-hover:bg-primary group-hover:text-white max-sm:px-2.5 max-sm:py-1 max-sm:text-[11px]">
        Bax <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}
