// Depoda qalan material parçası (usta işlədib, qalanını təhvil verib): ayrı-ayrı göstərilir
// length: depoda qalan uzunluq; original_length: usta ilkin nə qədər qaytarıb (parçadan hissə veriləndə length azalır, original qalır)
export type Piece = { id: number; tool_id: number; length: number; original_length: number | null; created_at: string; employees: { full_name: string } | null };
