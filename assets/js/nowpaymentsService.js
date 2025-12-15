import { supabase } from "./supabaseClient.js";
import { CONFIG } from "./config.js";

/**
 * Calls Supabase Edge Function nowpayments-create-payment.
 * IMPORTANT: Do NOT put the NOWPayments API key in the browser.
 * The function should use the NOWPayments API key server-side.
 */
export async function createPayment({ amount, currency="USDT", network="BEP20" }){
  const { data, error } = await supabase.functions.invoke(CONFIG.FN_CREATE_PAYMENT, {
    body: { amount, currency, network }
  });
  if(error) throw error;
  return data;
}
