import { CalendarCheck, CalendarOff, ClipboardList, Fuel, Inbox, ListChecks, Megaphone, Warehouse } from "lucide-react";
import type { FlowLaneMeta } from "@/types/dashboard";

// "Günün axını" zolaqları (ikonlar sol menyudakı ilə eynidir); sıra: işin gedişi — müraciət → tapşırıq → iş, sonra komanda və depo
export const FLOW_LANES: FlowLaneMeta[] = [
  { key: "requests", label: "Müraciətlər", icon: Inbox, href: "/muracietler" },
  { key: "tasks", label: "Tapşırıqlar", icon: ListChecks, href: "/tapshiriqlar" },
  { key: "work", label: "Görülən işlər", icon: ClipboardList, href: "/isler" },
  { key: "attendance", label: "Davamiyyət", icon: CalendarCheck, href: "/davamiyyet" },
  { key: "depot", label: "Depo", icon: Warehouse, href: "/depo" },
  { key: "leaves", label: "İcazələr", icon: CalendarOff, href: "/icazeler" },
  { key: "fuel", label: "Yanacaq", icon: Fuel, href: "/yanacaq" },
  { key: "announcements", label: "Elanlar", icon: Megaphone, href: "/elanlar" },
];
