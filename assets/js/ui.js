export function $(sel, root=document){ return root.querySelector(sel); }
export function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

export function toast(msg, type="good"){
  const el = document.getElementById("toast");
  if(!el) return alert(msg);
  el.textContent = msg;
  el.className = "toast show " + (type === "bad" ? "bad" : "good");
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(()=>{ el.className = "toast"; }, 3200);
}

export function fmtMoney(n){
  const x = Number(n ?? 0);
  if (Number.isNaN(x)) return "0";
  // keep up to 6 decimals but trim zeros
  return x.toFixed(6).replace(/\.0+$/,"").replace(/(\.\d*?)0+$/,"$1");
}

export function shorten(s, a=6, b=6){
  if(!s || s.length <= a+b+3) return s || "";
  return s.slice(0,a) + "..." + s.slice(-b);
}

export async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    toast("Copied!");
  }catch{
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("Copied!");
  }
}
