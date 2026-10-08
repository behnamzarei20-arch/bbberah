import { useState } from 'react';
import { ArrowLeft, Search, Navigation, ChevronLeft } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import Empty from '@/components/Empty';
import { fa } from '@/lib/format';
import { iranLocations } from '@/data/iranLocations';

type LocationSelectPageProps = {
  mode: 'origin' | 'destination';
  allCities?: boolean;
  originProvince: string;
  destinationProvince: string;
  onChooseProvince: (mode: 'origin' | 'destination', id: string) => void;
  onChooseCity: (
    mode: 'origin' | 'destination',
    city: string,
    countyId: string
  ) => void;
  onChooseNearby: () => void;
  onOpenAllDestinationCities: () => void;
  onChangeProvince: (mode: 'origin' | 'destination') => void;
  onBack: () => void;
};

const LocationSelectPage = ({
  mode,
  allCities = false,
  originProvince,
  destinationProvince,
  onChooseProvince,
  onChooseCity,
  onChooseNearby,
  onOpenAllDestinationCities,
  onChangeProvince,
  onBack,
}: LocationSelectPageProps) => {
  const isOrigin = mode === 'origin';
  const provinceId = isOrigin ? originProvince : destinationProvince;
  const provinceData = iranLocations.find(
    p => String(p.id) === provinceId
  );

  const [query, setQuery] = useState('');
  const normalized = query.trim().toLocaleLowerCase('fa-IR');

  const visibleProvinces = iranLocations.filter(
    p =>
      !normalized ||
      p.name.toLocaleLowerCase('fa-IR').includes(normalized)
  );

  const allDestinationCities = iranLocations.flatMap(p =>
    p.counties.flatMap(c =>
      c.cities.map(city => ({
        city,
        countyId: String(c.id),
      }))
    )
  );

  const provinceCities = provinceData
    ? provinceData.counties.flatMap(c =>
        c.cities.map(city => ({
          city,
          countyId: String(c.id),
        }))
      )
    : [];

  const sourceCities = allCities ? allDestinationCities : provinceCities;
  const filteredCities = sourceCities.filter(
    x =>
      !normalized ||
      x.city.toLocaleLowerCase('fa-IR').includes(normalized)
  );

  const [cityLimit, setCityLimit] = useState(120);
  const visibleCities =
    allCities && !normalized
      ? filteredCities.slice(0, cityLimit)
      : filteredCities;

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h2 className="font-black text-lg">
                {isOrigin ? 'انتخاب مبدأ' : 'انتخاب مقصد'}
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                {isOrigin
                  ? 'استان یا شهر مبدأ را انتخاب کنید'
                  : 'استان یا شهر مقصد را انتخاب کنید'}
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={
                isOrigin
                  ? 'مثال تهران'
                  : 'استان مقصد را انتخاب کنید'
              }
              className="w-full rounded-2xl border border-gray-200 bg-white pr-11 pl-4 py-4 outline-none focus:border-primary-400"
            />
          </div>

          {isOrigin && (
            <button
              type="button"
              onClick={onChooseNearby}
              className="w-full mt-3 rounded-2xl bg-primary-50 border border-primary-100 p-3.5 flex items-center gap-3 text-right"
            >
              <Navigation className="w-5 h-5 text-primary-600" />

              <span className="font-bold text-primary-800">
                اطراف من
              </span>
            </button>
          )}

          {!isOrigin && (
            <button
              type="button"
              onClick={onOpenAllDestinationCities}
              className={`w-full mt-3 rounded-2xl ${
                allCities
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-100 text-primary-900'
              } border border-primary-200 p-4 flex items-center justify-between text-right active:scale-[0.99]`}
            >
              <span>
                <b className="block">همه شهرها</b>

                <span
                  className={`text-[11px] ${
                    allCities
                      ? 'text-white/80'
                      : 'text-primary-700'
                  }`}
                >
                  نمایش و انتخاب از تمام شهرهای ایران
                </span>
              </span>

              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {!provinceData && !allCities && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <b className="text-sm">
                  {isOrigin ? 'لیست استان‌ها' : 'استان‌ها'}
                </b>

                <span className="text-[11px] text-gray-400">
                  {fa(visibleProvinces.length)} استان
                </span>
              </div>

              <div className="space-y-2 max-h-[52vh] overflow-auto">
                {visibleProvinces.map(p => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() =>
                      onChooseProvince(mode, String(p.id))
                    }
                    className="w-full rounded-xl bg-gray-50 hover:bg-primary-50 p-3.5 flex items-center justify-between text-right"
                  >
                    <span className="font-bold">{p.name}</span>

                    <ChevronLeft className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {(provinceData || allCities) && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <b className="text-sm">
                    {allCities ? 'همه شهرها' : provinceData?.name}
                  </b>

                  <span className="block text-[11px] text-gray-400 mt-1">
                    {allCities
                      ? 'تمام شهرهای ایران'
                      : 'شهرهای استان'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onChangeProvince(mode)}
                  className="text-xs font-bold text-primary-700"
                >
                  تغییر استان
                </button>
              </div>

              <div className="space-y-2 max-h-[52vh] overflow-auto">
                {visibleCities.length ? (
                  visibleCities.map(x => (
                    <button
                      type="button"
                      key={x.countyId + '-' + x.city}
                      onClick={() =>
                        onChooseCity(
                          mode,
                          x.city,
                          x.countyId
                        )
                      }
                      className="w-full rounded-xl bg-gray-50 hover:bg-primary-50 p-3.5 flex items-center justify-between text-right"
                    >
                      <span className="font-bold">
                        {x.city}
                      </span>

                      <span className="text-[11px] text-gray-400">
                        انتخاب
                      </span>
                    </button>
                  ))
                ) : (
                  <Empty
                    title="شهری پیدا نشد"
                    text="نام شهر را تغییر دهید."
                  />
                )}
              </div>

              {allCities &&
                !normalized &&
                allDestinationCities.length >
                  visibleCities.length && (
                  <button
                    type="button"
                    onClick={() =>
                      setCityLimit(v =>
                        Math.min(
                          v + 120,
                          allDestinationCities.length
                        )
                      )
                    }
                    className="w-full mt-3 rounded-xl border border-primary-200 bg-primary-50 text-primary-700 py-3 text-sm font-black"
                  >
                    نمایش شهرهای بیشتر (
                    {fa(
                      Math.min(
                        120,
                        allDestinationCities.length -
                          visibleCities.length
                      )
                    )}
                    )
                  </button>
                )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default LocationSelectPage;
