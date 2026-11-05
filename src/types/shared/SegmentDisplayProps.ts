export type SegmentDisplayProps = {
  text: string;
  digits?: number; // rəqəm yeri (standart 2); mətn qısadırsa boş yerlər sönük qalır
  align?: "left" | "right"; // mətn hansı tərəfə sıxılsın (say üçün sağa)
  className?: string;
};
