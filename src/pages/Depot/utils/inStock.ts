import type { Tool } from "@/pages/Depot/utils";

// Depoda (boş) nə qədər var: materialda tam hissə + parçalar
export const inStock = (t: Tool) => t.available + t.pieces_total;
