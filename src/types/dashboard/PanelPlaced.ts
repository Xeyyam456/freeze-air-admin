// İş qeydinin yeri (şirkət adı üçün)
export type PanelPlaced = { place_text: string | null; stores: { name: string; companies: { name: string } | null } | null; companies: { name: string } | null };
