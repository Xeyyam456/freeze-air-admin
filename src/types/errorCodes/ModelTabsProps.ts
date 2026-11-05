import type { Model } from "./Model";

export type ModelTabsProps = { models: Model[]; counts: Map<number, number>; value: number | null; onChange: (id: number) => void };
