// Ustaların giriş hesabları: enabled — gizli açar qurulubmu; emails — usta id → e-poçt
export type Accounts = { enabled: boolean; emails: Record<number, string> };
