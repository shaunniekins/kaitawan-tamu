import { supabase } from "@/utils/supabase/supabaseDb";

export const checkerInProgressPurchaseItemByUser = async (itemId: number) => {
  try {
    const response = await supabase
      .from("ViewFullInProgressPurchasesTransactions")
      .select("*")
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
export const fetchInProgressPurchasesByUser = async (userId: string) => {
  try {
    const response = await supabase
      .from("ViewFullInProgressPurchasesTransactions")
      .select("*")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    if (response.error) {
      throw response.error;
    }

    const dataWithLabels = response.data.map((item) => {
      const label = item.buyer_id === userId ? "buyer" : "seller";
      return { ...item, label };
    });

    // Sort the data to have "seller" labels first
    dataWithLabels.sort((a, b) => (a.label === "seller" ? -1 : 1));

    return dataWithLabels;
  } catch (error) {
    console.error("Error fetching in progress purchases data:", error);
    return null;
  }
};

export const insertInProgressPurchaseData = async (data: any) => {
  try {
    const response = await supabase
      .from("InProgressPurchases")
      .insert(data)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error inserting in progress purchases data:", error);
    return null;
  }
};
