import type { Tool } from "@/types/depot";

// Depoda (boş) nə qədər var: materialda tam hissə + parçalar
export const inStock = (t: Tool) => t.available + t.pieces_total;
