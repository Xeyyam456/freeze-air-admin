import type { SiteSegment } from "./SiteSegment";

export type SegmentInput = Omit<SiteSegment, "id" | "updated_at">;
