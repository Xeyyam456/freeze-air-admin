import type { Session } from "@supabase/supabase-js";

export type AuthState = {
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
