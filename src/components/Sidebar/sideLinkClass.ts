import s from "./styles/Sidebar.module.css";

// Menyu bəndi görünüşü (LogoutButton da işlədir)
export const sideLinkClass = (extra = "") => (extra ? `${s.link} ${extra}` : s.link);
