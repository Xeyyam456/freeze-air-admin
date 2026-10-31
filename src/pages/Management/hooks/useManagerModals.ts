import { useState } from "react";
import type { ManagerModalState } from "@/types/management";

type Mode = "view" | "edit" | "contact" | null;

// Kartın pəncərələri: məlumat, redaktə, telefon/şəkil (eyni anda biri açıq)
export function useManagerModals(): ManagerModalState {
  const [mode, setMode] = useState<Mode>(null);
  return {
    viewing: mode === "view",
    editing: mode === "edit",
    contact: mode === "contact",
    open: () => setMode("view"),
    edit: () => setMode("edit"),
    openContact: () => setMode("contact"),
    close: () => setMode(null),
  };
}
