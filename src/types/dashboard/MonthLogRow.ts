// Ayın işi (Ayın icmalı üçün)
export type MonthLogRow = {
  id: number;
  work_date: string;
  employee_id: number;
  place_text: string | null;
  store_id: number | null;
  company_id: number | null;
  employees: { full_name: string; photo_url: string | null } | null;
};
