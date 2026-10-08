import { CheckCircle2, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

type OffersPageProps = {
  offerSuccess: boolean;
  onCancelOffer: () => void;
};

const OffersPage = ({ offerSuccess, onCancelOffer }: OffersPageProps) => (
  <div className="space-y-3">
    {offerSuccess && (
      <Card>
        <CardBody className="p-4 bg-emerald-50">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-6 h-6 shrink-0" />

            <div>
              <b>پیشنهاد با موفقیت ارسال شد</b>

              <p className="text-xs mt-1">
                پیشنهاد شما در فهرست پیشنهادهای من ثبت شد.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    )}

    <Card>
      <CardBody className="p-5">
        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">
            پیشنهادهای فعال
          </span>

          <b>۲</b>
        </div>

        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={onCancelOffer}
        >
          لغو پیشنهاد انتخاب‌شده
        </Button>

        <div className="h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
          <div className="h-full w-2/3 bg-primary-500 rounded-full" />
        </div>
      </CardBody>
    </Card>

    <Card>
      <CardBody className="p-5">
        <b>تهران ← مشهد</b>

        <p className="text-xs text-gray-400 mt-1">
          پیشنهاد شما: ۲۳,۵۰۰,۰۰۰ تومان
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-amber-700">
          <Clock3 className="w-4 h-4" />
          در انتظار پاسخ صاحب بار
        </div>
      </CardBody>
    </Card>
  </div>
);

export default OffersPage;
