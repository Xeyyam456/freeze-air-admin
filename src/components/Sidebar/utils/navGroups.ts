import {
  Building2, CalendarCheck, CalendarOff, ClipboardList, Fuel, Globe, Inbox, LayoutGrid, ListChecks, Megaphone, MessagesSquare, Store, TriangleAlert, UserCog, Users, Warehouse,
} from "lucide-react";
import type { NavBadge, NavGroup } from "@/types/layout";

// Menyu qrupları: gündəlik iş yuxarıda, nadir açılan bölmələr aşağıda
export const GROUPS: NavGroup[] = [
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
      { href: "/qruplar", label: "Qruplar", icon: MessagesSquare },
      { href: "/elanlar", label: "Elanlar", icon: Megaphone, badge: "announce" },
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

// Bütün nişanlar qırmızıdır (istifadəçi, 2026-10-23); növ fərqi başlıqdakı izahdadır
export const BADGE_STYLE = "bg-danger text-white";
export const BADGE_TITLE: Record<NavBadge, string> = {
  requests: "baxılmamış müraciət",
  tasks: "bu gün gözləyən tapşırıq",
  stock: "depo",
  leave: "gözləyən icazə sorğusu",
  announce: "oxunmamış elan",
};

export function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
