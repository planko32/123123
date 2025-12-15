import { supabase } from "./supabaseClient.js";

const CREATE_PAYMENT_URL = "https://oyowsjjmaesspqiknvhp.supabase.co/functions/v1/nowpayments-create-payment";

const els = {
  userId: document.getElementById("userId"),
  newSessionBtn: document.getElementById("newSessionBtn"),
  demoBalance: document.getElementById("demoBalance"),
  refreshBalanceBtn: document.getElementById("refreshBalanceBtn"),
  balanceStatus: document.getElementById("balanceStatus"),
  amountInput: document.getElementById("amountInput"),
  createPaymentBtn: document.getElementById("createPaymentBtn"),
  createStatus: document.getElementById("createStatus"),
  paymentResult: document.getElementById("paymentResult"),
  payAmount: document.getElementById("payAmount"),
  payAddress: document.getElementById("payAddress"),
  copyAddressBtn: document.getElementById("copyAddressBtn"),
  qrImg: document.getElementById("qrImg"),
  rawResponse: document.getElementById("rawResponse"),
};

function getOrCreateUserId() {
  let id = localStorage.getItem("test_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("test_user_id", id);
  }
  return id;
}

function setStatus(el, msg, type="") {
  el.textContent = msg || "";
  el.style.color = type === "error" ? "#ef4444" : type === "ok" ? "#22c55e" : "";
}

async function loadBalance() {
  const user_id = getOrCreateUserId();
  setStatus(els.balanceStatus, "جاري قراءة الرصيد...");
  els.demoBalance.textContent = "—";

  try {
    const { data, error } = await supabase
      .from("wallet_balances")
      .select("usdt_balance, updated_at")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // إذا ما في سجل للمستخدم، نعرض صفر ونترك الإنشاء لسياساتك/سيرفرك
      els.demoBalance.textContent = "0.00";
      setStatus(els.balanceStatus, "لا يوجد سجل رصيد لهذا المستخدم (أو RLS تمنع القراءة).", "");
      return;
    }

    const bal = Number(data.usdt_balance ?? 0);
    els.demoBalance.textContent = bal.toFixed(2);
    setStatus(els.balanceStatus, "تم التحديث.", "ok");
  } catch (e) {
    console.error(e);
    setStatus(els.balanceStatus, "فشل قراءة الرصيد (تحقق من RLS/اسم الجدول/العمود).", "error");
  }
}

function normalizeAmount(v) {
  const cleaned = String(v).replace(/,/g, ".").trim();
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num * 100) / 100;
}

async function createPayment() {
  const user_id = getOrCreateUserId();
  const amount = normalizeAmount(els.amountInput.value);
  if (!amount) {
    setStatus(els.createStatus, "أدخل مبلغ صحيح.", "error");
    return;
  }

  setStatus(els.createStatus, "جاري إنشاء طلب...", "");
  els.createPaymentBtn.disabled = true;
  els.paymentResult.hidden = true;

  try {
    // NOTE: لا نرسل مفاتيح NOWPayments من الفرونت.
    // المفترض أن Edge Function يستخدم سرّه من ENV داخل Supabase.
    const res = await fetch(CREATE_PAYMENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabase.auth.getSession ? "" : ""}`, // no-op (session disabled)
        "apikey": supabase.supabaseKey ?? undefined,
      },
      body: JSON.stringify({
        user_id,
        amount,
        currency: "usdt",
        network: "bep20",
        // أي حقول إضافية تحتاجها الدالة ضفها هنا لاحقًا
      })
    });

    const text = await res.text();
    let payload;
    try { payload = JSON.parse(text); } catch { payload = { raw: text }; }

    if (!res.ok) {
      console.error("create-payment failed:", payload);
      setStatus(els.createStatus, "فشل إنشاء الطلب (راجع console).", "error");
      els.rawResponse.textContent = JSON.stringify(payload, null, 2);
      els.paymentResult.hidden = false;
      return;
    }

    // نحاول استخراج حقول شائعة:
    const address = payload.address || payload.pay_address || payload.wallet_address || payload.deposit_address;
    const payAmount = payload.amount || payload.pay_amount || amount;
    const qr = payload.qr || payload.qr_code || payload.qrCode || payload.qr_url || payload.qrUrl;

    els.payAddress.textContent = address || "(لم يتم العثور على address في الاستجابة)";
    els.payAmount.textContent = String(payAmount);
    els.rawResponse.textContent = JSON.stringify(payload, null, 2);

    if (qr) {
      // qr قد يكون base64 أو رابط
      if (typeof qr === "string" && qr.startsWith("data:")) {
        els.qrImg.src = qr;
      } else {
        els.qrImg.src = String(qr);
      }
    } else {
      // fallback: QR via online chart API بدون الاعتماد عليه (مجرد خيار)
      const q = encodeURIComponent(address || "");
      els.qrImg.src = address ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${q}` : "";
    }

    setStatus(els.createStatus, "تم إنشاء الطلب.", "ok");
    els.paymentResult.hidden = false;
  } catch (e) {
    console.error(e);
    setStatus(els.createStatus, "خطأ بالشبكة أو CORS (راجع console).", "error");
  } finally {
    els.createPaymentBtn.disabled = false;
  }
}

function newSession() {
  const id = crypto.randomUUID();
  localStorage.setItem("test_user_id", id);
  renderUserId();
  loadBalance();
  els.paymentResult.hidden = true;
  setStatus(els.createStatus, "");
}

function renderUserId() {
  els.userId.textContent = getOrCreateUserId();
}

async function copyAddress() {
  const txt = els.payAddress.textContent.trim();
  if (!txt) return;
  await navigator.clipboard.writeText(txt);
  els.copyAddressBtn.textContent = "تم";
  setTimeout(() => (els.copyAddressBtn.textContent = "نسخ"), 900);
}

els.newSessionBtn.addEventListener("click", newSession);
els.refreshBalanceBtn.addEventListener("click", loadBalance);
els.createPaymentBtn.addEventListener("click", createPayment);
els.copyAddressBtn.addEventListener("click", copyAddress);

renderUserId();
loadBalance();
