import { Link, useLocation } from "react-router";
import { useAuth } from "@/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import { Building2, ClipboardList, Globe, Inbox, LayoutGrid, Store, Trash2, TriangleAlert, UserCog, Users, Warehouse } from "lucide-react";

const NAV = [
  { href: "/", label: "Panel", icon: LayoutGrid },
  { href: "/sirketler", label: "Şirkətlər", icon: Building2 },
  { href: "/magazalar", label: "Mağazalar", icon: Store },
  { href: "/ustalar", label: "Ustalar", icon: Users },
  { href: "/isler", label: "İşlər", icon: ClipboardList },
  { href: "/rehberlik", label: "Rəhbərlik", icon: UserCog },
  { href: "/depo", label: "Depo", icon: Warehouse },
  { href: "/xeta-kodlari", label: "Xəta kodları", icon: TriangleAlert },
  { href: "/muracietler", label: "Müraciətlər", icon: Inbox },
  { href: "/sayt", label: "Sayt", icon: Globe },
  { href: "/sebet", label: "Səbət", icon: Trash2, adminOnly: true },
] as { href: string; label: string; icon: typeof Globe; adminOnly?: boolean }[];

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavLinks() {
  const { pathname } = useLocation();
  const { admin } = useAuth();
  // Baxılmamış müraciətlərin sayı: menyuda nişan kimi
  const unread = useData(async () => {
    const { count } = await createClient().from("contact_requests").select("*", { count: "exact", head: true }).eq("handled", false);
    return count ?? 0;
  });
  return (
    <nav className="flex items-center gap-1">
      {NAV.filter((n) => !n.adminOnly || admin).map(({ href, label, icon: Icon }) => (
        <Link key={href} to={href} className="nav-link" aria-current={isActive(href, pathname) ? "page" : undefined}>
          <Icon size={16} strokeWidth={2.2} />
          {label}
          {href === "/muracietler" && !!unread && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">{unread}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
