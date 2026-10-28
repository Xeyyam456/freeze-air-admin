import type { ComponentPropsWithRef } from "react";
import type { ButtonVariant } from "./ButtonVariant";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  size?: "md" | "sm";
};
