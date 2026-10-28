import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { Building2, CornerDownLeft, Search, Store, User, UserCog, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import { norm } from "@/components/work/PlacePicker";
import { NAV_ITEMS } from "./Sidebar";

type Item = { key: string; group: string; label: string; hint?: string; icon: typeof Search; href: string };

// Axtarış üçün məlumat yalnız pəncərə ilk dəfə açılanda yüklənir (hər səhifədə sorğu getməsin)
async function loadItems(): Promise<Item[]> {
  const supabase = createClient();
  const [companies, stores, employees, tools] = await Promise.all([
    supabase.from("companies").select("id, name, kind").order("name").then((r) => r.data ?? []),
    supabase.from("stores").select("id, name, code, company_id, companies(name, kind)").order("name").then((r) => r.data ?? []),
    supabase.from("employees").select("id, full_name, is_management, specialty, position").eq("is_active", true).order("full_name").then((r) => r.data ?? []),
    supabase.from("tools").select("id, name, kind, inventory_code").order("name").then((r) => r.data ?? []),
  ]);
  const route = (kind: string | null | undefined) => (kind === "market" ? "/magazalar" : "/sirketler");
  const q = (s: string) => `?q=${encodeURIComponent(s)}`;
  return [
    ...companies.map((c) => ({
      key: `c${c.id}`, group: c.kind === "market" ? "Marketlər" : "Şirkətlər", label: c.name,
      icon: c.kind === "market" ? Store : Building2, href: `${route(c.kind)}/${c.id}`,
    })),
    ...stores.map((s) => ({
      key: `s${s.id}`, group: "Filial və mağazalar", label: s.name, hint: [s.code, s.companies?.name].filter(Boolean).join(" · "),
      icon: Store, href: `${route(s.companies?.kind)}/${s.company_id}${q(s.code ?? s.name)}`,
    })),
    ...employees.map((e) => ({
      key: `e${e.id}`, group: e.is_management ? "Rəhbərlik" : "Ustalar", label: e.full_name,
      hint: (e.is_management ? e.position : e.specialty) ?? undefined,
      icon: e.is_management ? UserCog : User, href: `${e.is_management ? "/rehberlik" : "/ustalar"}${q(e.full_name)}`,
    })),
    ...tools.map((t) => ({
      key: `t${t.id}`, group: t.kind === "material" ? "Materiallar" : "Alətlər", label: t.name, hint: t.inventory_code ?? undefined,
      icon: Wrench, href: `/depo${q(t.name)}`,
    })),
  ];
}

const PAGES: Item[] = NAV_ITEMS.filter((n) => !n.ownerOnly).map((n) => ({ key: `p${n.href}`, group: "Bölmələr", label: n.label, icon: n.icon, href: n.href }));
const LIMIT = 40;

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[] | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  useEscapeLayer(onClose);

  useEffect(() => {
    loadItems().then(setItems);
  }, []);

  const results = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    if (!words.length) return PAGES;
    const all = [...PAGES, ...(items ?? [])];
    return all.filter((i) => {
      const hay = norm(`${i.label} ${i.hint ?? ""}`);
      return words.every((w) => hay.includes(w));
    }).slice(0, LIMIT);
  }, [query, items]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const open = (i: Item) => {
    onClose();
    navigate(i.href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      open(results[active]);
    }
  };

  let lastGroup = "";
  return createPortal(
    <div className="modal-backdrop !items-start pt-[12vh]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Axtarış">
        <label className="cmdk-input">
          <Search size={19} />
          <input autoFocus value={query} onKeyDown={onKey}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Şirkət, mağaza, usta, alət və ya bölmə axtar..." />
          <kbd>Esc</kbd>
        </label>
        <div ref={listRef} className="cmdk-list nice-scroll">
          {query && items === null && <p className="muted px-4 py-6 text-center text-sm">Yüklənir...</p>}
          {query && items !== null && !results.length && (
            <p className="muted px-4 py-6 text-center text-sm">“{query}” üzrə heç nə tapılmadı</p>
          )}
          {results.map((i, idx) => {
            const head = i.group !== lastGroup ? (lastGroup = i.group) : null;
            const Icon = i.icon;
            return (
              <div key={i.key}>
                {head && <p className="cmdk-group">{head}</p>}
                <button type="button" data-index={idx} className="cmdk-item" aria-selected={idx === active}
                  onMouseMove={() => setActive(idx)} onClick={() => open(i)}>
                  <span className="cmdk-icon"><Icon size={16} /></span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-semibold">{i.label}</span>
                    {i.hint && <span className="muted ml-2 text-xs">{i.hint}</span>}
                  </span>
                  {idx === active && <CornerDownLeft size={15} className="muted" />}
                </button>
              </div>
            );
          })}
        </div>
        <p className="cmdk-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> seç</span>
          <span><kbd>Enter</kbd> aç</span>
          <span><kbd>Ctrl</kbd><kbd>K</kbd> istənilən yerdən</span>
        </p>
      </div>
    </div>,
    document.body,
  );
}
