import { Search, MapPin, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import LoadCard from '@/components/LoadCard';
import Empty from '@/components/Empty';
import { fa } from '@/lib/format';
import { frequentRoutes } from '@/data/seed';
import type { Load } from '@/types';

type SearchPageProps = {
  origin: string;
  originText: string;
  destination: string;
  destinationText: string;
  searchSubmitted: boolean;
  filtered: Load[];
  onRunSearch: () => void;
  onClearAll: () => void;
  onGoOriginSelect: () => void;
  onGoDestinationSelect: () => void;
  onSelectRoute: (from: string, to: string) => void;
  onOpenCargo: (l: Load) => void;
  onOffer: (l: Load) => void;
};

const SearchPage = ({
  origin,
  originText,
  destination,
  destinationText,
  searchSubmitted,
  filtered,
  onRunSearch,
  onClearAll,
  onGoOriginSelect,
  onGoDestinationSelect,
  onSelectRoute,
  onOpenCargo,
  onOffer,
}: SearchPageProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="p-4">
          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary-700" />
              <h2 className="font-black text-primary-900">جستجوی بار</h2>
            </div>
          </div>

          <button
            onClick={onGoOriginSelect}
            className="w-full mt-5 rounded-2xl border border-gray-200 bg-white p-4 text-right active:bg-gray-50"
          >
            <span className="block text-xs font-bold text-gray-400 mb-1">
              مبدأ
            </span>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary-600 shrink-0" />

              <span
                className={
                  originText
                    ? 'text-gray-900 font-bold'
                    : 'text-gray-400'
                }
              >
                {originText || 'استان یا شهر مبدا را وارد کنید'}
              </span>

              <ChevronLeft className="w-4 h-4 text-gray-300 mr-auto" />
            </div>
          </button>

          <div className="border-t border-gray-100 my-4" />

          <button
            onClick={onGoDestinationSelect}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-right active:bg-gray-50"
          >
            <span className="block text-xs font-bold text-gray-400 mb-1">
              مقصد
            </span>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary-600 shrink-0" />

              <span
                className={
                  destinationText
                    ? 'text-gray-900 font-bold'
                    : 'text-gray-400'
                }
              >
                {destinationText || 'استان یا شهر مقصد را وارد کنید'}
              </span>

              <ChevronLeft className="w-4 h-4 text-gray-300 mr-auto" />
            </div>
          </button>
        </CardBody>
      </Card>

      <Button
        size="full"
        className="h-14 text-base font-black shadow-lg shadow-primary-100"
        onClick={onRunSearch}
      >
        <Search className="w-5 h-5 ml-2" /> جستجوی بار
      </Button>

      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black">سه مسیر پرتکرار</h3>
            <span className="text-[11px] text-gray-400">انتخاب سریع</span>
          </div>

          <div className="space-y-2">
            {frequentRoutes.map(route => (
              <button
                key={route.from + '-' + route.to}
                onClick={() => onSelectRoute(route.from, route.to)}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-center justify-between text-right"
              >
                <span className="font-bold text-sm">
                  {route.from}{' '}
                  <span className="text-gray-400 mx-1">←</span>{' '}
                  {route.to}
                </span>

                <ChevronLeft className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {searchSubmitted && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {filtered.length
                ? `بارهای مرتبط: ${fa(filtered.length)} مورد`
                : 'بار مرتبط پیدا نشد'}
            </span>

            {(origin || destination) && (
              <button
                onClick={onClearAll}
                className="text-xs font-bold text-primary-700"
              >
                پاک کردن
              </button>
            )}
          </div>

          {filtered.length ? (
            <div className="space-y-3">
              {filtered.map(l => (
                <LoadCard
                  key={l.id}
                  load={l}
                  onOpen={() => onOpenCargo(l)}
                  onOffer={() => onOffer(l)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardBody>
                <Empty
                  title="بار مرتبط پیدا نشد"
                  text="برای این مسیر هنوز باری ثبت نشده است."
                  action={onClearAll}
                />
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
