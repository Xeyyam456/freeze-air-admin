import type { ErrorCode } from "./ErrorCode";
import type { Model } from "./Model";

export type EditCodeModalProps = { item: ErrorCode; models: Model[]; onClose: () => void };
