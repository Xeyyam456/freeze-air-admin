export type ConfirmButtonProps = {
  onConfirm: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  title?: string;
  question?: React.ReactNode;
  confirmLabel?: string;
  // Uğurdan sonra tost; false → tost yoxdur (onConfirm özü bildirir)
  success?: string | false;
};
