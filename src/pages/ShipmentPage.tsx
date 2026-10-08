import { Truck, CheckCircle2, Navigation } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

const ShipmentPage = () => (
  <div className="space-y-4">
    <Card>
      <CardBody className="p-5">
        <div className="flex items-center gap-3">
          <Truck className="w-7 h-7 text-primary-600" />

          <div>
            <b>سفر تهران به مشهد</b>

            <p className="text-xs text-gray-400 mt-1">
              بار خشک • تریلی
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {[
            'پیشنهاد تأیید شد',
            'بارگیری انجام شد',
            'در مسیر مقصد',
          ].map((s, i) => (
            <div key={s} className="flex gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  i < 2
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-primary-100 text-primary-700'
                }`}
              >
                {i < 2 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </div>

              <div>
                <b className="text-sm">{s}</b>

                <p className="text-xs text-gray-400 mt-1">
                  {i < 2 ? 'تکمیل شده' : 'وضعیت فعلی'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-xs text-gray-600 leading-6">
          راننده باید اطلاعات بار، مدارک حمل و شرایط تحویل را پیش از حرکت
          بررسی کند و وضعیت‌های سفر را مطابق واقع ثبت نماید.
        </div>
      </CardBody>
    </Card>
  </div>
);

export default ShipmentPage;
