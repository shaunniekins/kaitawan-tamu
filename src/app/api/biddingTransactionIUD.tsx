import { supabase } from "@/utils/supabase";

export const insertBiddingTransactionData = async (data: any) => {
  try {
    const response = await supabase
      .from("BiddingTransactions")
      .insert(data)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error inserting bidding transaction data:", error);
    return null;
  }
};

export const updateBiddingTransactionData = async (
  data: any,
  bidId: number
) => {
  try {
    const response = await supabase
      .from("BiddingTransactions")
      .update(data)
      .eq("bid_id", bidId)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error updating bidding transaction data:", error);
    return null;
  }
};
