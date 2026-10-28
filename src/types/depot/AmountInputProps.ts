import type { Tool } from "./Tool";

export type AmountInputProps = {
  tool: Tool | null; text: string; onText: (v: string) => void; byPack: boolean; onByPack: (v: boolean) => void; label?: string;
};
