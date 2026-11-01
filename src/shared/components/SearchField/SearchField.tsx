import type { ElementType } from "react";
import type { StyledProps } from "@/types/shared";
import { searchClass } from "./searchClass";

export function SearchField<T extends ElementType = "div">({ as, className = "", ...rest }: StyledProps<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={searchClass(className)} {...(rest as object)} />;
}
