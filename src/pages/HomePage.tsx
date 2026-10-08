import { Search, Navigation, ReceiptText } from 'lucide-react';

type HomePageProps = {
  onOpenSearch: () => void;
  onNearby: () => void;
  onOpenOffers: () => void;
};

const HomePage = ({
  onOpenSearch,
  onNearby,
  onOpenOffers,
}: HomePageProps) => (
  <div className="space-y-4">
    <button
      onClick={onOpenSearch}
      className="w-full min-h-[112px] rounded-2xl bg-primary-500 border border-primary-600 p-5 text-right flex items-center gap-4 shadow-sm text-white"
    >
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">
        <Search className="w-6 h-6 text-primary-600" />
      </div>
      <div className="min-w-0">
        <b className="block text-lg text-white">جستجوی بار</b>
        <span className="block mt-1 text-sm text-white/90">
          مبدأ، مقصد یا نوع بار را جستجو کن
        </span>
      </div>
    </button>

    <button
      onClick={onNearby}
      className="w-full min-h-[112px] rounded-2xl bg-primary-500 border border-primary-600 p-5 text-right flex items-center gap-4 shadow-sm text-white"
    >
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">
        <Navigation className="w-6 h-6 text-emerald-700" />
      </div>
      <div className="min-w-0">
        <b className="block text-lg text-white">اطراف من</b>
        <span className="block mt-1 text-sm text-white/90">
          بارهای نزدیک را ببین
        </span>
      </div>
    </button>

    <button
      onClick={onOpenOffers}
      className="w-full min-h-[112px] rounded-2xl bg-primary-500 border border-primary-600 p-5 text-right flex items-center gap-4 shadow-sm text-white"
    >
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">
        <ReceiptText className="w-6 h-6 text-amber-700" />
      </div>
      <div className="min-w-0">
        <b className="block text-lg text-white">پیشنهادهای من</b>
        <span className="block mt-1 text-sm text-white/90">
          پیشنهادهای ارسال‌شده را پیگیری کن
        </span>
      </div>
    </button>
  </div>
);

export default HomePage;
