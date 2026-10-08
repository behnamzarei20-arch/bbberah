import { Headphones, Phone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

type SupportPageProps = {
  onOpenChat: () => void;
};

const SupportPage = ({ onOpenChat }: SupportPageProps) => (
  <div className="space-y-3">
    <Card>
      <CardBody className="p-5">
        <Headphones className="w-7 h-7 text-primary-600" />

        <h3 className="font-black mt-3">مرکز پشتیبانی</h3>

        <p className="text-sm text-gray-500 leading-7 mt-2">
          برای مشکلات حساب، بار یا سفر، موضوع خود را از مسیرهای زیر پیگیری کنید.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={onOpenChat}>
            گفتگوی آنلاین
          </Button>

          <a
            href="tel:02100000000"
            className="min-h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center gap-2 text-sm font-bold"
          >
            <Phone className="w-4 h-4" /> تماس
          </a>
        </div>
      </CardBody>
    </Card>

    <Card>
      <CardBody>
        <b>وضعیت سرویس</b>

        <div className="mt-3 flex items-center gap-2 text-emerald-700 text-sm">
          <CheckCircle2 className="w-4 h-4" /> همه بخش‌های آزمایشی فعال هستند
        </div>
      </CardBody>
    </Card>
  </div>
);

export default SupportPage;
