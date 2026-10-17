
import { useState } from "react";
import { toast } from "@/lib/toast";

// Say sahəsi: limitdən çox yazılan kimi tost + sahənin altında qırmızı yazı.
// Brauzerin öz max yoxlaması yoxdur (o, səssizcə bloklayır); yoxlama burada və bazada.
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
      <input name="quantity" type="number" min={min} defaultValue={defaultValue} required aria-label="Say"
        aria-invalid={!!error}
        className={`field !h-9 !w-20 !px-2 !text-[13px] ${error ? "!border-danger !shadow-[0_0_0_4px_var(--color-danger-soft)]" : ""} ${className}`}
        onChange={(e) => {
          const wanted = Number(e.target.value);
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

// Ustaya vermək: depodakından çox yazılanda göstərilən mətn
// unit: alət üçün "ədəd", material üçün ölçü vahidi (metr, kq...)
export const giveLimitText = (limit: number, wanted: number, unit = "ədəd") =>
  limit === 0 ? "Depoda qalmayıb." : `Depoda cəmi ${limit} ${unit} qalıb — ${wanted} ${unit} vermək olmur.`;
