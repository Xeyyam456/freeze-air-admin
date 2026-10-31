import type { EquipmentOption } from "./EquipmentOption";

export type EquipmentTogglesProps = { options: EquipmentOption[]; selected: string[]; onToggle: (key: string) => void };
