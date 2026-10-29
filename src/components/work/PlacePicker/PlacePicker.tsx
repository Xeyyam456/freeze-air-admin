import { ChevronDown, Search } from "lucide-react";
import type { PlacePickerProps } from "@/types/workLogs";
import { MAX_CUSTOM } from "./place";
import { PlaceList } from "./PlaceList";
import { SelectedPlace } from "./SelectedPlace";
import { usePlacePicker } from "./usePlacePicker";

// Yer seçimi: kliklə bütün siyahı qruplarla açılır, yazdıqca süzülür.
// Uyğun yer yoxdursa, yazılan mətn özü yer kimi saxlanır (məs. "Fərdi ev").
export function PlacePicker({ places, value, onChange }: PlacePickerProps) {
  const s = usePlacePicker({ places, onChange });

  if (value) return <SelectedPlace value={value} onClear={() => { onChange(null); setTimeout(() => s.inputRef.current?.focus()); }} />;

  return (
    <div ref={s.rootRef} className="relative">
      <div className={`flex h-[42px] items-center gap-2 rounded-[10px] border bg-surface px-3 transition-colors ${
        s.open ? "border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : "border-line hover:border-[#cfd5e1]"
      }`}>
        <Search size={16} className="muted shrink-0" />
        <input
          ref={s.inputRef}
          value={s.query}
          onChange={(e) => { s.setQuery(e.target.value); s.setActive(0); s.setOpen(true); }}
          onFocus={() => s.setOpen(true)}
          onClick={() => s.setOpen(true)}
          onKeyDown={s.onKeyDown}
          maxLength={MAX_CUSTOM}
          placeholder="Mağaza kodu, adı və ya yer yaz: məs. oba 015, fərdi ev"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          role="combobox"
          aria-expanded={s.open}
          aria-controls="place-list"
          aria-label="İş yeri"
        />
        <button type="button" tabIndex={-1} onClick={() => { s.setOpen((o) => !o); s.inputRef.current?.focus(); }}
          className="muted shrink-0" aria-label="Siyahını aç">
          <ChevronDown size={16} className={`transition-transform ${s.open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {s.open && (
        <PlaceList loading={places.length === 0} groups={s.groups} trimmed={s.trimmed} empty={s.filtered.length === 0}
          customIndex={s.options.length - 1} active={s.active} onActive={s.setActive}
          onChoose={(i, p) => s.choose(p ?? s.options[i])} />
      )}
    </div>
  );
}
