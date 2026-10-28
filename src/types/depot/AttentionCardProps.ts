import type { Wrench } from "lucide-react";
import type { Tone } from "./Tone";

export type AttentionCardProps = { items: { icon: typeof Wrench; tone: Tone; label: string; hint: string; n: number; onClick: () => void }[] };
