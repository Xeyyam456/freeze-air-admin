import type { LucideIcon } from "lucide-react";
import type { ContactName } from "./ContactName";

export type ContactFieldDef = { name: ContactName; label: string; icon: LucideIcon; placeholder: string; max: number; type: string; wide?: boolean };
