import { Target, Route, MapPin, Package, Weight as WeightIcon, CircleDollarSign, FileText, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { money, fa } from '@/lib/format';
import type { Load } from '@/types';

function LoadCard({ load, onOpen, onOffer }: { load: Load; onOpen: () => void; onOffer: () => void }) {
  const commission = Math.round(load.price * 0.05);
  return (
    <Card hoverable>
      <CardBody className="p-4">
        <div className="text-center pb-2">
          <b className="block text-2xl font-black text-gray-950 leading-9">{money(load.price)} تومان</b>
        </div>

        <div className="px-1 pt-2 pb-6" dir="rtl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 flex items-end justify-center" aria-label="قیمت کم">
              <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
                <g transform="translate(18 9)">
                  <ellipse cx="0" cy="0" rx="8" ry="3.2" className="fill-primary-200 stroke-primary-400" strokeWidth="1"/>
                  <path d="M-8 0v10c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V0" className="fill-primary-100 stroke-primary-400" strokeWidth="1"/>
                  <ellipse cx="0" cy="0" rx="8" ry="3.2" className="fill-primary-300 stroke-primary-500" strokeWidth="1"/>
                  <ellipse cx="0" cy="0" rx="4" ry="1.4" className="fill-primary-100 opacity-70"/>
                </g>
                <g transform="translate(18 20)">
                  <ellipse cx="0" cy="0" rx="8" ry="3.2" className="fill-primary-100 stroke-primary-300" strokeWidth="1"/>
                  <path d="M-8 0v7c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V0" className="fill-primary-50 stroke-primary-300" strokeWidth="1"/>
                </g>
              </svg>
            </div>

            <div className="relative flex-1 h-5">
              <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary-200 via-primary-400 to-primary-700"/>
              <span className="absolute left-[42%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-primary-600 shadow-sm" aria-hidden="true"/>
            </div>

            <div className="w-11 h-10 shrink-0 flex items-end justify-center" aria-label="قیمت زیاد">
              <svg viewBox="0 0 44 40" className="w-full h-full" aria-hidden="true">
                <g transform="translate(7 24)">
                  <ellipse cx="0" cy="0" rx="7" ry="2.8" className="fill-primary-300 stroke-primary-500" strokeWidth="1"/>
                  <path d="M-7 0v7c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8V0" className="fill-primary-200 stroke-primary-500" strokeWidth="1"/>
                </g>
                <g transform="translate(22 28)">
                  <ellipse cx="0" cy="0" rx="7" ry="2.8" className="fill-primary-400 stroke-primary-600" strokeWidth="1"/>
                  <path d="M-7 0v6c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8V0" className="fill-primary-300 stroke-primary-600" strokeWidth="1"/>
                </g>
                <g transform="translate(35 23)">
                  <ellipse cx="0" cy="0" rx="7" ry="2.8" className="fill-primary-500 stroke-primary-700" strokeWidth="1"/>
                  <path d="M-7 0v8c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8V0" className="fill-primary-400 stroke-primary-700" strokeWidth="1"/>
                </g>
                <g transform="translate(22 16)">
                  <ellipse cx="0" cy="0" rx="7" ry="2.8" className="fill-primary-600 stroke-primary-800" strokeWidth="1"/>
                  <path d="M-7 0v6c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8V0" className="fill-primary-500 stroke-primary-800" strokeWidth="1"/>
                </g>
                <g transform="translate(35 11)">
                  <ellipse cx="0" cy="0" rx="7" ry="2.8" className="fill-primary-700 stroke-primary-900" strokeWidth="1"/>
                  <path d="M-7 0v6c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8V0" className="fill-primary-600 stroke-primary-900" strokeWidth="1"/>
                </g>
              </svg>
            </div>
          </div>
          <div className="mt-0.5 flex items-center justify-between px-1 text-[9px] font-bold text-gray-400">
            <span>کم</span>
            <span>زیاد</span>
          </div>
        </div>

        <div className="flex items-center gap-2 py-7 my-4 border-y border-gray-100" dir="rtl">
          <div className="flex-1 text-right"><Target className="w-5 h-5 inline-block text-primary-600 ml-1" aria-hidden="true"/><b className="text-lg font-black">{load.from}</b></div>
          <div className="w-28 relative flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-primary-300"/>
            <div className="absolute flex flex-col items-center bg-white px-1 -top-2">
              <Route className="w-5 h-5 text-primary-600" aria-hidden="true"/>
              <span className="text-xs font-black text-primary-800 mt-0.5">{fa(load.routeDistance)}km</span>
            </div>
          </div>
          <div className="flex-1 text-left"><b className="text-lg font-black">{load.to}</b><MapPin className="w-5 h-5 inline-block fill-current text-primary-600 mr-1" aria-hidden="true"/></div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
            <Package className="w-5 h-5 mx-auto text-primary-600" aria-hidden="true"/>
            <b className="block text-xs mt-1">{load.type}</b>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
            <WeightIcon className="w-5 h-5 mx-auto text-primary-600" aria-hidden="true"/>
            <b className="block text-xs mt-1">{fa(load.weight)} kg</b>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
            <CircleDollarSign className="w-5 h-5 mx-auto text-primary-600" aria-hidden="true"/>
            <b className="block text-[11px] mt-1">کمیسیون براه</b>
            <span className="block text-[11px] font-bold text-gray-500 mt-0.5">{money(commission)} تومان</span>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <FileText className="w-4 h-4 text-primary-600" aria-hidden="true"/>
            <span className="text-xs font-black text-gray-700">توضیحات بار</span>
          </div>
          <p className="text-xs leading-5 text-gray-600 text-right">{load.description}</p>
        </div>
        <div className="mt-3">
          <Button size="full" onClick={onOpen} className="h-14 text-base font-black bg-primary-500 hover:bg-primary-600 text-white border-primary-500">
            <Truck className="w-5 h-5 ml-2 text-white" aria-hidden="true"/> درخواست برای حمل بار
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export default LoadCard;