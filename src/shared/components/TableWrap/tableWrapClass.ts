import s from "@/shared/styles/TableWrap.module.css";

// Çərçivəli, sürüşən cədvəl qabı
export const tableWrapClass = (extra = "") => (extra ? `${s.wrap} ${extra}` : s.wrap);
