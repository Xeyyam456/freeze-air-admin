// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type PublicTables = {
  ac_brands: import("./ac_brands").Table
  ac_error_codes: import("./ac_error_codes").Table
  ac_models: import("./ac_models").Table
  attendance: import("./attendance").Table
  attendance_absences: import("./attendance_absences").Table
  companies: import("./companies").Table
  contact_requests: import("./contact_requests").Table
  crew_members: import("./crew_members").Table
  crews: import("./crews").Table
  depot_requests: import("./depot_requests").Table
  employees: import("./employees").Table
  fuel_payments: import("./fuel_payments").Table
  fuel_settings: import("./fuel_settings").Table
  leave_requests: import("./leave_requests").Table
  material_pieces: import("./material_pieces").Table
  mileage_logs: import("./mileage_logs").Table
  place_location_log: import("./place_location_log").Table
  profiles: import("./profiles").Table
  site_equipment: import("./site_equipment").Table
  site_faq: import("./site_faq").Table
  site_segments: import("./site_segments").Table
  site_services: import("./site_services").Table
  site_settings: import("./site_settings").Table
  site_stats: import("./site_stats").Table
  site_texts: import("./site_texts").Table
  stock_movements: import("./stock_movements").Table
  stores: import("./stores").Table
  tasks: import("./tasks").Table
  tool_assignments: import("./tool_assignments").Table
  tool_repairs: import("./tool_repairs").Table
  tools: import("./tools").Table
  work_files: import("./work_files").Table
  work_log_materials: import("./work_log_materials").Table
  work_logs: import("./work_logs").Table
}
