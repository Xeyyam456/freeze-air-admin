import type { ElementType } from "react";
import type { PolymorphicProps } from "./PolymorphicProps";

export type CardOwnProps = {
  // true: üzərinə gələndə qalxan keçid kartı (<Card as={Link} link to=…>)
  link?: boolean;
  className?: string;
};

export type CardProps<T extends ElementType = "div"> = PolymorphicProps<T, CardOwnProps>;

export type CardTitleProps<T extends ElementType = "h2"> = PolymorphicProps<T, { className?: string }>;
