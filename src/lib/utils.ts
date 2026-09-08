export function formatToman(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '۰';
  const formatted = Math.round(amount).toLocaleString('fa-IR');
  return formatted;
}

export function formatTomanWithUnit(amount: number | null | undefined): string {
  return `${formatToman(amount)} تومان`;
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '-';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export function timeAgo(date: string | null | undefined): string {
  if (!date) return '';
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} روز پیش`;
  if (hours > 0) return `${hours} ساعت پیش`;
  if (minutes > 0) return `${minutes} دقیقه پیش`;
  return 'همین حالا';
}

export function toFaDigits(input: string | number): string {
  const faDigits = '۰۱۲۳۴۵۶۷۸۹';
  return String(input).replace(/[0-9]/g, (d) => faDigits[parseInt(d)]);
}
