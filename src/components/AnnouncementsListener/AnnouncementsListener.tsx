import { useEffect, useRef } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { LIVE, revalidate } from "@/lib/revalidate";
import { playNotify } from "@/lib/sound";
import { toast } from "@/lib/toast";
import { markAnnouncementsSeen } from "@/services/announcements/announcements";
import { openChannel } from "@/services/realtime/openChannel";
import type { Tables } from "@/types/database";

// Elan yazıldı/silindi (Realtime, 0098): siyahı və menyudakı "Elanlar" nişanı yenilənir.
// Başqasının yeni elanı → tost + səs (push gəlməsə də görünsün); Elanlar səhifəsi açıqdırsa oxunmuş sayılır.
export function AnnouncementsListener() {
  const { session } = useAuth();
  const uid = useRef<string | null>(null);
  useEffect(() => {
    uid.current = session?.user.id ?? null;
  }, [session]);

  useEffect(() => {
    return openChannel("announcements-live", (channel) => channel
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, (payload) => {
        const onPage = window.location.pathname.startsWith("/elanlar");
        if (payload.eventType === "INSERT") {
          const a = payload.new as Tables<"announcements">;
          if (a.created_by !== uid.current) {
            if (onPage) {
              void markAnnouncementsSeen().then(() => revalidate(...LIVE.announcements));
              return;
            }
            toast.success(`Yeni elan: ${a.title}`, a.created_by_name ?? undefined);
            playNotify();
          }
        }
        revalidate(...LIVE.announcements);
      })
    );
  }, []);

  return null;
}
