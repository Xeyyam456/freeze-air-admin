import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "@/lib/toast";
import type { NumberSaveProps } from "@/types/fuel";

// Rəqəm sahəsi + "Yadda saxla" (qiymət, 100 km-ə sərf)
export function NumberSave({ value, suffix, placeholder, onSave, compact = false }: NumberSaveProps) {
  const [text, setText] = useState(value != null ? String(value) : "");
  const [pending, setPending] = useState(false);
  const dirty = text.replace(",", ".") !== (value != null ? String(value) : "");
  async function save() {
    const t = text.replace(",", ".").trim();
    const n = t === "" ? null : Number(t);
    if (n !== null && (!Number.isFinite(n) || n <= 0)) return toast.error("Müsbət rəqəm yaz.");
    setPending(true);
    await onSave(n);
    setPending(false);
  }
  return (
    <span className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <span className="relative">
        <input value={text} onChange={(e) => setText(e.target.value.replace(/[^\d.,]/g, ""))} inputMode="decimal" placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && dirty && save()}
          className={`field text-right tabular-nums ${compact ? "!h-8 w-[72px] !pl-2 !pr-6 text-sm" : "!h-9 w-28 !pr-12"}`} />
        <span className={`muted pointer-events-none absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold ${compact ? "right-2" : "right-2.5"}`}>{suffix}</span>
      </span>
      {dirty && <button type="button" onClick={save} disabled={pending} className={`btn btn-primary btn-sm ${compact ? "!h-8" : "!h-9"}`} title="Yadda saxla"><Save size={14} /></button>}
    </span>
  );
}
