import type { Store } from "./Store";
import type { Kind } from "@/types/clients";

export type EditStoreModalProps = { store: Store; kind: Kind; onClose: () => void };
