import type { CardProps } from "@/types/shared";
import { cardClass } from "./cardClass";

// Ağ kart; stil shared/styles/Card.module.css-dədir
export function Card({ as: Tag = "div", className = "", ...rest }: CardProps) {
  return <Tag className={cardClass(className)} {...rest} />;
}
