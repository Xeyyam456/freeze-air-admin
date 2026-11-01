import s from "@/shared/styles/LogoMark.module.css";

// Firuzəyi qradiyentli loqo kvadratı (menyu və giriş səhifəsi)
export const logoMarkClass = (extra = "") => (extra ? `${s.logo} ${extra}` : s.logo);
