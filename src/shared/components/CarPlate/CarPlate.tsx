import type { ElementType } from "react";
import type { StyledProps } from "@/types/shared";
import { plateClass } from "./plateClass";

export function CarPlate<T extends ElementType = "span">({ as, className = "", ...rest }: StyledProps<T>) {
  const Tag: ElementType = as ?? "span";
  return <Tag className={plateClass(className)} {...(rest as object)} />;
}
