export type QuantityInputProps = {
  limit: number;
  limitText: (limit: number, wanted: number) => string; // xəta mətni
  className?: string;
  defaultValue?: number;
  min?: number; // ən az dəyər (materialda "işlədilib" üçün 0)
  onValid?: (ok: boolean) => void;
  onValue?: (n: number) => void; // hər dəyişmədə cari dəyər
};
