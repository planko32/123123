DEMO SITE (Supabase + NOWPayments) - from scratch

IMPORTANT SECURITY NOTE
- You pasted a NOWPayments API key in chat. Treat it as compromised.
  Rotate it in NOWPayments dashboard after you're done testing.
- This demo site DOES NOT place the NOWPayments API key in the browser.
  It calls your Supabase Edge Function "nowpayments-create-payment", which should use the key server-side.

FILES
- index.html
- login.html (email/password auth via Supabase)
- deposit.html (USDT / BEP20 only) -> calls Edge Function -> shows pay_address + QR -> refresh balance

HOW TO RUN
Option A: simple local server
1) Open terminal in this folder.
2) Run one of these:
   - Python:  python -m http.server 5500
   - Node:    npx serve .
3) Open: http://localhost:5500

Option B: Netlify / Vercel static hosting
- Upload the folder as a static site.

REQUIREMENTS ON SUPABASE
1) Supabase Auth enabled (Email provider).
2) Table wallet_balances exists and has row for each user OR your logic creates it.
3) RLS must allow authenticated users to SELECT their own wallet row:
   wallet_balances.user_id = auth.uid()

EDGE FUNCTIONS EXPECTED
- nowpayments-create-payment
  Should return JSON containing at least:
    pay_address (or address)
    pay_amount (or amount)
    payment_id (or paymentId)
    status (optional)
- nowpayments-ipn
  Receives NOWPayments webhook and updates wallet_balances accordingly.

CONFIG (already embedded)
- SUPABASE_URL: https://oyowsjjmaesspqiknvhp.supabase.co
- SUPABASE_ANON_KEY: (embedded)

If create-payment response keys differ, tell me the exact JSON shape returned by your function,
and I'll adjust the mapping in assets/js/depositPage.js.
