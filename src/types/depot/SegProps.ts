export type SegProps<T extends string> = { value: T; onChange: (v: T) => void; items: readonly (readonly [T, string])[]; label: string };
