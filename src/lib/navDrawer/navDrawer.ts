import { createContext, useContext, useEffect, useState } from "react";

// Dar ekranda (< 1024px) menyu sürüşən siyirtmədir; başlıqdakı düymə onu açır
export const NavDrawerContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });
export const useNavDrawer = () => useContext(NavDrawerContext);

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const m = matchMedia(query);
    const on = () => setMatch(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}

// width < 1024px (CSS-dəki media sorğusu ilə eyni sərhəd)
export const useNarrow = () => useMedia("(width < 1024px)");
// 1024–1279px: menyu özü ikon zolağına yığılır (məzmuna yer qalsın)
export const useCompact = () => useMedia("(1024px <= width < 1280px)");
