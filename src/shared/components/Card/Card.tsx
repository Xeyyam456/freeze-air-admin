import type { CardProps } from "@/types/shared";

// Ağ kart (qlobal .card class-ı; sonra Card.module.css-ə köçəcək)
export function Card({ as: Tag = "div", className = "", ...rest }: CardProps) {
  return <Tag className={`card ${className}`.trim()} {...rest} />;
}
