export type ModalProps = {
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
};
