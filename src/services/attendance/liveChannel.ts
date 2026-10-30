import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { ATTENDANCE_KEYS } from "@/shared/utils/attendance/constants";

// Bir ortaq Realtime kanalı: neçə komponent işlətsə də bir kanal açılır (sonuncu çıxanda bağlanır), hadisədə keş yenilənir.
// Sessiya ilə qoşulur (yoxsa RLS hadisə göndərmir). Açılışda yenidən yükləmir: məlumat keşdən gəlir.
let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
let users = 0;

async function start() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) await supabase.realtime.setAuth(session.access_token);
  if (users === 0 || channel) return; // gözləyərkən hamı çıxıb və ya başqası artıq açıb
  const refresh = () => revalidate(...ATTENDANCE_KEYS);
  channel = supabase
    .channel(`attendance-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, refresh)
    .on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, refresh)
    .on("postgres_changes", { event: "*", schema: "public", table: "attendance_absences" }, refresh)
    .subscribe();
}

export function acquireLive() {
  users += 1;
  if (users === 1) void start();
}

export function releaseLive() {
  users -= 1;
  if (users === 0 && channel) {
    void createClient().removeChannel(channel);
    channel = null;
  }
}
