import { ChevronDown, Search } from "lucide-react";
import type { PlacePickerProps } from "@/types/workLogs";
import { MAX_CUSTOM } from "./place";
import { PlaceList } from "./PlaceList";
import { SelectedPlace } from "./SelectedPlace";
import { usePlacePicker } from "./usePlacePicker";

// Yer seçimi: kliklə bütün siyahı qruplarla açılır, yazdıqca süzülür.
// Uyğun yer yoxdursa, yazılan mətn özü yer kimi saxlanır (məs. "Fərdi ev").
export function PlacePicker({ places, value, onChange }: PlacePickerProps) {
  const { open, setOpen, query, setQuery, setActive, active, rootRef, inputRef, trimmed, filtered, options, groups, choose, onKeyDown } = usePlacePicker({ places, onChange });

  if (value) return <SelectedPlace value={value} onClear={() => { onChange(null); setTimeout(() => inputRef.current?.focus()); }} />;

  return (
    <div ref={rootRef} className="relative">
      <div className={`flex h-[42px] items-center gap-2 rounded-[10px] border bg-surface px-3 transition-colors ${
        open ? "border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : "border-line hover:border-[#cfd5e1]"
      }`}>
        <Search size={16} className="muted shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          maxLength={MAX_CUSTOM}
          placeholder="Mağaza kodu, adı və ya yer yaz: məs. oba 015, fərdi ev"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          role="combobox"
          aria-expanded={open}
          aria-controls="place-list"
          aria-label="İş yeri"
        />
        <button type="button" tabIndex={-1} onClick={() => { setOpen((o) => !o); inputRef.current?.focus(); }}
          className="muted shrink-0" aria-label="Siyahını aç">
          <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <PlaceList loading={places.length === 0} groups={groups} trimmed={trimmed} empty={filtered.length === 0}
          customIndex={options.length - 1} active={active} onActive={setActive}
          onChoose={(i, p) => choose(p ?? options[i])} />
      )}
    </div>
  );
}
