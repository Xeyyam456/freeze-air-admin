import type { LucideIcon } from "lucide-react";
import type { PickerItem } from "./PickerItem";

export type ToolPickerProps = {
  items: PickerItem[];
  value: number | null;
  onChange: (id: number | null) => void;
  name?: string;
  icon?: LucideIcon;
  placeholder?: string;
  emptyLabel?: string;
  searchLabel?: string;
};
