// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    cancelled_at: string | null
    cancelled_by: string | null
    company_id: number | null
    created_at: string
    created_by: string | null
    done: boolean
    done_at: string | null
    employee_id: number
    group_id: string | null
    id: number
    note: string | null
    place_text: string | null
    reason: string
    reassigned_to: number | null
    store_id: number | null
    task_date: string
    work_log_id: number | null
  }
  Insert: {
    cancelled_at?: string | null
    cancelled_by?: string | null
    company_id?: number | null
    created_at?: string
    created_by?: string | null
    done?: boolean
    done_at?: string | null
    employee_id: number
    group_id?: string | null
    id?: never
    note?: string | null
    place_text?: string | null
    reason: string
    reassigned_to?: number | null
    store_id?: number | null
    task_date?: string
    work_log_id?: number | null
  }
  Update: {
    cancelled_at?: string | null
    cancelled_by?: string | null
    company_id?: number | null
    created_at?: string
    created_by?: string | null
    done?: boolean
    done_at?: string | null
    employee_id?: number
    group_id?: string | null
    id?: never
    note?: string | null
    place_text?: string | null
    reason?: string
    reassigned_to?: number | null
    store_id?: number | null
    task_date?: string
    work_log_id?: number | null
  }
  Relationships: import("./tasks.relationships").Relationships
}
