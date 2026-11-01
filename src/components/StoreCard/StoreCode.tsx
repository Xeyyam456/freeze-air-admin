import type { ElementType } from "react";
import type { StyledProps } from "@/types/shared";
import s from "./StoreCard.module.css";

export function StoreCode<T extends ElementType = "span">({ as, className = "", ...rest }: StyledProps<T>) {
  const Tag: ElementType = as ?? "span";
  return <Tag className={[s.code, className].filter(Boolean).join(" ")} {...(rest as object)} />;
}
