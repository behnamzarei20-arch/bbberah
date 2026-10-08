import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CircleDollarSign, Coins, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { iranLocations } from '@/data/iranLocations';
import { seedLoads } from '@/data/seed';
import { money } from '@/lib/format';
import type { Load, Page } from '@/types';

import Toast from '@/components/Toast';
import Header from '@/layouts/Header';
import BottomNav from '@/layouts/BottomNav';
import Drawer from '@/layouts/Drawer';

import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import LocationSelectPage from '@/pages/LocationSelectPage';
import DetailPage from '@/pages/DetailPage';
import ProfilePage from '@/pages/ProfilePage';
import OffersPage from '@/pages/OffersPage';
import ShipmentPage from '@/pages/ShipmentPage';
import WalletPage from '@/pages/WalletPage';
import SupportPage from '@/pages/SupportPage';
import RulesPage from '@/pages/RulesPage';
import DisplayPage from '@/pages/DisplayPage';
import NotificationsPage from '@/pages/NotificationsPage';
import CallsPage from '@/pages/CallsPage';
import TransactionsPage from '@/pages/TransactionsPage';
import NearbyPage from '@/pages/NearbyPage';
import AccountPage from '@/pages/AccountPage';

export function MainApp() {
  const { profile, signOut } = useAuth();

  const [page, setPage] = useState<Page>('home');
  const [loads] = useState<Load[]>(seedLoads);
  const [selected, setSelected] = useState<Load | null>(null);

  const [origin, setOrigin] = useState('');
  const [originText, setOriginText] = useState('');
  const [originProvince, setOriginProvince] = useState('');
  const [originCounty, setOriginCounty] = useState('');

  const [destination, setDestination] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [destinationProvince, setDestinationProvince] = useState('');
  const [destinationCounty, setDestinationCounty] = useState('');

  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [toast, setToast] = useState('');
  const [notifications, setNotifications] = useState(2);
  const [showMenu, setShowMenu] = useState(false);

  const [offerPrice, setOfferPrice] = useState('');
  const [shipmentStage] = useState<
    'accepted' | 'loading' | 'in_transit' | 'delivered'
  >('accepted');

  const [rating, setRating] = useState(0);
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    null | 'cancel-offer'
  >(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);

  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    if (profile?.full_name) setAccountName(profile.full_name);
  }, [profile?.full_name]);

  const notify = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(''), 2600);
  };

  useEffect(() => {
    const state = window.history.state;

    if (!state?.bbberahPage) {
      window.history.replaceState(
        { bbberahPage: 'home' },
        '',
        window.location.href.split('#')[0],
      );
    }

    const onPopState = () => {
      const next = window.history.state?.bbberahPage as Page | undefined;

      if (next) {
        setPage(next);
        setShowMenu(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', onPopState);

    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const go = (p: Page) => {
    if (p === page) {
      setShowMenu(false);
      return;
    }

    window.history.pushState({ bbberahPage: p }, '', '#' + p);

    setPage(p);
    setShowMenu(false);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSearchPage = () => {
    setSearchSubmitted(false);
    go('search');
  };

  const findCityLocation = (city: string) => {
    for (const province of iranLocations) {
      for (const county of province.counties) {
        if (county.cities.includes(city)) {
          return {
            provinceId: String(province.id),
            countyId: String(county.id),
          };
        }
      }
    }

    return null;
  };

  const filtered = useMemo(
    () =>
      loads.filter(load => {
        if (load.status === 'delivered') return false;

        const originLocation = findCityLocation(load.from);
        const destinationLocation = findCityLocation(load.to);

        const originMatch =
          !origin && !originProvince
            ? true
            : origin === '__nearby__'
              ? load.distance <= 50
              : !!originLocation &&
                (!originProvince ||
                  originLocation.provinceId === originProvince) &&
                (!originCounty ||
                  originLocation.countyId === originCounty) &&
                (!origin || load.from === origin);

        const destinationMatch =
          !destination && !destinationProvince
            ? true
            : !!destinationLocation &&
              (!destinationProvince ||
                destinationLocation.provinceId === destinationProvince) &&
              (!destinationCounty ||
                destinationLocation.countyId === destinationCounty) &&
              (!destination || load.to === destination);

        return originMatch && destinationMatch;
      }),
    [
      loads,
      origin,
      originProvince,
      originCounty,
      destination,
      destinationProvince,
      destinationCounty,
    ],
  );

  const requestOffer = (load: Load) => {
    setSelected(load);
    setOfferPrice(String(load.price));
    setOfferOpen(true);
  };

  const submitOffer = () => {
    if (actionBusy) return;

    const n = Number(offerPrice.replace(/,/g, ''));

    if (!termsAccepted) {
      return notify('ابتدا قوانین و مقررات براه را مطالعه و تأیید کنید.');
    }

    if (!n || n < 1000000) {
      return notify('مبلغ پیشنهاد را به‌صورت معتبر وارد کنید.');
    }

    setActionBusy(true);

    window.setTimeout(() => {
      setActionBusy(false);
    }, 500);

    setOfferOpen(false);
    setOfferSuccess(true);
    go('offers');
    notify('پیشنهاد شما با موفقیت ارسال شد.');
  };

  const openNearby = () => {
    setOriginProvince('');
    setOriginCounty('');
    setOrigin('__nearby__');
    setOriginText('اطراف من');

    setDestinationProvince('');
    setDestinationCounty('');
    setDestination('');
    setDestinationText('');

    setSearchSubmitted(true);
    go('search');
  };

  const runSearch = () => {
    const nearbyMode =
      origin === '__nearby__' || originText === 'اطراف من';

    const allDestinationsMode = destinationText === 'همه شهرها';

    if (
      (!originText && !nearbyMode) ||
      (!destinationText && !nearbyMode && !allDestinationsMode)
    ) {
      return notify('لطفاً مبدأ و مقصد را انتخاب کنید.');
    }

    if (!origin && originText && originText !== 'اطراف من') {
      setOrigin(originText);
    }

    if (
      !destination &&
      destinationText &&
      destinationText !== 'همه شهرها'
    ) {
      setDestination(destinationText);
    }

    setSearchSubmitted(true);

    notify(
      nearbyMode
        ? 'بارهای اطراف من نمایش داده شد.'
        : 'بارهای مطابق مسیر نمایش داده شد.',
    );
  };

  const clearAll = () => {
    setOrigin('');
    setOriginText('');
    setOriginProvince('');
    setOriginCounty('');

    setDestination('');
    setDestinationText('');
    setDestinationProvince('');
    setDestinationCounty('');

    setSearchSubmitted(false);
  };

  const onSelectRoute = (from: string, to: string) => {
    setOrigin(from);
    setOriginText(from);

    setDestination(to);
    setDestinationText(to);

    setSearchSubmitted(true);
    go('search');
  };

  const handleChooseProvince = (
    mode: 'origin' | 'destination',
    id: string,
  ) => {
    if (mode === 'origin') {
      setOriginProvince(id);
      setOriginCounty('');
      setOrigin('');
      setOriginText('');
      return;
    }

    setDestinationProvince(id);
    setDestinationCounty('');
    setDestination('');
    setDestinationText('');
  };

  const handleChooseCity = (
    mode: 'origin' | 'destination',
    city: string,
    countyId: string,
  ) => {
    if (mode === 'origin') {
      setOriginCounty(countyId);
      setOrigin(city);
      setOriginText(city);
      setSearchSubmitted(false);
      go('search');
      return;
    }

    setDestinationCounty(countyId);
    setDestination(city);
    setDestinationText(city);
    setSearchSubmitted(false);

    setDestinationProvince('');

    go('search');
  };

  const handleChooseNearby = () => {
    setOriginProvince('');
    setOriginCounty('');
    setOrigin('__nearby__');
    setOriginText('اطراف من');

    setDestinationProvince('');
    setDestinationCounty('');
    setDestination('');
    setDestinationText('');

    setSearchSubmitted(true);
    go('search');
  };

  const handleOpenAllDestinationCities = () => {
    setOriginProvince('');
    setOriginCounty('');
    setOrigin('__nearby__');
    setOriginText('اطراف من');

    setDestinationProvince('');
    setDestinationCounty('');
    setDestination('');
    setDestinationText('همه شهرها');

    setSearchSubmitted(true);
    go('search');
  };

  const handleChangeProvince = (mode: 'origin' | 'destination') => {
    if (mode === 'origin') {
      setOriginProvince('');
      setOriginCounty('');
      setOrigin('');
      setOriginText('');
      return;
    }

    setDestinationProvince('');
    setDestinationCounty('');
    setDestination('');
    setDestinationText('');

    go('destination-select');
  };

  const handleToggleTerms = () => {
    setTermsAccepted(value => !value);

    notify(
      !termsAccepted
        ? 'پذیرش قوانین ثبت شد.'
        : 'پذیرش قوانین لغو شد.',
    );
  };

  const handleSignOut = () => {
    setShowMenu(false);
    void signOut();
  };

  const handleOpenCargo = (load: Load) => {
    setSelected(load);
    go('cargo-detail');
  };

  const handleCancelOffer = () => {
    setConfirmAction(null);
    setActionBusy(true);

    window.setTimeout(() => {
      setActionBusy(false);
      notify('پیشنهاد لغو شد.');
    }, 500);
  };

  const handleSaveAccount = () => {
    notify('تغییرات به‌صورت آزمایشی ذخیره شد.');
  };

  const handleUpdateNearby = () => {
    notify('موقعیت مکانی آزمایشی به‌روزرسانی شد.');
  };

  const handleRetryTransactions = () => {
    notify('داده آزمایشی جدیدی وجود ندارد.');
  };

  const handleTopUp = () => {
    notify('درگاه پرداخت در فاز دوم متصل می‌شود.');
  };

  const handleSupportChat = () => {
    notify('چت پشتیبانی در نسخه نهایی فعال می‌شود.');
  };

  const handleToggleDarkMode = () => {
    notify('حالت کم‌نور فعلاً در حالت آزمایشی است.');
  };

  const handleDisableNotifications = () => {
    setNotifications(0);
    notify('اعلان‌ها در حالت آزمایشی خاموش شدند.');
  };

  const renderPage = () => {
    if (page === 'home') {
      return (
        <HomePage
          onOpenSearch={openSearchPage}
          onNearby={openNearby}
          onOpenOffers={() => go('offers')}
        />
      );
    }

    if (page === 'search') {
      return (
        <SearchPage
          origin={origin}
          originText={originText}
          destination={destination}
          destinationText={destinationText}
          searchSubmitted={searchSubmitted}
          filtered={filtered}
          onRunSearch={runSearch}
          onClearAll={clearAll}
          onGoOriginSelect={() => go('origin-select')}
          onGoDestinationSelect={() => go('destination-select')}
          onSelectRoute={onSelectRoute}
          onOpenCargo={handleOpenCargo}
          onOffer={requestOffer}
        />
      );
    }

    if (page === 'profile') {
      return <ProfilePage profile={profile} onGo={go} />;
    }

    if (page === 'cargo-detail') {
      return (
        <DetailPage
          selected={selected}
          onOffer={requestOffer}
          onGoSearch={openSearchPage}
        />
      );
    }

    if (page === 'origin-select') {
      return (
        <LocationSelectPage
          mode="origin"
          allCities={false}
          originProvince={originProvince}
          destinationProvince={destinationProvince}
          onChooseProvince={handleChooseProvince}
          onChooseCity={handleChooseCity}
          onChooseNearby={handleChooseNearby}
          onOpenAllDestinationCities={handleOpenAllDestinationCities}
          onChangeProvince={handleChangeProvince}
          onBack={() => go('search')}
        />
      );
    }

    if (page === 'destination-select') {
      return (
        <LocationSelectPage
          mode="destination"
          allCities={false}
          originProvince={originProvince}
          destinationProvince={destinationProvince}
          onChooseProvince={handleChooseProvince}
          onChooseCity={handleChooseCity}
          onChooseNearby={handleChooseNearby}
          onOpenAllDestinationCities={handleOpenAllDestinationCities}
          onChangeProvince={handleChangeProvince}
          onBack={() => go('search')}
        />
      );
    }

    if (page === 'destination-all') {
      return (
        <LocationSelectPage
          mode="destination"
          allCities
          originProvince={originProvince}
          destinationProvince={destinationProvince}
          onChooseProvince={handleChooseProvince}
          onChooseCity={handleChooseCity}
          onChooseNearby={handleChooseNearby}
          onOpenAllDestinationCities={handleOpenAllDestinationCities}
          onChangeProvince={handleChangeProvince}
          onBack={() => go('search')}
        />
      );
    }

    if (page === 'nearby') {
      return (
        <NearbyPage
          loads={loads}
          onUpdateLocation={handleUpdateNearby}
          onOpenCargo={handleOpenCargo}
          onOffer={requestOffer}
        />
      );
    }

    if (page === 'calls') {
      return <CallsPage loads={loads} />;
    }

    if (page === 'notifications') {
      return <NotificationsPage />;
    }

    if (page === 'offers') {
      return (
        <OffersPage
          offerSuccess={offerSuccess}
          onCancelOffer={() => setConfirmAction('cancel-offer')}
        />
      );
    }

    if (page === 'shipment') {
      return <ShipmentPage />;
    }

    if (page === 'wallet') {
      return <WalletPage onTopUp={handleTopUp} />;
    }

    if (page === 'transactions') {
      return <TransactionsPage onRetry={handleRetryTransactions} />;
    }

    if (page === 'vehicle') {
      return <ProfilePage profile={profile} onGo={go} />;
    }

    if (page === 'account') {
      return (
        <AccountPage
          profile={profile}
          accountName={accountName}
          onChangeName={setAccountName}
          onSave={handleSaveAccount}
        />
      );
    }

    if (page === 'support') {
      return <SupportPage onOpenChat={handleSupportChat} />;
    }

    if (page === 'display') {
      return (
        <DisplayPage
          onToggleDarkMode={handleToggleDarkMode}
          onDisableNotifications={handleDisableNotifications}
        />
      );
    }

    if (page === 'rules') {
      return (
        <RulesPage
          termsAccepted={termsAccepted}
          onToggleTerms={handleToggleTerms}
        />
      );
    }

    return <ProfilePage profile={profile} onGo={go} />;
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f8f7] text-gray-900">
      <Header
        notifications={notifications}
        onOpenMenu={() => setShowMenu(true)}
        onGoHome={() => go('home')}
        onOpenNotifications={() => {
          setNotifications(0);
          go('notifications');
        }}
      />

      <main className="max-w-lg mx-auto px-4 pt-5 pb-24">
        {page !== 'home' && page !== 'profile' && (
          <button
            onClick={() =>
              go(
                page === 'cargo-detail' ||
                  page === 'origin-select' ||
                  page === 'destination-select' ||
                  page === 'destination-all'
                  ? 'search'
                  : 'home',
              )
            }
            className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت
          </button>
        )}

        {renderPage()}
      </main>

      <BottomNav page={page} onGo={go} onOpenSearch={openSearchPage} />

      <Drawer
        isOpen={showMenu}
        profile={profile}
        onClose={() => setShowMenu(false)}
        onGo={go}
        onSignOut={handleSignOut}
      />

      <Toast message={toast} onClose={() => setToast('')} />

      {confirmAction && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <h3 className="font-black text-lg">تأیید عملیات</h3>

            <p className="text-sm text-gray-500 mt-2">
              {confirmAction === 'cancel-offer'
                ? 'آیا می‌خواهید پیشنهاد انتخاب‌شده لغو شود؟'
                : 'آیا می‌خواهید این بار لغو شود؟ این عملیات در نسخه آزمایشی فقط وضعیت رابط را تغییر می‌دهد.'}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <Button
                variant="outline"
                onClick={() => setConfirmAction(null)}
              >
                انصراف
              </Button>

              <Button onClick={handleCancelOffer}>
                {actionBusy ? 'در حال انجام...' : 'تأیید'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {page === 'shipment' && shipmentStage === 'delivered' && (
        <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-lg px-4">
          <div className="rounded-2xl bg-white border shadow-xl p-4">
            <b>سفر با موفقیت تحویل شد</b>

            <div className="flex gap-2 mt-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-2xl ${
                    n <= rating ? '' : 'opacity-30'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <Button
              className="w-full mt-3"
              onClick={() =>
                notify(
                  rating
                    ? 'امتیاز شما در حالت آزمایشی ثبت شد.'
                    : 'لطفاً امتیاز را انتخاب کنید.',
                )
              }
            >
              ثبت امتیاز
            </Button>
          </div>
        </div>
      )}

      {offerOpen && selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <div className="w-full max-w-lg bg-white rounded-t-[28px] p-5 pb-7">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">ثبت پیشنهاد</h3>

              <button
                onClick={() => setOfferOpen(false)}
                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-2">{selected.title}</p>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">کرایه اعلامی</span>

                <b>{money(selected.price)} تومان</b>
              </div>

              <div className="mt-3 rounded-xl bg-primary-50 p-3 text-xs text-primary-800">
                <div className="flex items-center gap-2 font-bold">
                  <CircleDollarSign className="w-4 h-4" />
                  شاخص میانگین قیمت مسیر
                </div>

                <div className="mt-4" dir="ltr">
                  <div className="relative h-7 overflow-visible rounded-full bg-gradient-to-r from-lime-200 via-lime-300 to-lime-500">
                    <div className="absolute top-1/2 left-[68%] -translate-x-1/2 -translate-y-1/2">
                      <span className="block w-4 h-4 rounded-full bg-white border-[3px] border-lime-700 shadow" />

                      <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-lime-700" />
                    </div>
                  </div>

                  <div
                    className="mt-3 flex items-center justify-between text-[10px] text-gray-500"
                    dir="rtl"
                  >
                    <span className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-lime-500" />
                      کم
                    </span>

                    <span className="flex items-center gap-1">
                      <Coins className="w-5 h-5 text-lime-700" />
                      زیاد
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <label className="block text-sm font-bold mt-5">
              مبلغ پیشنهادی (تومان)
            </label>

            <input
              autoFocus
              inputMode="numeric"
              value={offerPrice}
              onChange={e =>
                setOfferPrice(e.target.value.replace(/[^0-9]/g, ''))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-left outline-none focus:border-primary-400"
              dir="ltr"
            />

            <Button
              size="full"
              className="mt-4"
              disabled={actionBusy}
              onClick={submitOffer}
            >
              {actionBusy ? 'در حال ثبت...' : 'ارسال پیشنهاد'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  }
