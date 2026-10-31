import type { SiteService } from "./SiteService";

export type ServiceEditorProps = { service: SiteService | null; nextSort: number; onClose: () => void };
