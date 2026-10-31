import { AirVent, Image as ImageIcon, LayoutGrid, List, Phone, ShieldCheck, Type, type LucideIcon } from "lucide-react";

export type SiteTab = "contact" | "texts" | "hero" | "trust" | "segments" | "equipment" | "services";

export const SITE_TABS: { id: SiteTab; label: string; icon: LucideIcon }[] = [
  { id: "contact", label: "Əlaqə", icon: Phone },
  { id: "hero", label: "Ana səhifə", icon: ImageIcon },
  { id: "trust", label: "Etibar və suallar", icon: ShieldCheck },
  { id: "texts", label: "Mətnlər", icon: Type },
  { id: "segments", label: "Obyektlər", icon: LayoutGrid },
  { id: "equipment", label: "Avadanlıq", icon: AirVent },
  { id: "services", label: "Xidmətlər", icon: List },
];
