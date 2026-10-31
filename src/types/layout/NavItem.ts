import type { LucideIcon } from "lucide-react";
import type { NavBadge } from "./NavBadge";

// ownerOnly: yalnız müdir görür (saytın məzmununu digər rəhbərlər dəyişmir, 0069)
export type NavItem = { href: string; label: string; icon: LucideIcon; badge?: NavBadge; ownerOnly?: boolean };
