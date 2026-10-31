import type { SiteImagePickerState } from "./SiteImagePickerState";
import type { SiteService } from "./SiteService";

export type ServiceMediaColumnProps = { service: SiteService | null; nextSort: number; picker: SiteImagePickerState; icon: string; onIcon: (name: string) => void };
