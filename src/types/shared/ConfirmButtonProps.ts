import type { ButtonVariant } from "./ButtonVariant";

export type ConfirmButtonProps = {
  onConfirm: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  title?: string;
  question?: React.ReactNode;
  confirmLabel?: string;
  // Uğurdan sonra tost; false → tost yoxdur (onConfirm özü bildirir)
  success?: string | false;
  // Görünüş: variant → Button, icon → IconButton (danger: qırmızı hover); heç biri yoxdursa xam düymə (className ilə)
  variant?: ButtonVariant;
  size?: "md" | "sm";
  icon?: boolean;
  danger?: boolean;
};
