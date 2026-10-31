import type { TextGroup } from "@/types/site";
import { COMMON_TEXTS } from "./textGroups/common";
import { CONTACT_TEXTS } from "./textGroups/contact";
import { EQUIPMENT_TEXTS } from "./textGroups/equipment";
import { HOME_TEXTS } from "./textGroups/home";
import { HOW_TEXTS } from "./textGroups/how";
import { SERVICES_TEXTS } from "./textGroups/services";
import { TEAM_TEXTS } from "./textGroups/team";

// Saytın sabit mətnlərinin qrupları (cədvəl site_texts). Açarlar web/src/lib/site-texts.ts ilə eyni olmalıdır.
export const TEXT_GROUPS: TextGroup[] = [COMMON_TEXTS, HOME_TEXTS, EQUIPMENT_TEXTS, SERVICES_TEXTS, HOW_TEXTS, TEAM_TEXTS, CONTACT_TEXTS];
