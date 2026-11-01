import type { ElementType } from "react";
import type { StyledProps } from "@/types/shared";
import { segClass } from "./segClass";

export function Segmented<T extends ElementType = "div">({ as, className = "", ...rest }: StyledProps<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={segClass(className)} {...(rest as object)} />;
}
