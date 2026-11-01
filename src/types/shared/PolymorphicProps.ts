import type { ComponentProps, ElementType } from "react";

// `as` ilə tag dəyişən komponentin proplari: Own + seçilmiş elementin öz proplari
export type PolymorphicProps<T extends ElementType, Own> = Own & { as?: T } & Omit<ComponentProps<T>, keyof Own | "as">;
