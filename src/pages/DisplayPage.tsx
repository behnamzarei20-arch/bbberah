import { Card, CardBody } from '@/components/ui/Card';

type DisplayPageProps = {
  onToggleDarkMode: () => void;
  onDisableNotifications: () => void;
};

const DisplayPage = ({
  onToggleDarkMode,
  onDisableNotifications,
}: DisplayPageProps) => (
  <Card>
    <CardBody className="p-5 space-y-4">
      <div>
        <h3 className="font-black text-lg">تنظیمات ظاهری</h3>

        <p className="text-sm text-gray-500 mt-1">
          تنظیمات نمایشی فعلاً روی دستگاه شبیه‌سازی می‌شوند.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
        <div>
          <b className="text-sm">حالت کم‌نور</b>

          <p className="text-xs text-gray-400 mt-1">
            در نسخه نهایی به تنظیمات دستگاه متصل می‌شود.
          </p>
        </div>

        <button
          onClick={onToggleDarkMode}
          className="rounded-full bg-gray-200 px-4 py-2 text-xs font-bold"
        >
          خاموش
        </button>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
        <div>
          <b className="text-sm">اعلان‌ها</b>

          <p className="text-xs text-gray-400 mt-1">
            کنترل اعلان‌های برنامه
          </p>
        </div>

        <button
          onClick={onDisableNotifications}
          className="rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-xs font-bold"
        >
          فعال
        </button>
      </div>
    </CardBody>
  </Card>
);

export default DisplayPage;
