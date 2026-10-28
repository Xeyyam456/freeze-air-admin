import type { Holding } from "./Holding";
import type { Tool } from "./Tool";

// toolName verilirsə: usta pəncərəsində (sətirdə usta yox, alətin adı göstərilir)
export type HolderRowProps = {
  holding: Holding;
  canManage: boolean;
  tool: Tool | undefined;
  toolName?: string;
  pendingReturn: boolean;
};
