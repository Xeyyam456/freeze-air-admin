import type { Announcement } from "./Announcement";

export type AnnouncementListProps = {
  items: Announcement[] | null;
  me: string | null;
  admin: boolean;
};
