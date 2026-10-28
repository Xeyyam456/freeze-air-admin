// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    id: number
    place_kind: string
    place_id: number
    employee_id: number | null
    old_lat: number | null
    old_lng: number | null
    old_address: string | null
    new_lat: number | null
    new_lng: number | null
    new_address: string | null
    accuracy_m: number | null
    created_at: string
  }
  Insert: {
    id?: number
    place_kind?: string
    place_id?: number
    employee_id?: number | null
    old_lat?: number | null
    old_lng?: number | null
    old_address?: string | null
    new_lat?: number | null
    new_lng?: number | null
    new_address?: string | null
    accuracy_m?: number | null
    created_at?: string
  }
  Update: {
    id?: number
    place_kind?: string
    place_id?: number
    employee_id?: number | null
    old_lat?: number | null
    old_lng?: number | null
    old_address?: string | null
    new_lat?: number | null
    new_lng?: number | null
    new_address?: string | null
    accuracy_m?: number | null
    created_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "place_location_log_employee_id_fkey"
      columns: ["employee_id"]
      isOneToOne: false
      referencedRelation: "employees"
      referencedColumns: ["id"]
    },
  ]
}
