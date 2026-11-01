import s from "@/shared/styles/Segmented.module.css";

// Kiçik düymələr qrupu (role="tablist" / "radiogroup"); seçilmiş düymədə aria-selected="true"
export const segClass = (extra = "") => (extra ? `${s.seg} ${extra}` : s.seg);
