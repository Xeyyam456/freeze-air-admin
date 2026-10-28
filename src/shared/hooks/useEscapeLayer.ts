import { useEffect, useRef } from "react";

// Açıq qatların növbəsi (modal, təqvim, açılan siyahı): Esc yalnız ən üstdəkini bağlasın.
const stack: symbol[] = [];

export function useEscapeLayer(onClose: () => void, active = true) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!active) return;
    const id = Symbol("layer");
    stack.push(id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stack[stack.length - 1] === id) onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(id), 1);
    };
  }, [active]);
}
