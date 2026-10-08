import { Bell } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

const NotificationsPage = () => (
  <div className="space-y-3">
    {[
      'بار جدید در مسیر تهران به مشهد ثبت شد.',
      'پیشنهاد آزمایشی شما در انتظار بررسی است.',
      'اطلاعات حساب شما با موفقیت ذخیره شد.',
    ].map((n, i) => (
      <Card key={i}>
        <CardBody className="p-4 flex gap-3">
          <Bell className="w-5 h-5 text-primary-600" />

          <div>
            <b className="text-sm">{n}</b>

            <p className="text-[11px] text-gray-400 mt-1">
              {i === 0 ? 'امروز' : 'دیروز'}
            </p>
          </div>
        </CardBody>
      </Card>
    ))}
  </div>
);

export default NotificationsPage;
