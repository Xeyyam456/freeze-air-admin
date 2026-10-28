// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    car_model: string | null
    car_plate: string | null
    created_at: string
    fuel_per_100: number | null
    fuel_type: string | null
    full_name: string
    has_car: boolean
    id: number
    is_active: boolean
    is_management: boolean
    is_storekeeper: boolean
    phone: string | null
    photo_url: string | null
    position: string
    specialty: string | null
    start_date: string | null
    user_id: string | null
    worker_type: string
  }
  Insert: {
    car_model?: string | null
    car_plate?: string | null
    created_at?: string
    fuel_per_100?: number | null
    fuel_type?: string | null
    full_name: string
    has_car?: boolean
    id?: never
    is_active?: boolean
    is_management?: boolean
    is_storekeeper?: boolean
    phone?: string | null
    photo_url?: string | null
    position: string
    specialty?: string | null
    start_date?: string | null
    user_id?: string | null
    worker_type?: string
  }
  Update: {
    car_model?: string | null
    car_plate?: string | null
    created_at?: string
    fuel_per_100?: number | null
    fuel_type?: string | null
    full_name?: string
    has_car?: boolean
    id?: never
    is_active?: boolean
    is_management?: boolean
    is_storekeeper?: boolean
    phone?: string | null
    photo_url?: string | null
    position?: string
    specialty?: string | null
    start_date?: string | null
    user_id?: string | null
    worker_type?: string
  }
  Relationships: []
}
