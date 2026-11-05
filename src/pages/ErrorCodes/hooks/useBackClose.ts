import { useEffect } from "react";

const KEY = "codeSheet";

// Pəncərə açılanda tarixçəyə bir addım yazılır: brauzerin (telefonun) "geri" düyməsi səhifədən çıxmır, pəncərəni bağlayır.
// X, Esc və kənara klik də həmin addımı geri alır, ona görə sonrakı "geri" əvvəlki səhifəyə aparır.
export function useBackClose(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ ...window.history.state, [KEY]: true }, "");
    const onPop = () => onClose();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open, onClose]);

  // Bağlama düymələri üçün: addım hələ tarixçədədirsə geri qayıt (popstate pəncərəni bağlayır), yoxdursa birbaşa bağla
  return () => (window.history.state?.[KEY] ? window.history.back() : onClose());
}
