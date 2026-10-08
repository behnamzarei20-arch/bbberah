import { CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

type WalletPageProps = {
  onTopUp: () => void;
};

const WalletPage = ({ onTopUp }: WalletPageProps) => (
  <div className="space-y-4">
    <Card>
      <CardBody className="p-6 text-center">
        <CircleDollarSign className="w-8 h-8 mx-auto text-primary-600" />

        <p className="text-sm text-gray-400 mt-3">موجودی آزمایشی</p>

        <b className="text-3xl block mt-2">۰ تومان</b>

        <Button className="w-full mt-5" onClick={onTopUp}>
          افزایش موجودی
        </Button>
      </CardBody>
    </Card>
  </div>
);

export default WalletPage;
