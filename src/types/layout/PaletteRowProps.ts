import type { PaletteItem } from "./PaletteItem";

export type PaletteRowProps = { item: PaletteItem; index: number; active: boolean; head: string | null; onHover: (i: number) => void; onOpen: (i: PaletteItem) => void };
