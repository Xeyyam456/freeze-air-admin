// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    crew_id: number
    employee_id: number
  }
  Insert: {
    crew_id: number
    employee_id: number
  }
  Update: {
    crew_id?: number
    employee_id?: number
  }
  Relationships: [
    {
      foreignKeyName: "crew_members_crew_id_fkey"
      columns: ["crew_id"]
      isOneToOne: false
      referencedRelation: "crews"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "crew_members_employee_id_fkey"
      columns: ["employee_id"]
      isOneToOne: false
      referencedRelation: "employees"
      referencedColumns: ["id"]
    },
  ]
}
