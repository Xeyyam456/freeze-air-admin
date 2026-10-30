import { STATUS } from "../constants/status";

export const statusOf = (s: string) => STATUS[s] ?? STATUS.pending;
