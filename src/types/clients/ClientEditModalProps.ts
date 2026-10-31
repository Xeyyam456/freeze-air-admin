import type { Kind } from "@/lib/kinds";
import type { Company } from "./Company";

export type ClientEditModalProps = { company: Company; kind: Kind; onClose: () => void };
