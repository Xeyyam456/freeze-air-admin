import { createClient } from "@/lib/supabase/client";
import type { FeedGroup, VoiceResult } from "@/types/feed";

const randomName = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// Səs şərhi: fayl `feed-audio/<mənim id>/<ad>` yoluna yüklənir (RLS: yalnız öz qovluğuna), sonra şərh sətri yazılır.
// Yazma xətası olsa yüklənmiş fayl geri silinir. Müəllifə push bazadakı tetikleyicidir (0116: "🎤 Səs mesajı")
export async function addVoiceComment(logId: number, group: FeedGroup, me: number, v: VoiceResult): Promise<void> {
  const supabase = createClient();
  const type = v.mime.split(";")[0] || "audio/webm";
  const path = `${me}/${randomName()}.${type.includes("mp4") ? "m4a" : "webm"}`;
  const up = await supabase.storage.from("feed-audio").upload(path, v.blob, { contentType: type });
  if (up.error) throw new Error(up.error.message);
  const { error } = await supabase.from("feed_comments").insert({ work_log_id: logId, grp: group, employee_id: me, body: "", audio_path: path, audio_ms: Math.max(1, v.ms), audio_peaks: v.peaks });
  if (error) {
    await supabase.storage.from("feed-audio").remove([path]).catch(() => undefined);
    throw new Error(error.message);
  }
}
