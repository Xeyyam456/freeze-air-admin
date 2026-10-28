// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Relationships = [
  {
    foreignKeyName: "tasks_company_id_fkey"
    columns: ["company_id"]
    isOneToOne: false
    referencedRelation: "companies"
    referencedColumns: ["id"]
  },
  {
    foreignKeyName: "tasks_employee_id_fkey"
    columns: ["employee_id"]
    isOneToOne: false
    referencedRelation: "employees"
    referencedColumns: ["id"]
  },
  {
    foreignKeyName: "tasks_reassigned_to_fkey"
    columns: ["reassigned_to"]
    isOneToOne: false
    referencedRelation: "tasks"
    referencedColumns: ["id"]
  },
  {
    foreignKeyName: "tasks_store_id_fkey"
    columns: ["store_id"]
    isOneToOne: false
    referencedRelation: "stores"
    referencedColumns: ["id"]
  },
  {
    foreignKeyName: "tasks_work_log_id_fkey"
    columns: ["work_log_id"]
    isOneToOne: false
    referencedRelation: "work_logs"
    referencedColumns: ["id"]
  },
]
