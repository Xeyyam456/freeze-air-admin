import type { RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import type { PickerItem } from "./PickerItem";

export type ToolPickerMenuProps = {
  anchor: HTMLElement | null;
  items: PickerItem[];
  value: number | null;
  active: number;
  query: string;
  searchRef: RefObject<HTMLInputElement | null>;
  icon: LucideIcon;
  searchLabel: string;
  onActive: (i: number) => void;
  onQuery: (q: string) => void;
  onChoose: (item: PickerItem) => void;
  onClose: () => void;
};
