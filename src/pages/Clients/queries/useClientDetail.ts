import { useData } from "@/lib/useData";
import { fetchClientDetail } from "@/services/clients/fetchClientDetail";

export const CLIENT_DETAIL_KEY = "client-detail";

export const useClientDetail = (id: number) => useData(CLIENT_DETAIL_KEY, () => fetchClientDetail(id), [id]);
