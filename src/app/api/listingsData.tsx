import { supabase } from "@/utils/supabase";

export const fetchActiveListingData = async (userId: string) => {
  try {
    const response = await supabase
      .from("ViewActiveItems")
      .select("*")
      .eq("seller_id", userId)
      .order("item_created_at", { ascending: false });

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching active listing data:", error);
    return null;
  }
};

export const fetchSoldListingData = async (userId: string) => {
  try {
    const response = await supabase
      .from("ViewSoldItems")
      .select("*")
      .eq("seller_id", userId)
      .order("sold_created_at", { ascending: false });

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching sold listing data:", error);
    return null;
  }
};
