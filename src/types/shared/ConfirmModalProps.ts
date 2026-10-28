import type { LucideIcon } from "lucide-react";

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  tone?: "danger" | "primary";
  pending?: boolean;
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
};
