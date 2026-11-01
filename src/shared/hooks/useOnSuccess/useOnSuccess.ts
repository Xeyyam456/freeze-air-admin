import { useEffect, useRef } from "react";
import { toast } from "@/lib/toast";
import type { FormState } from "@/types/shared";

// Form nəticəsi: uğurda tost + fn (formu təmizlə və ya bağla), xətada xəta tostu.
export function useOnSuccess(state: FormState, fn: () => void = () => {}, success = "Yadda saxlanıldı") {
  const fnRef = useRef(fn);
  const msgRef = useRef(success);
  useEffect(() => {
    fnRef.current = fn;
    msgRef.current = success;
  });
  useEffect(() => {
    if (state?.ok) {
      toast.success(msgRef.current);
      fnRef.current();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);
}
