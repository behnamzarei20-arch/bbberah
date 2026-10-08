export const money = (v: number) => new Intl.NumberFormat('fa-IR').format(v);

export const fa = (v: string | number) =>
  String(v).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);