import type { Tone } from "./Tone";

export type HoldMenuProps = { items: { name: string; qty: string }[]; tone: Tone; word: string; onOpen: () => void };
