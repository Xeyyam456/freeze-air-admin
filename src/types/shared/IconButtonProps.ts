import type { ElementType } from "react";
import type { PolymorphicProps } from "./PolymorphicProps";

export type IconButtonOwnProps = {
  // true: üzərinə gələndə qırmızı (silmə)
  danger?: boolean;
  className?: string;
};

export type IconButtonProps<T extends ElementType = "button"> = PolymorphicProps<T, IconButtonOwnProps>;
