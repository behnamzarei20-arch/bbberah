import {
  User,
  CarFront,
  WalletCards,
  ReceiptText,
  Truck,
  Headphones,
  ChevronLeft,
} from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import type { Page } from '@/types';

type ProfilePageProps = {
  profile: {
    full_name?: string;
    phone?: string;
  } | null;
  onGo: (p: Page) => void;
};

const ProfilePage = ({ profile, onGo }: ProfilePageProps) => {
  const items = [
    {
      page: 'account' as Page,
      title: 'اطلاعات حساب',
      description: 'نام، شهر و شماره تماس',
      icon: User,
    },
    {
      page: 'vehicle' as Page,
      title: 'خودروی من',
      description: 'نوع خودرو، بارگیر و کاربری',
      icon: CarFront,
    },
    {
      page: 'wallet' as Page,
      title: 'کیف پول',
      description: 'موجودی و عملیات مالی',
      icon: WalletCards,
    },
    {
      page: 'transactions' as Page,
      title: 'تراکنش‌ها',
      description: 'سوابق مالی',
      icon: ReceiptText,
    },
    {
      page: 'offers' as Page,
      title: 'پیشنهادهای من',
      description: 'پیشنهادهای ارسال‌شده',
      icon: ReceiptText,
    },
    {
      page: 'shipment' as Page,
      title: 'سفر جاری',
      description: 'وضعیت بار فعال',
      icon: Truck,
    },
    {
      page: 'support' as Page,
      title: 'پشتیبانی',
      description: 'راهنما و ارتباط',
      icon: Headphones,
    },
  ];

  return (
    <div className="space-y-3">
      <Card>
        <CardBody className="p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center">
            <User className="w-7 h-7 text-primary-700" />
          </div>

          <div>
            <b className="text-lg">
              {profile?.full_name || 'کاربر براه'}
            </b>

            <p className="text-xs text-gray-400 mt-1" dir="ltr">
              {profile?.phone}
            </p>
          </div>
        </CardBody>
      </Card>

      {items.map(item => {
        const Icon = item.icon;

        return (
          <button
            key={item.page}
            onClick={() => onGo(item.page)}
            className="w-full rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3 text-right"
          >
            <Icon className="w-5 h-5 text-primary-600" />

            <span className="flex-1">
              <b className="block text-sm">{item.title}</b>

              <small className="text-gray-400">
                {item.description}
              </small>
            </span>

            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
        );
      })}
    </div>
  );
};

export default ProfilePage;
