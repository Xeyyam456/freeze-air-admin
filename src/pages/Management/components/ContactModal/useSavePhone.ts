import { useState } from "react";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { ManagerModalProps } from "@/types/management";

// Telefonu yadda saxla (bazada employees_guard_management yalnız telefon və şəkilə icazə verir, 0069)
export function useSavePhone({ manager, onClose }: ManagerModalProps) {
  const [phone, setPhone] = useState(manager.phone ?? "");
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const { error } = await createClient().from("employees").update({ phone: phone.trim() || null }).eq("id", manager.id);
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("Telefon yadda saxlanıldı");
    revalidate();
    onClose();
  }

  return { phone, setPhone, pending, save };
}
