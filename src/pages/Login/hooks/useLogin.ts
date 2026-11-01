import { useActionState, useState } from "react";
import { useNavigate } from "react-router";
import { signIn } from "@/services/auth/signIn";
import { toast } from "@/lib/toast";

// Giriş: e-poçt + parol; uğurda panelə, səhvdə tost
export function useLogin() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [, formAction, pending] = useActionState(async (_prev: null, formData: FormData) => {
    const ok = await signIn(String(formData.get("email")), String(formData.get("password")));
    if (!ok) {
      toast.error("E-poçt və ya parol səhvdir.");
      return null;
    }
    navigate("/", { replace: true });
    return null;
  }, null);

  return { show, toggleShow: () => setShow((v) => !v), formAction, pending };
}
