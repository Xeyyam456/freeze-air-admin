import type { ShoppingCart } from "lucide-react";

export type MoreMenuProps = { items: { label: string; icon: typeof ShoppingCart; onClick: () => void; badge?: number }[]; dark?: boolean };
