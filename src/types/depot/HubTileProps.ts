import type { Wrench } from "lucide-react";
import type { Tone } from "./Tone";

export type HubTileProps = {
  icon: typeof Wrench; tone: Tone; title: string; big: number; unit: string;
  rows: { label: string; value: string; dot: string }[]; bar?: { n: number; c: string }[]; onClick: () => void;
};
