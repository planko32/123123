# Test Deposit Page (USDT BEP20)

هذا مشروع بسيط (Static) لرفع على GitHub Pages لاختبار:
- توليد user_id محليًا
- إنشاء طلب إيداع عبر Supabase Edge Function: nowpayments-create-payment
- عرض address + amount + QR
- قراءة الرصيد الديمو من جدول wallet_balances (إن كانت RLS تسمح)

## التشغيل محليًا
افتح index.html مباشرة أو عبر Live Server.

## الرفع على GitHub Pages
ارفع الملفات كما هي داخل الريبو.

## ملاحظات مهمة
- لا تضع مفاتيح NOWPayments السرّية في الفرونت.
- إذا واجهت CORS: تأكد أن Edge Function يرسل headers مناسبة، وأن الدومين الخاص بـ Pages مسموح.
- إذا الرصيد لا يظهر: غالبًا RLS تمنع القراءة أو اسم العمود/الجدول مختلف.
