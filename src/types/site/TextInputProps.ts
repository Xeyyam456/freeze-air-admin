import type { TextField } from "./TextField";

export type TextInputProps = { field: TextField; value: string; dirty: boolean; onChange: (v: string) => void; onReset: () => void };
