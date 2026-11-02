import type { AuthState } from "@/types/auth";

export const EMPTY_AUTH: AuthState = { loading: false, session: null, email: null, admin: false, owner: false, storekeeper: false, canManageTools: false, name: null, position: null, linked: false, employeeId: null, photoUrl: null };
