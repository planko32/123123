import { signIn, signUp, signOut, getSession } from "./authService.js";
import { toast, $ } from "./ui.js";

async function refreshSessionUI(){
  const session = await getSession();
  if(session?.user){
    $("#status").textContent = "Logged in";
    $("#uid").textContent = session.user.id;
  }else{
    $("#status").textContent = "Logged out";
    $("#uid").textContent = "—";
  }
}

$("#btnSignIn").addEventListener("click", async ()=>{
  const email = $("#email").value.trim();
  const password = $("#password").value;
  if(!email || !password) return toast("اكتب الإيميل والباسورد", "bad");
  const { error } = await signIn(email, password);
  if(error) return toast(error.message, "bad");
  toast("تم تسجيل الدخول");
  await refreshSessionUI();
});

$("#btnSignUp").addEventListener("click", async ()=>{
  const email = $("#email").value.trim();
  const password = $("#password").value;
  if(!email || !password) return toast("اكتب الإيميل والباسورد", "bad");
  const { error } = await signUp(email, password);
  if(error) return toast(error.message, "bad");
  toast("تم إنشاء الحساب (قد يحتاج تأكيد بريد)");
  await refreshSessionUI();
});

$("#btnSignOut").addEventListener("click", async ()=>{
  const { error } = await signOut();
  if(error) return toast(error.message, "bad");
  toast("تم تسجيل الخروج");
  await refreshSessionUI();
});

refreshSessionUI();
