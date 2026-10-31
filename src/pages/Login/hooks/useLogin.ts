import { useActionState, useState } from "react";
import { useNavigate } from "react-router";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

// Giriş: e-poçt + parol; uğurda panelə, səhvdə tost
export function useLogin() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [, formAction, pending] = useActionState(async (_prev: null, formData: FormData) => {
    const { error } = await createClient().auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    if (error) {
      toast.error("E-poçt və ya parol səhvdir.");
      return null;
    }
    navigate("/", { replace: true });
    return null;
  }, null);

  return { show, toggleShow: () => setShow((v) => !v), formAction, pending };
}
