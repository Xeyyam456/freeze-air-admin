import s from "@/shared/styles/IconButton.module.css";

// Kvadrat ikon düyməsi (redaktə, silmə, bağla); danger=true: üzərinə gələndə qırmızı
export const iconBtnClass = (extra = "", danger = false) => [s.btn, danger && s.danger, extra].filter(Boolean).join(" ");
