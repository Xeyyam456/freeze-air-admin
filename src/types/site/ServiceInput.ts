import type { SiteService } from "./SiteService";

export type ServiceInput = Omit<SiteService, "id">;
