import type { LucideIcon } from "lucide-react";
import type { Tone } from "./Tone";

export type DHeadProps = {
  id: string;
  icon: LucideIcon;
  tone: Tone;
  title: string;
  sub?: React.ReactNode;
  onClose: () => void;
  children?: React.ReactNode;
  flush?: boolean;
};
