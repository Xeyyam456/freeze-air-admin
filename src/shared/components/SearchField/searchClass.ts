import s from "@/shared/styles/Search.module.css";

// İri axtarış sahəsi: <div className={searchClass()}><Search /><input /></div>
export const searchClass = (extra = "") => (extra ? `${s.search} ${extra}` : s.search);
