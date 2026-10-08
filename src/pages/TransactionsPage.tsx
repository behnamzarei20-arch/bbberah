import { Card, CardBody } from '@/components/ui/Card';
import Empty from '@/components/Empty';

type TransactionsPageProps = {
  onRetry: () => void;
};

const TransactionsPage = ({ onRetry }: TransactionsPageProps) => (
  <Card>
    <CardBody>
      <Empty
        title="تراکنشی وجود ندارد"
        text="سوابق مالی پس از اتصال کیف پول نمایش داده می‌شوند."
        action={onRetry}
      />
    </CardBody>
  </Card>
);

export default TransactionsPage;
