// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Fn = {
  Args: { p_tool_id: number; p_type: string }
  Returns: {
    assignment_id: number | null
    created_at: string
    created_by: string
    created_by_name: string | null
    decided_at: string | null
    decided_by: string | null
    decided_by_name: string | null
    decision_note: string | null
    employee_id: number | null
    expected: number | null
    id: number
    note: string | null
    photo_path: string | null
    piece_id: number | null
    quantity: number | null
    reason: string | null
    returned: number | null
    status: string
    supplier: string | null
    tool_id: number | null
    tool_kind: string
    tool_name: string
    type: string
    unit: string
    used: number | null
  }
  SetofOptions: {
    from: "*"
    to: "depot_requests"
    isOneToOne: true
    isSetofReturn: false
  }
}
