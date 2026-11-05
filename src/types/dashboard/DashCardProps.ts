import type { CardMenuItem } from "./CardMenuItem";
import type { Tone } from "./Tone";

export type DashCardProps = { title?: string; subtitle?: string; menu?: CardMenuItem[]; tone?: Tone; className?: string; children: React.ReactNode };
