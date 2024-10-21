import { supabase } from "@/utils/supabase";

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

export const updateInProgressPurchaseData = async (
  data: any,
  inProgressId: number
) => {
  try {
    const response = await supabase
      .from("InProgressPurchases")
      .update(data)
      .eq("in_progress_id", inProgressId)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error updating in progress purchases data:", error);
    return null;
  }
};

export const deleteInProgressPurchaseData = async (inProgressId: number) => {
  try {
    const response = await supabase
      .from("InProgressPurchases")
      .delete()
      .eq("in_progress_id", inProgressId)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error deleting in progress purchases data:", error);
    return null;
  }
};
