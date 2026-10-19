import { useState } from "react";

// Brauzerdə yadda qalan kiçik seçim (menyu yığılıb, kart/cədvəl görünüşü).
// localStorage əlçatan olmasa (gizli pəncərə və s.) standart dəyər işlənir.
export function usePref<T extends string | boolean>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(`pref:${key}`);
      return raw == null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  const set = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(`pref:${key}`, JSON.stringify(v));
    } catch {
      /* yadda saxlanmasa da işləyir */
    }
  };
  return [value, set] as const;
}
