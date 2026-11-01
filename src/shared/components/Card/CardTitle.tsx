import type { ElementType } from "react";
import type { CardTitleProps } from "@/types/shared";
import { cardTitleClass } from "./cardClass";

// Kartın başlığı (standart <h2>)
export function CardTitle<T extends ElementType = "h2">({ as, className = "", ...rest }: CardTitleProps<T>) {
  const Tag: ElementType = as ?? "h2";
  return <Tag className={cardTitleClass(className)} {...(rest as object)} />;
}
