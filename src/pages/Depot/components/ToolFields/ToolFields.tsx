import { useState } from "react";
import { Check } from "lucide-react";
import { Field } from "@/components/forms";
import { fmt, isPacked, parseQty, round2 } from "../../utils/quantity";
import { TEXT } from "../../constants/text";
import type { ToolFieldsProps } from "@/types/depot";
import { MEASURES, COUNTS, measureOf, inPack } from "../../utils/measures";
import { Input } from "@/shared/components/Input";

// Alət / material əlavə et və redaktə et sahələri. Ad: mövcud adlar təklif olunur (təkrar ad bloklanır).
// Alət həmişə ədəddir. Redaktədə miqdar yoxdur: say yalnız Mədaxil / Silinmə aktı / Sayım ilə dəyişir.
// Yeni əlavədə miqdar = ilk mədaxil (təsdiq gözləyir); qab seçilibsə qabla yazılır (2 balon → 22,6 kq).
export function ToolFields({ t, kind, names = [] }: ToolFieldsProps) {
  const editing = !!t;
  const material = kind === "material";
  const initial = t ? (isPacked(t) ? [t.unit, t.pack_name] : [t.unit]) : ["ədəd"];
  const [sel, setSel] = useState<string[]>(initial);
  const [packSize, setPackSize] = useState(t?.pack_size ? fmt(t.pack_size) : "");
  const [countText, setCountText] = useState("");
  const { unit, pack } = material ? measureOf(sel) : { unit: "ədəd", pack: null };
  const size = parseQty(packSize);
  const count = parseQty(countText);
  // Siyahıda olmayan köhnə vahid (məs. "rulon") itməsin: ayrıca seçim (ölçü) kimi qalır
  const extra = initial.filter((v) => !MEASURES.some(([m]) => m === v));
  const measures: readonly (readonly [string, string])[] = [...extra.map((v) => [v, v] as const), ...MEASURES];

  // Ölçülərdən yalnız biri; ən azı bir seçim qalır
  function toggle(v: string) {
    setSel((cur) => {
      if (cur.includes(v)) return cur.length > 1 ? cur.filter((x) => x !== v) : cur;
      return COUNTS.includes(v) ? [...cur, v] : [...cur.filter((x) => COUNTS.includes(x)), v];
    });
  }

  return (
    <>
      <Field label="Adı">
        <Input name="name" defaultValue={t?.name} placeholder={TEXT[kind].placeholder} required list={editing ? undefined : "depot-names"} autoComplete="off" />
        {!editing && <datalist id="depot-names">{names.map((n) => <option key={n} value={n} />)}</datalist>}
      </Field>

      {material && (
        <div>
          <span className="label">Necə sayılır <span className="muted font-normal">(bir neçəsini seç)</span></span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Necə sayılır">
            {measures.map(([v, l]) => {
              const on = sel.includes(v);
              return (
                <button key={v} type="button" aria-pressed={on} onClick={() => toggle(v)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors ${on ? "bg-navy text-white" : "bg-bg text-muted hover:text-ink"}`}>
                  {on && <Check size={13} />}{l}
                </button>
              );
            })}
          </div>
          {pack && <p className="muted mt-1.5 text-xs">Verəndə, alanda və mədaxildə: {pack} və ya {unit}</p>}
          <input type="hidden" name="pack_mode" value="1" />
          <input type="hidden" name="unit" value={unit} />
          <input type="hidden" name="pack_name" value={pack ?? ""} />
        </div>
      )}
      {!material && !editing && <input type="hidden" name="unit" value="ədəd" />}

      {pack && (
        <Field label={`${inPack(pack)} neçə ${unit}`}>
          <Input name="pack_size" inputMode="decimal" value={packSize} onChange={(e) => setPackSize(e.target.value)} placeholder={unit === "kq" ? "11,3" : ""} required autoComplete="off" />
        </Field>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end gap-3">
        {!editing && (
          <Field label={pack ? `Neçə ${pack}` : material ? `Miqdar (${unit})` : "Say"}>
            <Input name="quantity" inputMode="decimal" value={countText} onChange={(e) => setCountText(e.target.value)} placeholder="0" autoComplete="off" />
          </Field>
        )}
        <Field label={`Min. qalıq (${unit})`}>
          <Input name="min_stock" inputMode="decimal" defaultValue={t?.min_stock != null ? fmt(t.min_stock) : ""} placeholder="istəyə görə" autoComplete="off" />
        </Field>
      </div>
      {pack && !editing && count > 0 && size > 0 && <p className="muted -mt-2 text-xs">= {fmt(round2(count * size))} {unit}</p>}

      {editing && kind === "tool" && (
        <Field label="İnventar kodu">
          <Input name="inventory_code" defaultValue={t.inventory_code ?? ""} placeholder="istəyə görə" />
        </Field>
      )}
    </>
  );
}
