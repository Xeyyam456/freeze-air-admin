export type DateTriggerProps = {
  label: string | null;
  placeholder: string;
  open: boolean;
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  small?: boolean;
};
