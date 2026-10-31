import type { Model } from "./Model";

export type ModelSelectProps = { models: Model[]; value: string; onChange: (v: string) => void; name?: string };
