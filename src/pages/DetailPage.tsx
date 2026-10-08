import { Route, Package, Percent, Weight as WeightIcon, CircleDollarSign, Clock3, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import Empty from '@/components/Empty';
import { money, fa } from '@/lib/format';
import type { Load, LoadStatus } from '@/types';

function Status({ status }: { status: LoadStatus }) {
  const map = {
    open: ['آماده بارگیری', 'bg-emerald-50 text-emerald-700'],
    reserved: ['رزرو شده', 'bg-amber-50 text-amber-700'],
    delivered: ['تحویل شده', 'bg-slate-100 text-slate-600'],
  } as const;
  const [label, cls] = map[status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>
      {label}
    </span>
  );
}

type DetailPageProps = {
  selected: Load | null;
  onOffer: (l: Load) => void;
  onGoSearch: () => void;
};

const DetailPage = ({ selected, onOffer, onGoSearch }: DetailPageProps) =>
  selected ? (
    <div className="space-y-4">
      <Card>
        <CardBody className="p-5">
          <div className="flex items-center justify-between">
            <Status status={selected.status} />
            <span className="text-xs text-gray-400">
              {fa(selected.distance)} کیلومتر تا مبدأ
            </span>
          </div>
          <h2 className="text-xl font-black mt-3">{selected.title}</h2>
          <div className="flex items-center gap-4 mt-5">
            <div className="flex-1">
              <b className="text-lg">{selected.from}</b>
              <span className="block text-xs text-gray-400 mt-1">مبدأ</span>
            </div>
            <Route className="w-6 h-6 text-primary-500 rotate-180" />
            <div className="flex-1 text-left">
              <b className="text-lg">{selected.to}</b>
              <span className="block text-xs text-gray-400 mt-1">مقصد</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-5 space-y-4">
          <h3 className="font-black">جزئیات بار</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <span className="block text-gray-400 mt-2">نوع بار</span>
              <b className="block mt-1">{selected.type}</b>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <Percent className="w-5 h-5 text-primary-600" />
              </div>
              <span className="block text-gray-400 mt-2">کمیسیون براه</span>
              <b className="block mt-1">طبق تعرفه براه</b>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <WeightIcon className="w-5 h-5 text-amber-600" />
              </div>
              <span className="block text-gray-400 mt-2">وزن بار</span>
              <b className="block mt-1">{fa(selected.weight)} کیلو</b>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="block text-gray-400 mt-2">کرایه اعلامی</span>
              <b className="block mt-1">{money(selected.price)} تومان</b>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock3 className="w-5 h-5 text-primary-600" />
            <span>
              بارگیری: <b>{selected.pickup}</b>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-5 h-5 text-primary-600" />
            <span>
              تحویل: <b>{selected.delivery}</b>
            </span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-5">
          <h3 className="font-black">توضیحات</h3>
          <p className="text-sm text-gray-600 mt-2 leading-7">
            {selected.description}
          </p>
          <a
            href={`tel:${selected.phone}`}
            className="mt-4 w-full rounded-xl bg-gray-50 py-3 flex items-center justify-center gap-2 font-bold text-sm"
          >
            <Phone className="w-4 h-4" /> تماس برای هماهنگی
          </a>
        </CardBody>
      </Card>

      <Button
        size="full"
        disabled={selected.status !== 'open'}
        onClick={() => onOffer(selected)}
      >
        {selected.status === 'open'
          ? 'ثبت پیشنهاد برای این بار'
          : 'این بار قابل پیشنهاد نیست'}
      </Button>
    </div>
  ) : (
    <Empty
      title="بار انتخاب نشده"
      text="از جستجو یک بار را انتخاب کن."
      action={onGoSearch}
    />
  );

export default DetailPage;
