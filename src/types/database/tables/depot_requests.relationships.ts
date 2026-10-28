// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Relationships = [
  {
    foreignKeyName: "depot_requests_assignment_id_fkey"
    columns: ["assignment_id"]
    isOneToOne: false
    referencedRelation: "tool_assignments"
    referencedColumns: ["id"]
  },
  {
    foreignKeyName: "depot_requests_employee_id_fkey"
    columns: ["employee_id"]
    isOneToOne: false
    referencedRelation: "employees"
    referencedColumns: ["id"]
  },
  {
    foreignKeyName: "depot_requests_piece_id_fkey"
    columns: ["piece_id"]
    isOneToOne: false
    referencedRelation: "material_pieces"
    referencedColumns: ["id"]
  },
  {
    foreignKeyName: "depot_requests_tool_id_fkey"
    columns: ["tool_id"]
    isOneToOne: false
    referencedRelation: "tool_stock"
    referencedColumns: ["id"]
  },
  {
    foreignKeyName: "depot_requests_tool_id_fkey"
    columns: ["tool_id"]
    isOneToOne: false
    referencedRelation: "tools"
    referencedColumns: ["id"]
  },
]
