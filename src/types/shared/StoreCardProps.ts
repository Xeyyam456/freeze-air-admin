import type { Tables } from "@/types/database";

export type StoreCardProps = {
  store: Tables<"stores">;
  companyName?: string;
  action?: React.ReactNode;
};
