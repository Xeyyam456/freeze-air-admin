import type { TextGroup } from "./TextGroup";

export type TextGroupNavProps = { groups: TextGroup[]; current: string; onSelect: (id: string) => void; changedIn: (id: string) => boolean };
