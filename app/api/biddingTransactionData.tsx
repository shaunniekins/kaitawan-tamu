import { supabase } from "@/utils/supabase/supabaseDb";

export const fetchBiddingTransactionDataPerItem = async (itemId: number) => {
  try {
    const response = await supabase
      .from("ViewFullBiddingTransactions")
      .select("*")
      .eq("item_list_id", itemId)
      .order("bid_price", { ascending: false }) // Highest bid price first
      .order("bid_created_at", { ascending: false }); // Most recent bid within the same price

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching item inventory data:", error);
    return null;
  }
};

export const fetchBiddingTransactionDataPerUser = async (userId: string) => {
  try {
    const response = await supabase
      .from("ViewFullBiddingTransactions")
      .select("*")
      .eq("seller_id", userId)
      .order("item_created_at", { ascending: false });

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching item inventory data:", error);
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
      .eq("item_list_id", itemId)
      .eq("bidder_id", userId);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching item inventory data:", error);
    return null;
  }
};

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
