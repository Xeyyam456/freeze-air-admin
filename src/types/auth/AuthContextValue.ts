import type { AuthState } from "./AuthState";

export type AuthContextValue = AuthState & { reload: () => Promise<void> };
