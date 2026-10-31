import type { LucideIcon } from "lucide-react";
import type { PickerItem } from "./PickerItem";

export type PickerOptionProps = { item: PickerItem; index: number; active: boolean; selected: boolean; icon: LucideIcon; onActive: (i: number) => void; onChoose: (item: PickerItem) => void };
