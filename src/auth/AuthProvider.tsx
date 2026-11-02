import type { AuthProviderProps } from "@/types/layout";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { EMPTY_AUTH } from "@/services/auth/emptyAuthState";
import { loadAuthState } from "@/services/auth/loadAuthState";
import type { AuthState } from "@/types/auth";
import type { AuthContextValue } from "@/types/auth";

const AuthContext = createContext<AuthContextValue>({ ...EMPTY_AUTH, loading: true, reload: async () => {} });

// Eyni istifadəçi üçün yoxlama bir dəfə: açılışda (INITIAL_SESSION), hər saat token yenilənəndə (TOKEN_REFRESHED) və
// dev-də StrictMode-un ikinci effektində 4 sorğu təkrar getməsin. Yalnız istifadəçi dəyişəndə və reload()-da yenidən yüklənir.
let cached: { uid: string | null; state: Promise<AuthState> } | null = null;
function loadOnce(session: Session | null, force = false): Promise<AuthState> {
  const uid = session?.user.id ?? null;
  if (force || !cached || cached.uid !== uid) cached = { uid, state: loadAuthState(session) };
  return cached.state.then((s) => (s.session ? { ...s, session } : s)); // token yenilənibsə təzə sessiya
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ ...EMPTY_AUTH, loading: true });

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
