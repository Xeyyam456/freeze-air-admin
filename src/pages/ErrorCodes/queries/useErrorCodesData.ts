import { useData } from "@/lib/useData";
import { fetchErrorCodes } from "@/services/errorCodes/fetchErrorCodes";

export const ERROR_CODES_KEY = "error-codes";

export const useErrorCodesData = () => useData(ERROR_CODES_KEY, fetchErrorCodes);
