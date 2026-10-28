// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    id: number
    name: string
  }
  Insert: {
    id?: never
    name: string
  }
  Update: {
    id?: never
    name?: string
  }
  Relationships: []
}
