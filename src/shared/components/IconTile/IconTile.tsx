import type { ElementType } from "react";
import type { StyledProps } from "@/types/shared";
import { iconTileClass } from "./iconTileClass";

export function IconTile<T extends ElementType = "span">({ as, className = "", ...rest }: StyledProps<T>) {
  const Tag: ElementType = as ?? "span";
  return <Tag className={iconTileClass(className)} {...(rest as object)} />;
}
