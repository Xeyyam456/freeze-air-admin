// Depo köməkçiləri bir yerdən (köhnə böyük fayllar bölünənə qədər; yeni kod birbaşa fayldan import etsin)
export type * from "@/types/depot";
export { norm } from "@/shared/utils/norm";
export { PIECE_MAX, STALE_DAYS, UNITS } from "../constants/limits";
export { REASONS, REQUEST_TYPES } from "../constants/requests";
export { TEXT } from "../constants/text";
export { dateAz, daysSince, timeAz } from "./dates";
export { fmt, isPacked, packSuffix, parseQty, pieceWord, round2, showQty, unitOf, withUnit } from "./quantity";
export { needsOtherApprover, requestLabel } from "./requests";
export { isLowStock, lossText } from "./stock";
