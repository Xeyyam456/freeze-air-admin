import type { ElementType } from "react";
import type { CardProps } from "@/types/shared";
import { cardClass, cardLinkClass } from "./cardClass";

// Ağ kart; stil shared/styles/Card.module.css-dədir. `as` ilə <section>, <li>, <form>, <Link> və s.
export function Card<T extends ElementType = "div">({ as, link = false, className = "", ...rest }: CardProps<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={(link ? cardLinkClass : cardClass)(className)} {...(rest as object)} />;
}
