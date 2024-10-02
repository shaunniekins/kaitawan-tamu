import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

const useSellerUsers = (userId: string) => {
  const [sellerData, setSellerData] = useState<any[]>([]);
  const [loadingSeller, setLoadingSeller] = useState(true);
  const [errorSeller, setErrorSeller] = useState<string | null>(null);

  const fetchSeller = useCallback(async () => {
    if (!userId) return;

    try {
      let query = supabase
        .from("ViewMemberUsers")
        .select("*", { count: "exact" })
        .eq("id", userId)
        .single();

      const response: PostgrestResponse<any> = await query;

      if (response.error) {
        throw response.error;
      }
      setSellerData(response.data || []);
    } catch (error) {
      if (error instanceof Error) {
        setErrorSeller(error.message || "Error fetching users");
      } else {
        setErrorSeller("An unknown error occurred");
      }
    } finally {
      setLoadingSeller(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSeller();
  }, [fetchSeller]);

  return { sellerData, loadingSeller, errorSeller, fetchSeller };
};

export default useSellerUsers;
