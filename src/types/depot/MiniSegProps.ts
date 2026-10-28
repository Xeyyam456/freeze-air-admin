export type MiniSegProps<T extends string | boolean> = { value: T; onChange: (v: T) => void; items: [T, string][]; label: string };
