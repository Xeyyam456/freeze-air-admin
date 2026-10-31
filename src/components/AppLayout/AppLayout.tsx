import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { usePref } from "@/lib/usePref";
import { NavDrawerContext, useCompact, useNarrow } from "@/lib/navDrawer";
import { CommandPalette } from "../CommandPalette";
import { Sidebar } from "../Sidebar";

// Girişdən sonrakı bütün səhifələrin çərçivəsi: solda menyu, sağda səhifə; Ctrl+K hər yerdə axtarışı açır.
// Dar ekranda (< 1024px) menyu sürüşən siyirtmədir.
export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = usePref<boolean>("sidebar-collapsed", false);
  const [expandedCompact, setExpandedCompact] = usePref<boolean>("sidebar-expanded-compact", false); // 1024–1279px: standart ikon zolağı, istəsən açılır
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const narrow = useNarrow();
  const compact = useCompact();
  const { pathname } = useLocation();

  // Səhifə dəyişəndə və ya ekran genişlənəndə siyirtmə bağlanır
  useEffect(() => setDrawer(false), [pathname, narrow]);
  useEffect(() => {
    if (!drawer) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [drawer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const wide = !narrow && (compact ? !expandedCompact : collapsed);
  return (
    <NavDrawerContext.Provider value={{ open: drawer, setOpen: setDrawer }}>
      <div className="app-frame" data-collapsed={wide || undefined}>
        <Sidebar collapsed={wide} narrow={narrow} open={drawer} onToggle={() => (compact ? setExpandedCompact(!expandedCompact) : setCollapsed(!collapsed))} onClose={() => setDrawer(false)} />
        {narrow && drawer && <div className="nav-backdrop" onClick={() => setDrawer(false)} aria-hidden />}
        {children}
        {search && <CommandPalette onClose={() => setSearch(false)} />}
      </div>
    </NavDrawerContext.Provider>
  );
}
