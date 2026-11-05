import type { DashCardProps } from "@/types/dashboard";
import { CardMenu } from "../CardMenu";
import s from "./DashCard.module.css";

// Dashboard kartı: başlıq, alt yazı, sağ yuxarıda "…" menyusu (dövr seçimi, əməliyyatlar)
export function DashCard({ title, subtitle, menu, className = "", children }: DashCardProps) {
  return (
    <section className={`${s.card} ${className}`}>
      {(title || menu) && (
        <header className={s.head}>
          <div className="min-w-0">
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {menu && <CardMenu label={title ?? "Kart"} items={menu} />}
        </header>
      )}
      {children}
    </section>
  );
}
