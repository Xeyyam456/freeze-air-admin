import { useEffect, useMemo, useRef, useState } from "react";
import { norm } from "@/shared/utils/norm";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import type { EmployeeSelectProps, SelectableEmployee } from "@/types/employees";
import { useSelectDismiss } from "./useSelectDismiss";
import { useSelectPosition } from "./useSelectPosition";

type Args = Pick<EmployeeSelectProps, "value" | "onChange" | "employees" | "emptyLabel">;

// Açılan siyahının vəziyyəti: axtarış, aktiv sətir, klaviatura (↑↓ seçir, Enter təsdiqləyir)
export function useEmployeeSelect({ value, onChange, employees, emptyLabel }: Args) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEscapeLayer(() => setOpen(false), open);

  const showSearch = employees.length > 6;
  const options = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    const list: (SelectableEmployee | null)[] = employees.filter((e) => {
      const hay = norm(`${e.full_name} ${e.specialty ?? ""}`);
      return words.every((w) => hay.includes(w));
    });
    return emptyLabel && !query ? [null, ...list] : list;
  }, [employees, query, emptyLabel]);
  const selected = employees.find((e) => e.id === value) ?? null;
  const pos = useSelectPosition(open, btnRef, employees.length + (emptyLabel ? 1 : 0), showSearch);
  useSelectDismiss(open, setOpen, btnRef, listRef);

  // Aktiv sətir görünən yerdə qalsın
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function toggle() {
    if (open) return setOpen(false);
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => (o?.id ?? null) === value)));
    setOpen(true);
  }

  function pick(o: SelectableEmployee | null) {
    onChange(o?.id ?? null);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (!open) toggle(); else setActive((i) => Math.min(i + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && open) { e.preventDefault(); if (options[active] !== undefined) pick(options[active]); }
  }

  function onSearch(q: string) {
    setQuery(q);
    setActive(0);
  }

  return { open, query, active, setActive, btnRef, listRef, showSearch, options, selected, pos, toggle, pick, onKey, onSearch };
}
