import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { PanelLeftClose, PanelLeftOpen, Snowflake, X } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { LogoutButton } from "@/components/LogoutButton";
import { useData } from "@/lib/useData";
import { fetchNavBadges } from "@/services/nav/fetchNavBadges";
import type { SidebarProps } from "@/types/layout";
import { SidebarNav } from "./components/SidebarNav";

export function Sidebar({ collapsed, narrow, open, onToggle, onClose }: SidebarProps) {
  const { pathname } = useLocation();
  const badges = useData("nav-badges", fetchNavBadges);
  const { owner } = useAuth();
  const asideRef = useRef<HTMLElement>(null);

  // Menyunun üstündə təkər fırlananda arxadakı səhifə sürüşməsin (menyu özü sürüşmür; telefon siyirtməsi istisnadır)
  useEffect(() => {
    const el = asideRef.current;
    if (!el || narrow) return;
    const stop = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", stop, { passive: false });
    return () => el.removeEventListener("wheel", stop);
  }, [narrow]);

  return (
    <aside ref={asideRef} className="app-sidebar" data-collapsed={collapsed || undefined} data-open={open || undefined}>
      <Link to="/" className="sidebar-brand" title="Freeze Air Service — Panel">
        <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
        <span className="sidebar-text leading-tight">
          <span className="block text-[15px] font-extrabold">Freeze Air Service</span>
          <span className="block text-xs text-white/55">İdarəetmə paneli</span>
        </span>
      </Link>
      {narrow && <button type="button" onClick={onClose} className="sidebar-close" aria-label="Menyunu bağla"><X size={18} /></button>}

      <SidebarNav collapsed={collapsed} owner={owner} pathname={pathname} badges={badges} />

      {narrow && <div className="shrink-0 px-3 pb-3 sm:hidden"><LogoutButton menu /></div>}
      {!narrow && <button type="button" onClick={onToggle} className="side-link sidebar-toggle"
        title={collapsed ? "Menyunu aç" : "Menyunu yığ"} aria-label={collapsed ? "Menyunu aç" : "Menyunu yığ"}>
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        <span className="sidebar-text">Menyunu yığ</span>
      </button>}
    </aside>
  );
}
