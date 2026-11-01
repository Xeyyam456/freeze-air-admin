import type { ElementType } from "react";
import type { PolymorphicProps } from "./PolymorphicProps";

// Yalnız görünüşü olan kiçik komponentlər (IconTile, CodeBadge, CarPlate…): className + `as`
export type StyledProps<T extends ElementType> = PolymorphicProps<T, { className?: string }>;
