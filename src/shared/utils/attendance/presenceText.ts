import type { Presence } from "@/types/attendance";
import { timeBaku } from "../timeBaku";
import { sessionNo } from "./sessionNo";

// Seanslar: "1) 09:02 – 13:00, 2) 15:10-dən" (bir seansdırsa "09:02 – 18:10")
// sep = "\n": hər seans ayrıca sətirdə (whitespace-pre-line ilə göstər)
export function presenceText(p: Presence, sep = ", ") {
  return p.sessions.map((x, i) => sessionNo(i, p.sessions.length) + (x.out ? `${timeBaku(x.in)} – ${timeBaku(x.out)}` : `${timeBaku(x.in)}-dən`)).join(sep);
}
