import type { ElementType } from "react";
import type { ButtonVariant } from "./ButtonVariant";
import type { PolymorphicProps } from "./PolymorphicProps";

export type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: "md" | "sm";
  className?: string;
};

// <Button>, <Button as="a" href=…>, <Button as={Link} to=…>
export type ButtonProps<T extends ElementType = "button"> = PolymorphicProps<T, ButtonOwnProps>;
