import type { ComponentPropsWithRef } from "react";

export type IconButtonProps = ComponentPropsWithRef<"button"> & {
  // true: üzərinə gələndə qırmızı (silmə)
  danger?: boolean;
};
