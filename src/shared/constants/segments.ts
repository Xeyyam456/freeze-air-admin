// 14 seqmentli LCD rəqəminin seqmentləri (viewBox 0 0 60 100): [x1, y1, x2, y2]
// a üst, b/c sağ, d alt, e/f sol, g1/g2 orta, h/j/k/m diaqonal, i/l mərkəz şaquli
export const SEGMENTS = {
  a: [13, 8, 47, 8],
  b: [52, 13, 52, 45],
  c: [52, 55, 52, 87],
  d: [13, 92, 47, 92],
  e: [8, 55, 8, 87],
  f: [8, 13, 8, 45],
  g1: [13, 50, 26, 50],
  g2: [34, 50, 47, 50],
  h: [14, 15, 26, 43],
  i: [30, 15, 30, 43],
  j: [46, 15, 34, 43],
  k: [26, 57, 14, 85],
  l: [30, 57, 30, 85],
  m: [34, 57, 46, 85],
} as const;

export type SegmentName = keyof typeof SEGMENTS;
