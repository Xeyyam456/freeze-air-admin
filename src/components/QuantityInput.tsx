import { useState } from "react";
import { toast } from "@/lib/toast";

// Say sahəsi: limitdən çox yazılan kimi tost + sahənin altında qırmızı yazı.
// Brauzerin öz max yoxlaması yoxdur (o, səssizcə bloklayır); yoxlama burada və bazada.
// Kəsr yazmaq olur (11,3 kq): vergül nöqtəyə çevrilir ki, forma Number() ilə oxusun.
export function QuantityInput({ limit, limitText, className = "", defaultValue = 1, min = 1, onValid, onValue }: {
  limit: number;
  limitText: (limit: number, wanted: number) => string; // xəta mətni
  className?: string;
  defaultValue?: number;
  min?: number; // ən az dəyər (materialda "işlədilib" üçün 0)
  onValid?: (ok: boolean) => void;
  onValue?: (n: number) => void; // hər dəyişmədə cari dəyər
}) {
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="relative">
      <input name="quantity" type="text" inputMode="decimal" defaultValue={defaultValue} required aria-label="Say" autoComplete="off"
        aria-invalid={!!error} data-min={min}
        className={`field !h-9 !w-20 !px-2 !text-[13px] ${error ? "!border-danger !shadow-[0_0_0_4px_var(--color-danger-soft)]" : ""} ${className}`}
        onChange={(e) => {
          if (e.target.value.includes(",")) e.target.value = e.target.value.replace(",", ".");
          const wanted = e.target.value.trim() === "" ? NaN : Number(e.target.value);
          onValue?.(wanted);
          const msg = wanted > limit ? limitText(limit, wanted) : null;
          if (msg && msg !== error) toast.error(msg);
          setError(msg);
          onValid?.(!msg);
        }} />
      {error && <span className="absolute right-0 top-full mt-1 whitespace-nowrap text-[11px] font-semibold text-danger">{error}</span>}
    </span>
  );
}

const fmt = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");

// Ustaya vermək: depodakından çox yazılanda göstərilən mətn
// unit: alət üçün "ədəd", material üçün ölçü vahidi (metr, kq...)
export const giveLimitText = (limit: number, wanted: number, unit = "ədəd") =>
  limit === 0 ? "Depoda qalmayıb." : `Depoda cəmi ${fmt(limit)} ${unit} qalıb — ${fmt(wanted)} ${unit} vermək olmur.`;
