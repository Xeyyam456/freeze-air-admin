import type { ErrorCode } from "./ErrorCode";
import type { ErrorCodeMapState } from "./ErrorCodeMapState";

export type CodeMapProps = { map: ErrorCodeMapState; onPick: (c: ErrorCode) => void; onCreate: (code: string) => void };
