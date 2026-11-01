import s from "@/shared/styles/HeroAction.module.css";

// Başlıq zolağındakı ağ əməliyyat düyməsi
export const heroActionClass = (extra = "") => (extra ? `${s.action} ${extra}` : s.action);
