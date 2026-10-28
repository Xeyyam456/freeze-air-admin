// Ustada hazırda olan alət/material (açıq təhvil). received_at: usta "Aldım" basıb; disputed_at: "Almadım" deyib (0084)
export type Holding = {
  id: number;
  tool_id: number;
  employee_id: number;
  quantity: number;
  taken_at: string;
  received_at: string | null;
  disputed_at: string | null;
  employees: { full_name: string; photo_url: string | null } | null;
};
