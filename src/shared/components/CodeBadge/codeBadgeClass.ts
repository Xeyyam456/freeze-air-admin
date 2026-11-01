import s from "@/shared/styles/CodeBadge.module.css";

// Tünd kod nişanı (ARZ-001 kimi)
export const codeBadgeClass = (extra = "") => (extra ? `${s.badge} ${extra}` : s.badge);
