import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AuthState } from "@/types/auth";
import type { AuthContextValue } from "@/types/auth";

const EMPTY: AuthState = { loading: false, session: null, email: null, admin: false, owner: false, storekeeper: false, canManageTools: false, name: null, position: null, linked: false, employeeId: null, photoUrl: null };

const AuthContext = createContext<AuthContextValue>({ ...EMPTY, loading: true, reload: async () => {} });

async function loadState(session: Session | null): Promise<AuthState> {
  if (!session) return EMPTY;
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

// Eyni istifadəçi üçün yoxlama bir dəfə: açılışda (INITIAL_SESSION), hər saat token yenilənəndə (TOKEN_REFRESHED) və
// dev-də StrictMode-un ikinci effektində 4 sorğu təkrar getməsin. Yalnız istifadəçi dəyişəndə və reload()-da yenidən yüklənir.
let cached: { uid: string | null; state: Promise<AuthState> } | null = null;
function loadOnce(session: Session | null, force = false): Promise<AuthState> {
  const uid = session?.user.id ?? null;
  if (force || !cached || cached.uid !== uid) cached = { uid, state: loadState(session) };
  return cached.state.then((s) => (s.session ? { ...s, session } : s)); // token yenilənibsə təzə sessiya
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ ...EMPTY, loading: true });

  useEffect(() => {
    const supabase = createClient();
    // onAuthStateChange qoşulan kimi INITIAL_SESSION verir: ayrıca getSession() lazım deyil
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase tövsiyəsi: callback içində başqa Supabase sorğusunu növbəti tikə keçir
      setTimeout(() => loadOnce(session).then(setState), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Profil adı dəyişəndən sonra çağırılır
  const reload = useCallback(async () => setState(await loadOnce(state.session, true)), [state.session]);

  return <AuthContext.Provider value={{ ...state, reload }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
