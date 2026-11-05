export type ChartCardProps = {
  title: string;
  noun: string; // "iş", "hərəkət": alt yazı və ipucu üçün
  note?: string; // rəqəmin altındakı əlavə izah
  values: number[]; // son 30 gün, sonuncu bu gün
  days: string[];
  color: string;
  href: string;
  hrefLabel: string;
  className?: string;
};
