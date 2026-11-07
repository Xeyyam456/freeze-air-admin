import type { FeedComment } from "./FeedComment";
import type { FeedGroup } from "./FeedGroup";
import type { FeedPost } from "./FeedPost";
import type { Reaction } from "./Reaction";

export type FeedCardProps = { post: FeedPost; group: FeedGroup; meId: number | null; moderator: boolean };
export type FeedActionsProps = FeedCardProps;
export type FeedFilesProps = { post: FeedPost };
export type FeedTabsProps = { group: FeedGroup; onChange: (g: FeedGroup) => void; counts: Record<FeedGroup, number | null> };
export type CommentsModalProps = { logId: number; group: FeedGroup; meId: number | null; moderator: boolean; onClose: () => void };
export type LikersModalProps = { logId: number; group: FeedGroup; onClose: () => void };
export type LightboxProps = { images: string[]; start: number; onClose: () => void };
export type CommentRowProps = { c: FeedComment; mine: boolean; canDelete: boolean; onDelete: (c: FeedComment) => void };
export type ReactFn = (post: FeedPost, kind: Reaction) => void;
