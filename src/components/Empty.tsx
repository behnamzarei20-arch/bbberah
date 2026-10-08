import { Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function Empty({ title, text, action }: { title: string; text: string; action?: () => void }) {
  return (
    <div className="py-14 text-center">
      <Package className="w-10 h-10 mx-auto text-gray-300" />
      <h3 className="font-black mt-3">{title}</h3>
      <p className="text-sm text-gray-400 mt-2">{text}</p>
      {action && (
        <Button size="sm" variant="outline" className="mt-5" onClick={action}>
          تلاش دوباره
        </Button>
      )}
    </div>
  );
}

export default Empty;