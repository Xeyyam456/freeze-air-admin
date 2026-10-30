export type LeaveRow = {
  id: number;
  employee_id: number;
  date_from: string;
  date_to: string;
  reason: string | null;
  status: string;
  created_at: string;
  decided_at: string | null;
  employees: { full_name: string; photo_url: string | null } | null;
};
