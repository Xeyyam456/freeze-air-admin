import { createClient } from "@/lib/supabase/client";

// Cihazın push abunəliyini bazaya yazır (eyni cihaz başqa hesabla açılıbsa köhnə sahibdən götürülür)
export async function savePushSubscription(sub: PushSubscription) {
  const json = sub.toJSON();
  const { error } = await createClient().rpc("push_subscribe", {
    p_app: "admin",
    p_endpoint: sub.endpoint,
    p_p256dh: json.keys?.p256dh ?? "",
    p_auth: json.keys?.auth ?? "",
    p_user_agent: navigator.userAgent,
  });
  if (error) throw error;
}

export async function removePushSubscription(endpoint: string) {
  await createClient().rpc("push_unsubscribe", { p_endpoint: endpoint });
}
