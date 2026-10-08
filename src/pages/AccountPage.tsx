import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

type AccountPageProps = {
  profile: {
    full_name?: string;
    phone?: string;
  } | null;
  accountName: string;
  onChangeName: (v: string) => void;
  onSave: () => void;
};

const AccountPage = ({
  profile,
  accountName,
  onChangeName,
  onSave,
}: AccountPageProps) => (
  <Card>
    <CardBody className="p-5 space-y-4">
      <label className="text-sm font-bold">
        نام و نام خانوادگی
      </label>

      <input
        value={accountName}
        onChange={e => onChangeName(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-3"
      />

      <label className="text-sm font-bold">
        شماره موبایل
      </label>

      <input
        value={profile?.phone || ''}
        disabled
        dir="ltr"
        className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50"
      />

      <Button className="w-full" onClick={onSave}>
        ذخیره تغییرات
      </Button>
    </CardBody>
  </Card>
);

export default AccountPage;
