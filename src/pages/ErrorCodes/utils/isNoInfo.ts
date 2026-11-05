import type { ErrorCode } from "@/types/errorCodes";

// Kitabçada izahı olmayan kod ("Xəta barədə məlumat yoxdur")
export function isNoInfo(c: ErrorCode) {
  return c.title.trim().toLowerCase().startsWith("xəta barədə məlumat yoxdur");
}
