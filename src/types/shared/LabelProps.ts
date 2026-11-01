import type { ElementType } from "react";
import type { PolymorphicProps } from "./PolymorphicProps";

// Sahə etiketi: <Label>, <Label as="legend">
export type LabelProps<T extends ElementType = "span"> = PolymorphicProps<T, { className?: string }>;
