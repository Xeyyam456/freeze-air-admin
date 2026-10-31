import type { Company } from "./Company";
import type { Kind } from "@/types/clients";

export type ClientEditModalProps = { company: Company; kind: Kind; onClose: () => void };
