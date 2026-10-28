import type { DepotRequest } from "@/types/depot";
import { REQUEST_TYPES } from "../constants/requests";

// Sənədin adı: ustanın istəyi materialdırsa "Material istəyi", alətdirsə "Alət istəyi" (istifadəçi: material istəyi "alət istəyi" görünürdü)
export const requestLabel = (r: Pick<DepotRequest, "type" | "tool_kind">) =>
  r.type === "request" ? (r.tool_kind === "material" ? "Material istəyi" : "Alət istəyi") : REQUEST_TYPES[r.type]?.label ?? r.type;

// Yazan öz sənədini təsdiqləyə bilməz (müdirdən başqa; bazada depot_decide eyni qaydanı yoxlayır)
export const needsOtherApprover = (r: Pick<DepotRequest, "type" | "created_by">, myUid: string | null, owner: boolean) =>
  ["receipt", "writeoff", "count"].includes(r.type) && r.created_by === myUid && !owner;
