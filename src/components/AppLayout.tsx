import { useEffect, useState } from "react";
import { usePref } from "@/lib/usePref";
import { CommandPalette } from "./CommandPalette";
import { Sidebar } from "./Sidebar";

// Girişdən sonrakı bütün səhifələrin çərçivəsi: solda menyu, sağda səhifə; Ctrl+K hər yerdə axtarışı açır
export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = usePref<boolean>("sidebar-collapsed", false);
  const [search, setSearch] = useState(false);

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

  return (
    <div className="app-frame" data-collapsed={collapsed || undefined}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      {children}
      {search && <CommandPalette onClose={() => setSearch(false)} />}
    </div>
  );
}
