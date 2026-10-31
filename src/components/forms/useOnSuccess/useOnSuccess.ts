import { useEffect, useRef } from "react";
import type { FormState } from "@/lib/form-state";
import { toast } from "@/lib/toast";

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
