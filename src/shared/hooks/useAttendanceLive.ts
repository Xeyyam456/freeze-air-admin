import { useEffect } from "react";
import { acquireLive, releaseLive } from "@/services/attendance/liveChannel";

// Davamiyyət cədvəllərinin canlı yenilənməsi (bir ortaq kanal)
export function useAttendanceLive() {
  useEffect(() => {
    acquireLive();
    return releaseLive;
  }, []);
}
