import type { DepotEmployee } from "./DepotEmployee";

export type PersonHeadProps = { emp: DepotEmployee; toolsN: number; matsN: number; waiting: number; onClose: () => void };
