// Yeri olan sətir (tapşırıq, iş qeydi): mağaza/filial, şirkət və ya sərbəst yer
export type FlowPlaced = { place_text: string | null; stores: { name: string; companies: { name: string } | null } | null; companies: { name: string } | null };
