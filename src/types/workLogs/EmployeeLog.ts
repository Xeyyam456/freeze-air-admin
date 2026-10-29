import type { FileCount } from "@/lib/jobs";
import type { EmployeeLogFile } from "./EmployeeLogFile";

// Ustanın kartındakı iş (fayllar imzalı linklə)
export type EmployeeLog = {
  id: number;
  work_date: string;
  description: string;
  employee_id: number;
  store_id: number | null;
  company_id: number | null;
  place_text: string | null;
  stores: { code: string; name: string; companies: { name: string } | null } | null;
  companies: { name: string } | null;
  work_files: EmployeeLogFile[];
  created_at: string;
  groupFiles?: FileCount; // qrup işi: yoldaşın qeydinə yüklənmiş fayllar (bu qeyddə yoxdur)
};
