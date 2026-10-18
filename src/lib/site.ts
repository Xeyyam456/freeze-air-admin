import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";

// Açıq saytın ünvanı (canlıda .env-də VITE_SITE_URL)
export const SITE_URL = import.meta.env.VITE_SITE_URL ?? "http://localhost:3000";

// Saytın məzmunu dəyişəndən sonra: admin siyahıları yenilənir və açıq saytın keşi dərhal təmizlənir
// (web `/api/revalidate`: admin sessiyası ilə təsdiqlənir). Alınmasa sayt ən gec ~5 saniyəyə özü yenilənir.
export function revalidateSite() {
  revalidate();
  void createClient().auth.getSession().then(({ data }) => {
    const token = data.session?.access_token;
    if (!token) return;
    return fetch(`${SITE_URL}/api/revalidate`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  }).catch(() => {});
}
