import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/env";

// Saytın məzmunu dəyişəndən sonra: admin siyahıları yenilənir və açıq saytın keşi dərhal təmizlənir
// (web `/api/revalidate`: admin sessiyası ilə təsdiqlənir). Alınmasa sayt ən gec ~1 dəqiqəyə özü yenilənir (web SITE_CACHE).
export function revalidateSite() {
  revalidate();
  void createClient().auth.getSession().then(({ data }) => {
    const token = data.session?.access_token;
    if (!token) return;
    return fetch(`${SITE_URL}/api/revalidate`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  }).catch(() => {});
}
