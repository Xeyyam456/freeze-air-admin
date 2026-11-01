import s from "./styles/StoreCard.module.css";

// Tünd kod kvadratı: kartda və redaktə pəncərəsində eyni görünüş
export const storeCodeClass = (extra = "") => (extra ? `${s.code} ${extra}` : s.code);
