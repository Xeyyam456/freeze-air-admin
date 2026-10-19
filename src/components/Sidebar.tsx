import { Link, useLocation } from "react-router";
import {
  Building2, ClipboardList, Globe, Inbox, LayoutGrid, ListChecks, PanelLeftClose, PanelLeftOpen,
  Snowflake, Store, TriangleAlert, UserCog, Users, Warehouse,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import { isLowStock } from "@/components/depot/DepotForms";

type Badge = "requests" | "tasks" | "stock";

// Menyu qrupları: gündəlik iş yuxarıda, nadir açılan bölmələr aşağıda
const GROUPS: { title: string; items: { href: string; label: string; icon: typeof LayoutGrid; badge?: Badge }[] }[] = [
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
    items: [{ href: "/sayt", label: "Saytın məzmunu", icon: Globe }],
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

// Nişanlar: baxılmamış müraciət (qırmızı), bugünkü gözləyən tapşırıq (mavi), depoda azalan (sarı)
function useBadges() {
  return useData(async () => {
    const supabase = createClient();
    const [requests, tasks, stock] = await Promise.all([
      supabase.from("contact_requests").select("*", { count: "exact", head: true }).eq("handled", false).then((r) => r.count ?? 0),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("task_date", localDate()).eq("done", false).then((r) => r.count ?? 0),
      supabase.from("tool_stock").select("min_stock, available, pieces_total")
        .then((r) => (r.data ?? []).filter((t) => isLowStock({ min_stock: t.min_stock, available: t.available ?? 0, pieces_total: t.pieces_total ?? 0 })).length),
    ]);
    return { requests, tasks, stock } satisfies Record<Badge, number>;
  });
}

const BADGE_STYLE: Record<Badge, string> = {
  requests: "bg-danger text-white",
  tasks: "bg-primary text-white",
  stock: "bg-amber-400 text-navy",
};
const BADGE_TITLE: Record<Badge, string> = {
  requests: "baxılmamış müraciət",
  tasks: "bu gün gözləyən tapşırıq",
  stock: "depoda azalan",
};

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { pathname } = useLocation();
  const badges = useBadges();

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
        {GROUPS.map((g) => (
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
                    <span className={`side-badge ${BADGE_STYLE[badge!]}`} title={`${n} ${BADGE_TITLE[badge!]}`}>{n}</span>
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
