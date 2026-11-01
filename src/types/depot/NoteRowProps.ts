export type NoteRowProps = {
  note?: string; onNote?: (v: string) => void; file: File | null; onFile: (f: File | null) => void; placeholder?: string; required?: boolean;
};
