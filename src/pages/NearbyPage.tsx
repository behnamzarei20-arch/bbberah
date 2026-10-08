import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import LoadCard from '@/components/LoadCard';
import type { Load } from '@/types';

type NearbyPageProps = {
  loads: Load[];
  onUpdateLocation: () => void;
  onOpenCargo: (l: Load) => void;
  onOffer: (l: Load) => void;
};

const NearbyPage = ({
  loads,
  onUpdateLocation,
  onOpenCargo,
  onOffer,
}: NearbyPageProps) => (
  <div className="space-y-4">
    <Card>
      <CardBody className="p-5">
        <div className="flex gap-3">
          <MapPin className="w-6 h-6 text-primary-600" />

          <div>
            <b>بارهای اطراف</b>

            <p className="text-xs text-gray-400 mt-1">
              برای فاز اول، فاصله‌ها شبیه‌سازی شده‌اند.
            </p>
          </div>
        </div>

        <Button className="w-full mt-4" onClick={onUpdateLocation}>
          به‌روزرسانی موقعیت
        </Button>
      </CardBody>
    </Card>

    {loads
      .filter(l => l.status === 'open')
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4)
      .map(l => (
        <LoadCard
          key={l.id}
          load={l}
          onOpen={() => onOpenCargo(l)}
          onOffer={() => onOffer(l)}
        />
      ))}
  </div>
);

export default NearbyPage;
