import { PhoneCall, Phone } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import Empty from '@/components/Empty';
import type { Load } from '@/types';

type CallsPageProps = {
  loads: Load[];
};

const CallsPage = ({ loads }: CallsPageProps) => (
  <div className="space-y-3">
    {loads.slice(0, 2).map(l => (
      <Card key={l.id}>
        <CardBody className="p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-primary-600" />
          </div>

          <div className="flex-1">
            <b>هماهنگی بار</b>

            <p className="text-xs text-gray-400 mt-1">{l.title}</p>
          </div>

          <a
            href={`tel:${l.phone}`}
            className="w-11 h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center"
          >
            <Phone className="w-5 h-5" />
          </a>
        </CardBody>
      </Card>
    ))}

    <Empty
      title="سوابق تماس"
      text="تماس‌های واقعی بعد از اتصال به سرویس ثبت خواهند شد."
    />
  </div>
);

export default CallsPage;
