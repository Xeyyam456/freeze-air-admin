import type { Kind } from "@/lib/kinds";
import type { Store } from "./Store";

export type EditStoreModalProps = { store: Store; kind: Kind; onClose: () => void };
