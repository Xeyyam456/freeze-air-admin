import type { SiteSegment } from "./SiteSegment";

export type SegmentCardProps = { segment: SiteSegment; equipmentTitle: (key: string) => string; onEdit: () => void };
