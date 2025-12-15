import { supabase } from "./supabaseClient.js";

/**
 * Expects a table like: public.wallet_balances(user_id uuid pk/fk, usdt_balance numeric, updated_at timestamptz)
 * RLS should allow each user to select their own row.
 */
export async function getUsdtBalance(userId){
  const { data, error } = await supabase
    .from("wallet_balances")
    .select("usdt_balance, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if(error) throw error;
  return data ?? { usdt_balance: 0, updated_at: null };
}
