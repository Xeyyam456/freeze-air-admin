import { useData } from "@/lib/useData";
import { fetchRequests } from "@/services/requests/fetchRequests";

export const REQUESTS_KEY = "contact-requests";

export const useRequestsData = () => useData(REQUESTS_KEY, fetchRequests);
