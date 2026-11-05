import type { DashCardProps } from "@/types/dashboard";
import { CardMenu } from "../CardMenu";
import s from "./DashCard.module.css";

// Dashboard kartı: başlıq, alt yazı, sağ yuxarıda "…" menyusu (dövr seçimi, əməliyyatlar).
// tone: kartın vurğu rəngi — fon küncdən zəif rənglənir, içində yavaş gəzən işıq, üst kənarda keçən parıltı.
export function DashCard({ title, subtitle, menu, tone, className = "", children }: DashCardProps) {
  return (
    <section className={`${s.card} ${className}`} data-tone={tone}>
      {tone && <span className={s.glow} aria-hidden="true" />}
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
