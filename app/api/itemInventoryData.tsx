import { supabase } from "@/utils/supabase/supabaseDb";

export const fetchItemInventoryData = async (userId: string, tag?: string) => {
  try {
    let query = supabase
      .from("ViewActiveItems")
      .select("*")
      .neq("seller_id", userId)
      .order("item_created_at", { ascending: false });

    if (tag) {
      query = query.eq("item_category", tag);
    }

    const response = await query;

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching item inventory data:", error);
    return null;
  }
};

export const fetchItemInventoryDataByItem = async (itemId: number) => {
  try {
    const response = await supabase
      .from("ViewActiveItems")
      .select("*")
      .eq("item_id", itemId)
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

export const insertItemInventoryData = async (data: any) => {
  try {
    const response = await supabase.from("ItemInventory").insert(data).select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error inserting item to inventory data:", error);
    return null;
  }
};
