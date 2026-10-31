import { ChevronUp } from "lucide-react";
import type { PickerButtonProps } from "@/types/shared";

// Seçim düyməsi: seçilmiş element (ikon, ad, ipucu) və ya açıq-rəngli yazı
export function PickerButton({ selected, open, empty, icon: Icon, placeholder, emptyLabel, buttonRef, onClick }: PickerButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={empty}
      aria-haspopup="listbox"
      aria-expanded={open}
      className={`flex h-9 max-sm:h-7 w-full items-center gap-2 rounded-[10px] border bg-surface px-3 text-left text-[13px] transition-colors disabled:opacity-60 ${
        open ? "border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : "border-line hover:border-[#cfd5e1]"
      }`}
    >
      {selected ? (
        <>
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary-soft text-primary"><Icon size={12} /></span>
          <span className="truncate font-semibold">{selected.name}</span>
          {selected.hint && <span className="muted shrink-0 text-[11px] font-semibold max-sm:hidden">{selected.hint}</span>}
        </>
      ) : (
        <span className="muted truncate">{empty ? emptyLabel : placeholder}</span>
      )}
      <ChevronUp size={15} className={`muted ml-auto shrink-0 transition-transform ${open ? "" : "rotate-180"}`} />
    </button>
  );
}
