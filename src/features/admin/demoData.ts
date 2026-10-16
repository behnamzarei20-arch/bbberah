/**
 * Centralized mock records for the admin dashboard preview only.
 * Replace this module with authenticated server repositories before production use.
 */
export const admins = [
 {id:'ADM-001',user:'admin1',name:'مدیر اصلی',role:'مدیر کل',status:'فعال',online:'آنلاین',today:'۳ ساعت و ۲۴ دقیقه',week:'۱۸ ساعت و ۴۰ دقیقه',last:'۱۴۰۵/۰۷/۲۵ · ۱۰:۴۲',actions:186,permissions:'همه بخش‌ها',events:['ورود به پنل','مشاهده پرونده کاربر','خروجی گزارش کاربران','مشاهده گزارش حذف بار']},
 {id:'ADM-002',user:'admin2',name:'اپراتور پشتیبانی',role:'پشتیبانی',status:'فعال',online:'آفلاین',today:'۱ ساعت و ۱۲ دقیقه',week:'۹ ساعت و ۵ دقیقه',last:'۱۴۰۵/۰۷/۲۵ · ۰۹:۱۸',actions:74,permissions:'کاربران، تیکت‌ها، گزارش‌ها',events:['مشاهده تیکت','ثبت یادداشت پشتیبانی','مشاهده پروفایل کاربر']},
 {id:'ADM-003',user:'admin3',name:'بازبین احراز هویت',role:'بازبین',status:'محدود',online:'آفلاین',today:'۴۲ دقیقه',week:'۳ ساعت و ۵۰ دقیقه',last:'۱۴۰۵/۰۷/۲۴ · ۱۷:۳۱',actions:29,permissions:'فقط احراز هویت',events:['باز کردن صف احراز هویت','مشاهده وضعیت درخواست']},
];

export const users = [
 {id:'BR-1048',name:'علی رضایی',phone:'0912•••2184',role:'راننده',city:'تهران',status:'فعال',joined:'۱۴۰۵/۰۷/۲۴',last:'۱۴۰۵/۰۷/۲۵ · ۱۰:۴۲',sessions:24,online:'۲ ساعت و ۳۲ دقیقه',loads:17,deleted:2,tickets:3,reports:2,actions:38},
 {id:'BR-1047',name:'محمد کریمی',phone:'0913•••7421',role:'صاحب بار',city:'اصفهان',status:'فعال',joined:'۱۴۰۵/۰۷/۲۴',last:'۱۴۰۵/۰۷/۲۵ · ۱۰:۱۶',sessions:12,online:'۱ ساعت و ۲۷ دقیقه',loads:32,deleted:4,tickets:2,reports:1,actions:21},
 {id:'BR-1046',name:'رضا محمدی',phone:'0915•••6630',role:'راننده',city:'مشهد',status:'در انتظار',joined:'۱۴۰۵/۰۷/۲۳',last:'۱۴۰۵/۰۷/۲۵ · ۰۹:۵۸',sessions:8,online:'۳۸ دقیقه',loads:6,deleted:1,tickets:1,reports:0,actions:14},
 {id:'BR-1045',name:'حسین احمدی',phone:'0911•••9502',role:'صاحب بار',city:'رشت',status:'فعال',joined:'۱۴۰۵/۰۷/۲۲',last:'۱۴۰۵/۰۷/۲۵ · ۰۹:۳۱',sessions:41,online:'۶ ساعت و ۱۰ دقیقه',loads:58,deleted:7,tickets:4,reports:3,actions:52},
 {id:'BR-1044',name:'مهدی جعفری',phone:'0917•••4018',role:'راننده',city:'شیراز',status:'تعلیق',joined:'۱۴۰۵/۰۷/۲۱',last:'۱۴۰۵/۰۷/۲۴ · ۱۸:۱۲',sessions:5,online:'۲۵ دقیقه',loads:3,deleted:2,tickets:1,reports:2,actions:9},
 {id:'BR-1043',name:'امیر حسینی',phone:'0935•••1186',role:'صاحب بار',city:'کرج',status:'فعال',joined:'۱۴۰۵/۰۷/۲۰',last:'۱۴۰۵/۰۷/۲۵ · ۰۸:۴۷',sessions:19,online:'۳ ساعت و ۵ دقیقه',loads:27,deleted:3,tickets:0,reports:0,actions:31},
];

export const events = [
 {id:'EV-9001',dateKey:'2026-10-16',timeKey:'10:42',time:'۱۴۰۵/۰۷/۲۵ · ۱۰:۴۲:۱۸',user:'علی رضایی',userId:'BR-1048',event:'ورود به برنامه',detail:'ورود آزمایشی به حساب',result:'موفق'},
 {id:'EV-9002',dateKey:'2026-10-16',timeKey:'10:37',time:'۱۴۰۵/۰۷/۲۵ · ۱۰:۳۷:۰۴',user:'محمد کریمی',userId:'BR-1047',event:'ثبت بار',detail:'تهران ← مشهد · بار خشک',result:'موفق'},
 {id:'EV-9003',dateKey:'2026-10-16',timeKey:'10:21',time:'۱۴۰۵/۰۷/۲۵ · ۱۰:۲۱:۴۶',user:'رضا محمدی',userId:'BR-1046',event:'ارسال درخواست احراز هویت',detail:'در انتظار بررسی',result:'در انتظار'},
 {id:'EV-9004',dateKey:'2026-10-16',timeKey:'09:58',time:'۱۴۰۵/۰۷/۲۵ · ۰۹:۵۸:۱۳',user:'حسین احمدی',userId:'BR-1045',event:'حذف بار',detail:'LD-2190 · حذف نمونه',result:'بررسی'},
 {id:'EV-9005',dateKey:'2026-10-16',timeKey:'09:44',time:'۱۴۰۵/۰۷/۲۵ · ۰۹:۴۴:۵۱',user:'مهدی جعفری',userId:'BR-1044',event:'تلاش برای ورود',detail:'رویداد امنیتی نمونه',result:'بررسی'},
 {id:'EV-9006',dateKey:'2026-10-15',timeKey:'09:11',time:'۱۴۰۵/۰۷/۲۵ · ۰۹:۱۱:۲۲',user:'امیر حسینی',userId:'BR-1043',event:'ویرایش بار',detail:'تغییر وضعیت بار',result:'موفق'},
];

export const tickets = [
 {id:'TK-501',subject:'عدم نمایش بار ثبت‌شده',category:'مشکل فنی',from:'علی رضایی',userId:'BR-1048',status:'باز',priority:'زیاد',created:'۱۴۰۵/۰۷/۲۵ · ۱۰:۱۲',assigned:'admin2',message:'بار ثبت شده اما در فهرست دیده نمی‌شود.'},
 {id:'TK-500',subject:'گزارش رفتار نامناسب',category:'گزارش کاربر',from:'محمد کریمی',userId:'BR-1047',status:'در حال بررسی',priority:'متوسط',created:'۱۴۰۵/۰۷/۲۵ · ۰۹:۴۰',assigned:'admin2',message:'درخواست بررسی رفتار کاربر در گفتگو.'},
 {id:'TK-499',subject:'اصلاح شماره تماس',category:'حساب کاربری',from:'رضا محمدی',userId:'BR-1046',status:'بسته',priority:'کم',created:'۱۴۰۵/۰۷/۲۴ · ۱۶:۲۰',assigned:'admin1',message:'نیاز به اصلاح اطلاعات تماس حساب.'},
];
