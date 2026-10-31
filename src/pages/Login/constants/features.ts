import { Globe, Users, Warehouse } from "lucide-react";
import type { LoginFeature } from "@/types/login";

export const FEATURES: LoginFeature[] = [
  { icon: Users, title: "Ustalar və tapşırıqlar", text: "Günün işini ustalara ver, görülənləri izlə." },
  { icon: Warehouse, title: "Depo və iş qeydləri", text: "Alət, material və görülən işlər bir yerdə." },
  { icon: Globe, title: "Saytın məzmunu", text: "Mətn, xidmət və şəkilləri dəyiş, sayta dərhal düşsün." },
];
