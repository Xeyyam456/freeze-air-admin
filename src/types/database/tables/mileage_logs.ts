// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    cost: number | null
    created_at: string
    day: string
    employee_id: number
    end_at: string | null
    end_km: number | null
    end_photo: string | null
    fuel_per_100: number | null
    fuel_price: number | null
    fuel_type: string | null
    id: number
    km: number | null
    liters: number | null
    start_at: string
    start_km: number
    start_photo: string | null
  }
  Insert: {
    cost?: number | null
    created_at?: string
    day?: string
    employee_id: number
    end_at?: string | null
    end_km?: number | null
    end_photo?: string | null
    fuel_per_100?: number | null
    fuel_price?: number | null
    fuel_type?: string | null
    id?: never
    km?: number | null
    liters?: number | null
    start_at?: string
    start_km: number
    start_photo?: string | null
  }
  Update: {
    cost?: number | null
    created_at?: string
    day?: string
    employee_id?: number
    end_at?: string | null
    end_km?: number | null
    end_photo?: string | null
    fuel_per_100?: number | null
    fuel_price?: number | null
    fuel_type?: string | null
    id?: never
    km?: number | null
    liters?: number | null
    start_at?: string
    start_km?: number
    start_photo?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "mileage_logs_employee_id_fkey"
      columns: ["employee_id"]
      isOneToOne: false
      referencedRelation: "employees"
      referencedColumns: ["id"]
    },
  ]
}
