import type { LocationLogEntry } from "./LocationLogEntry";
import type { LocationUnit } from "./LocationUnit";

export type LocationLogModalProps = { logs: LocationLogEntry[]; unitOf: Map<number, LocationUnit>; onClose: () => void };
