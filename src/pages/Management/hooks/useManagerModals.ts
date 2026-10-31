import { useState } from "react";
import type { ManagerModalState } from "@/types/management";
import type { ManagerModalMode } from "@/types/management";

// Kartın pəncərələri: məlumat, redaktə, telefon/şəkil (eyni anda biri açıq)
export function useManagerModals(): ManagerModalState {
  const [mode, setMode] = useState<ManagerModalMode>(null);
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
