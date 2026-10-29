// Hover qatı: hər gün üçün sütun, şaquli xətt, nöqtə, tooltip
export type ChartHoverProps = {
  y: number;
  m: number;
  series: number[];
  values: number[];
  shown: number;
  top: number;
  cumulative: boolean;
  hover: number | null;
  onHover: (i: number | null) => void;
};
