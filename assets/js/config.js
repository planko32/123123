export const CONFIG = {
  SUPABASE_URL: "https://oyowsjjmaesspqiknvhp.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95b3dzamptYWVzc3BxaWtudmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTE4NzcsImV4cCI6MjA4MTM4Nzg3N30.aBo32xNG_dh1QD7NBI4N6jhYFLY42Xyxer2DNXxJi-w",
  // Edge Functions (already deployed in your Supabase project)
  FN_CREATE_PAYMENT: "nowpayments-create-payment",
  // IPN is server-to-server; not used directly by the browser:
  FN_IPN: "nowpayments-ipn",
  DEFAULT_COIN: "USDT",
  DEFAULT_NETWORK: "BEP20",
};
