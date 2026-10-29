import type { Place } from "./Place";

export type PlacePickerProps = { places: Place[]; value: Place | null; onChange: (p: Place | null) => void };
