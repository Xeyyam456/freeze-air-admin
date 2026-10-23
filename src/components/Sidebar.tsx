import { Link, useLocation } from "react-router";
import {
  Building2, CalendarCheck, CalendarOff, ClipboardList, Globe, Inbox, LayoutGrid, ListChecks, PanelLeftClose, PanelLeftOpen,
  Snowflake, Store, TriangleAlert, UserCog, Users, Warehouse, Fuel,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import { isLowStock } from "@/components/depot/depotUtils";

type Badge = "requests" | "tasks" | "stock" | "leave";

// Menyu qrupları: gündəlik iş yuxarıda, nadir açılan bölmələr aşağıda
// ownerOnly: yalnız müdir görür (saytın məzmununu digər rəhbərlər dəyişmir, 0069)
const GROUPS: { title: string; items: { href: string; label: string; icon: typeof LayoutGrid; badge?: Badge; ownerOnly?: boolean }[] }[] = [
  {
    title: "Gündəlik iş",
    items: [
      { href: "/", label: "Panel", icon: LayoutGrid },
      { href: "/tapshiriqlar", label: "Tapşırıqlar", icon: ListChecks, badge: "tasks" },
      { href: "/isler", label: "Görülən işlər", icon: ClipboardList },
      { href: "/muracietler", label: "Müraciətlər", icon: Inbox, badge: "requests" },
    ],
  },
  {
    title: "Müştərilər",
    items: [
      { href: "/sirketler", label: "Şirkətlər", icon: Building2 },
      { href: "/magazalar", label: "Mağazalar", icon: Store },
    ],
  },
  {
    title: "Komanda",
    items: [
      { href: "/ustalar", label: "Ustalar", icon: Users },
      { href: "/davamiyyet", label: "Davamiyyət", icon: CalendarCheck },
      { href: "/icazeler", label: "İcazələr", icon: CalendarOff, badge: "leave" },
      { href: "/yanacaq", label: "Yanacaq", icon: Fuel },
      { href: "/rehberlik", label: "Rəhbərlik", icon: UserCog },
    ],
  },
  {
    title: "Anbar və bilik",
    items: [
      { href: "/depo", label: "Depo", icon: Warehouse, badge: "stock" },
      { href: "/xeta-kodlari", label: "Xəta kodları", icon: TriangleAlert },
    ],
  },
  {
    title: "Sayt",
    items: [{ href: "/sayt", label: "Saytın məzmunu", icon: Globe, ownerOnly: true }],
  },
];

// Komanda paneli (Ctrl+K) da bu siyahıdan istifadə edir
export const NAV_ITEMS = GROUPS.flatMap((g) => g.items);

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function localDate(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Nişanlar (hamısı qırmızı): baxılmamış müraciət, bugünkü gözləyən tapşırıq, depo (təsdiq gözləyən sənəd + "Almadım" + azalan), gözləyən icazə
function useBadges() {
  return useData(async () => {
    const supabase = createClient();
    const [requests, tasks, low, docs, disputed, leave] = await Promise.all([
      supabase.from("contact_requests").select("*", { count: "exact", head: true }).eq("handled", false).then((r) => r.count ?? 0),
      // Qrup tapşırığı (0071) bir tapşırıq sayılır
      supabase.from("tasks").select("group_id").eq("task_date", localDate()).eq("done", false).is("cancelled_at", null)
        .then((r) => new Set((r.data ?? []).map((t, i) => t.group_id ?? `t${i}`)).size),
      supabase.from("tool_stock").select("min_stock, available, pieces_total")
        .then((r) => (r.data ?? []).filter((t) => isLowStock({ min_stock: t.min_stock, available: t.available ?? 0, pieces_total: t.pieces_total ?? 0 })).length),
      // Depo sənədləri (0084): təsdiq gözləyən və ustanın "Almadım" dediyi
      supabase.from("depot_requests").select("*", { count: "exact", head: true }).eq("status", "pending").then((r) => r.count ?? 0),
      supabase.from("tool_assignments").select("*", { count: "exact", head: true }).is("returned_at", null).is("received_at", null).not("disputed_at", "is", null)
        .then((r) => r.count ?? 0),
      supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending").then((r) => r.count ?? 0),
    ]);
    return { requests, tasks, stock: low + docs + disputed, leave, stockTitle: [docs && `${docs} sənəd təsdiq gözləyir`, disputed && `${disputed} «Almadım»`, low && `${low} azalan`].filter(Boolean).join(" · ") };
  });
}

// Bütün nişanlar qırmızıdır (istifadəçi, 2026-10-23); növ fərqi başlıqdakı izahdadır (BADGE_TITLE)
const BADGE_STYLE: Record<Badge, string> = {
  requests: "bg-danger text-white",
  tasks: "bg-danger text-white",
  stock: "bg-danger text-white",
  leave: "bg-danger text-white",
};
const BADGE_TITLE: Record<Badge, string> = {
  requests: "baxılmamış müraciət",
  tasks: "bu gün gözləyən tapşırıq",
  stock: "depo",
  leave: "gözləyən icazə sorğusu",
};

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { pathname } = useLocation();
  const badges = useBadges();
  const { owner } = useAuth();

  return (
    <aside className="app-sidebar" data-collapsed={collapsed || undefined}>
      <Link to="/" className="sidebar-brand" title="Freeze Air Service — Panel">
        <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
        <span className="sidebar-text leading-tight">
          <span className="block text-[15px] font-extrabold">Freeze Air Service</span>
          <span className="block text-xs text-white/55">İdarəetmə paneli</span>
        </span>
      </Link>

      <nav className="sidebar-nav nice-scroll">
        {GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.ownerOnly || owner) })).filter((g) => g.items.length > 0).map((g) => (
          <div key={g.title} className="sidebar-group">
            <p className="sidebar-group-title">{g.title}</p>
            {g.items.map(({ href, label, icon: Icon, badge }) => {
              const n = badge ? badges?.[badge] ?? 0 : 0;
              return (
                <Link key={href} to={href} className="side-link" title={collapsed ? label : undefined}
                  aria-current={isActive(href, pathname) ? "page" : undefined}>
                  <Icon size={18} strokeWidth={2.1} />
                  <span className="sidebar-text flex-1 truncate">{label}</span>
                  {!!n && (
                    <span className={`side-badge ${BADGE_STYLE[badge!]}`} title={badge === "stock" ? badges?.stockTitle : `${n} ${BADGE_TITLE[badge!]}`}>{n}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <button type="button" onClick={onToggle} className="side-link sidebar-toggle"
        title={collapsed ? "Menyunu aç" : "Menyunu yığ"} aria-label={collapsed ? "Menyunu aç" : "Menyunu yığ"}>
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        <span className="sidebar-text">Menyunu yığ</span>
      </button>
    </aside>
  );
}
