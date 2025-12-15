import { requireAuth } from "./supabaseClient.js";
import { signOut } from "./authService.js";
import { getUsdtBalance } from "./walletService.js";
import { createPayment } from "./nowpaymentsService.js";
import { toast, $, fmtMoney, copyToClipboard } from "./ui.js";

const debugEl = $("#debug");
function log(line){
  const now = new Date().toLocaleString();
  debugEl.textContent = (debugEl.textContent === "—" ? "" : debugEl.textContent + "\n") + `[${now}] ${line}`;
  debugEl.scrollTop = debugEl.scrollHeight;
}

let session = null;
let lastPayment = null;
let qr = null;

async function refreshBalance(){
  if(!session?.user?.id) return;
  try{
    const b = await getUsdtBalance(session.user.id);
    $("#balance").textContent = fmtMoney(b.usdt_balance);
    log(`Balance loaded: ${fmtMoney(b.usdt_balance)} USDT`);
  }catch(e){
    log(`Balance error: ${e.message || e}`);
    toast("مشكلة في قراءة الرصيد (RLS/جدول)", "bad");
  }
}

function clearPayment(){
  lastPayment = null;
  $("#paymentBox").style.display = "none";
  $("#address").textContent = "—";
  $("#payAmount").textContent = "—";
  $("#paymentId").textContent = "—";
  $("#payStatus").innerHTML = `<span class="muted">—</span>`;
  const q = $("#qrcode");
  q.innerHTML = "";
  qr = null;
}

function renderQr(address, amount){
  const q = $("#qrcode");
  q.innerHTML = "";
  // Simple text payload; wallets often recognize plain address, and some support URI formats.
  const payload = address;
  qr = new window.QRCode(q, {
    text: payload,
    width: 180,
    height: 180
  });
}

function normalizePaymentResponse(data){
  // Try to support different shapes from your Edge Function
  // Common: { payment_id, pay_address, pay_amount, pay_currency, ... }
  const paymentId = data?.payment_id ?? data?.paymentId ?? data?.id ?? data?.invoice_id ?? "—";
  const payAddress = data?.pay_address ?? data?.address ?? data?.payAddress ?? data?.wallet_address ?? "—";
  const payAmount = data?.pay_amount ?? data?.amount ?? data?.payAmount ?? "—";
  const status = data?.payment_status ?? data?.status ?? "waiting";
  return { paymentId, payAddress, payAmount, status, raw: data };
}

async function main(){
  session = await requireAuth("login.html");
  if(!session) return;

  $("#uid").textContent = session.user.id;
  log(`Session OK. user_id=${session.user.id}`);

  await refreshBalance();
}

$("#btnRefresh").addEventListener("click", refreshBalance);

$("#btnSignOut").addEventListener("click", async ()=>{
  const { error } = await signOut();
  if(error) return toast(error.message, "bad");
  window.location.href = "login.html";
});

$("#btnClear").addEventListener("click", ()=>{
  clearPayment();
  toast("تم المسح");
});

$("#btnCopy").addEventListener("click", async ()=>{
  const addr = $("#address").textContent.trim();
  if(addr && addr !== "—") await copyToClipboard(addr);
});

$("#btnCreate").addEventListener("click", async ()=>{
  const amount = Number($("#amount").value || 0);
  if(!amount || amount <= 0) return toast("اكتب مبلغ صحيح", "bad");

  $("#btnCreate").disabled = true;
  clearPayment();

  try{
    log(`Calling Edge Function create-payment amount=${amount} USDT BEP20`);
    const data = await createPayment({ amount, currency: "USDT", network: "BEP20" });
    const p = normalizePaymentResponse(data);
    lastPayment = p;

    $("#paymentBox").style.display = "block";
    $("#address").textContent = p.payAddress;
    $("#payAmount").textContent = fmtMoney(p.payAmount);
    $("#paymentId").textContent = p.paymentId;
    $("#payStatus").innerHTML = `<span class="muted">${p.status}</span>`;

    renderQr(p.payAddress, p.payAmount);
    log(`Payment created. id=${p.paymentId} address=${p.payAddress}`);

    toast("تم توليد عنوان الإيداع");
  }catch(e){
    log(`Create payment error: ${e.message || e}`);
    toast("فشل توليد الدفع. راجع Edge Function / Logs", "bad");
  }finally{
    $("#btnCreate").disabled = false;
  }
});

main();
