import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AuthState } from "@/types/auth";
import { EMPTY_AUTH } from "./emptyAuthState";

export async function loadAuthState(session: Session | null): Promise<AuthState> {
  if (!session) return EMPTY_AUTH;
  const supabase = createClient();
  const [{ data: admin }, { data: owner }, { data: employee }, { data: profile }] = await Promise.all([
    supabase.rpc("is_admin"),
    supabase.rpc("is_owner"),
    supabase.from("employees").select("id, full_name, position, photo_url, is_storekeeper, is_active").eq("user_id", session.user.id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", session.user.id).maybeSingle(),
  ]);
  // Bazadakı can_manage_tools() ilə eyni qayda (təhlükəsizlik orada, burada yalnız UI)
  const storekeeper = !!employee?.is_storekeeper && !!employee.is_active;
  return {
    loading: false, session, email: session.user.email ?? null, admin: admin === true, owner: owner === true,
    storekeeper, canManageTools: admin === true || storekeeper,
    name: employee?.full_name ?? profile?.full_name ?? null,
    position: employee?.position ?? null,
    linked: !!employee,
    employeeId: employee?.id ?? null,
    photoUrl: employee?.photo_url ?? null,
  };
}
