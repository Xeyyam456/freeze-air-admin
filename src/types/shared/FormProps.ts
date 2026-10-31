export type FormProps = {
  action: (formData: FormData) => void;
  className: string;
  children: React.ReactNode;
};
