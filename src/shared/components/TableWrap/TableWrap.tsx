import type { ElementType } from "react";
import type { StyledProps } from "@/types/shared";
import { tableWrapClass } from "./tableWrapClass";

export function TableWrap<T extends ElementType = "div">({ as, className = "", ...rest }: StyledProps<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={tableWrapClass(className)} {...(rest as object)} />;
}
