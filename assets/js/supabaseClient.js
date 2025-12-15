import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { CONFIG } from "./config.js";

export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export async function requireAuth(redirectTo="login.html"){
  const { data: { session } } = await supabase.auth.getSession();
  if(!session){
    window.location.href = redirectTo;
    return null;
  }
  return session;
}
