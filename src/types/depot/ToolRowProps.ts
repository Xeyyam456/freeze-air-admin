import type { Tool } from "./Tool";
import type { Loss } from "./Loss";

export type ToolRowProps = { t: Tool; losses: Loss[]; canManage: boolean; onOpen: () => void; onGive: () => void };
