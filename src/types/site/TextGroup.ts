import type { TextField } from "./TextField";

export type TextGroup = { id: string; title: string; hint?: string; sections: { title: string; fields: TextField[] }[] };
