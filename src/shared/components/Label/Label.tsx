import type { ElementType } from "react";
import type { LabelProps } from "@/types/shared";
import { labelClass } from "./labelClass";

// Sahə etiketi (standart <span>); stil shared/styles/Field.module.css-dədir
export function Label<T extends ElementType = "span">({ as, className = "", ...rest }: LabelProps<T>) {
  const Tag: ElementType = as ?? "span";
  return <Tag className={labelClass(className)} {...(rest as object)} />;
}
