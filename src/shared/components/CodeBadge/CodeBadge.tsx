import type { ElementType } from "react";
import type { StyledProps } from "@/types/shared";
import { codeBadgeClass } from "./codeBadgeClass";

export function CodeBadge<T extends ElementType = "span">({ as, className = "", ...rest }: StyledProps<T>) {
  const Tag: ElementType = as ?? "span";
  return <Tag className={codeBadgeClass(className)} {...(rest as object)} />;
}
