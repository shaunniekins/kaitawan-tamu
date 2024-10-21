import { supabase } from "@/utils/supabase";

export const checkerInProgressPurchaseItemByUser = async (itemId: number) => {
  try {
    const response = await supabase
      .from("ViewFullInProgressPurchasesTransactions")
      .select("*")
      .neq("progress_status", "cancelled") // Exclude cancelled purchases
      .eq("item_id", itemId);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching in progress purchases data:", error);
    return null;
  }
};

export const checkerPurchaseItemStatusByUser = async (itemId: number) => {
  try {
    const response = await supabase
      .from("ViewFullInProgressPurchasesTransactions")
      .select("progress_status, in_progress_id")
      .eq("item_id", itemId);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching purchase item status data:", error);
    return null;
  }
};

export const checkerBiddingItemByUser = async (
  itemId: number,
  userId: string
) => {
  try {
    const response = await supabase
      .from("BiddingTransactions")
      .select("*")
      .eq("item_id", itemId)
      .eq("bidder_id", userId);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching item inventory data by user:", error);
    return null;
  }
};
