import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Realtime kanalı açır: configure içində `.on(...)` zənciri qurulur, qaytarılan funksiya kanalı bağlayır
export function openChannel(name: string, configure: (channel: RealtimeChannel) => RealtimeChannel): () => void {
  const supabase = createClient();
  const channel = configure(supabase.channel(name)).subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
