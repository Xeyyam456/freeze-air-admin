import s from "@/shared/styles/Plate.module.css";

// Maşın nömrəsi nişanı (AZ zolağı ilə): <span className={plateClass()}>10-AB-123</span>
export const plateClass = (extra = "") => (extra ? `${s.plate} ${extra}` : s.plate);
