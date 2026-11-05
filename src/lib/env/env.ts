// Bütün env dəyişənləri yalnız burada oxunur; ünvan dəyişəndə yalnız .env / Vercel env dəyişir.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Açıq saytın ünvanı (canlıda VITE_SITE_URL)
export const SITE_URL = import.meta.env.VITE_SITE_URL ?? "http://localhost:3000";
