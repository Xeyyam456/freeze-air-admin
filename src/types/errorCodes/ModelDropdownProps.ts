import type { LucideIcon } from "lucide-react";
import type { ModelOption } from "./ModelOption";

// all: "Bütün modellər" kimi ümumi seçim (boş dəyər) üçün ikon fərqli olur; icon: siyahı elementlərinin ikonu
export type ModelDropdownProps = {
  value: string;
  onChange: (v: string) => void;
  options: ModelOption[];
  name?: string;
  placeholder?: string;
  all?: boolean;
  icon?: LucideIcon;
  className?: string;
};
