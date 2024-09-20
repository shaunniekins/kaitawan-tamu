import { supabase } from "@/utils/supabase";

export const updatePendingItemsInInventoryDataForAdmin = async (
  item_id: number,
  updatedStatus: string
) => {
  try {
    const response = await supabase
      .from("ItemInventory")
      .update({ item_status: updatedStatus })
      .eq("item_id", item_id);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error updating item status:", error);
    return null;
  }
};

// others

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

export const fetchItemsBasedOnId = async (itemIds: number[]) => {
  try {
    const response = await supabase
      .from("ViewActiveItems")
      .select("*")
      .in("item_id", itemIds)
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
