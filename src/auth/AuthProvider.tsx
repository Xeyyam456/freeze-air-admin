import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthState = {
  loading: boolean;
  session: Session | null;
  email: string | null;
  admin: boolean;
  owner: boolean; // sahib (müdir): rəhbərlik heyətini yalnız o dəyişir
  storekeeper: boolean; // depo məsulu (əməkdaş kartında işarə; təyin edən müdirdir)
  canManageTools: boolean; // depo: mədaxil, vermək, təsdiqləmək — adminlər və depo məsulu (0084)
  // Profildə göstərilən ad: əməkdaşın adı, yoxdursa hesabın öz adı (profiles.full_name)
  name: string | null;
  position: string | null;
  linked: boolean; // hesab əməkdaşa bağlıdır (ad əməkdaş kartından gəlir)
  employeeId: number | null; // öz əməkdaş kartı: profil şəklini yalnız özü (və müdir) dəyişir
  photoUrl: string | null;
};

type AuthContextValue = AuthState & { reload: () => Promise<void> };

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ ...EMPTY, loading: true });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => loadState(data.session).then(setState));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase tövsiyəsi: callback içində başqa Supabase sorğusunu növbəti tikə keçir
      setTimeout(() => loadState(session).then(setState), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Profil adı dəyişəndən sonra çağırılır
  const reload = useCallback(async () => setState(await loadState(state.session)), [state.session]);

  return <AuthContext.Provider value={{ ...state, reload }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
