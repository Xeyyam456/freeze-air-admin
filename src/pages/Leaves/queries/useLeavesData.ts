import { useData } from "@/lib/useData";
import { fetchLeaves } from "@/services/leaves/fetchLeaves";

export const LEAVES_KEY = "leaves";

export const useLeavesData = () => useData(LEAVES_KEY, fetchLeaves);
