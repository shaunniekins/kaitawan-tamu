import { supabase } from "@/utils/supabase";

export const fetchItemsBasedOnId = async (itemIds: number[]) => {
  if (!itemIds || itemIds.length === 0) return;

  // Filter out invalid IDs
  const validItemIds = itemIds.filter(
    (id) => typeof id === "number" && !isNaN(id)
  );

  if (validItemIds.length === 0) {
    console.error("No valid item IDs provided.");
    return;
  }

  // console.log("Fetching items based on IDs:", validItemIds);

  try {
    const response = await supabase
      .from("ViewFullItemInventory")
      .select("*")
      // .eq("item_status", "approved")
      .in("item_id", validItemIds)
      .order("item_created_at", { ascending: false });

    if (response.error) {
      throw response.error;
    }
    // console.log("Items response here in api:", response.data);
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

export const updateItemInventoryData = async (data: any, itemId: number) => {
  try {
    const response = await supabase
      .from("ItemInventory")
      .update(data)
      .eq("item_id", itemId)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error updating item inventory data:", error);
    return null;
  }
};

export const deleteItemInventoryData = async (itemId: number) => {
  try {
    const response = await supabase
      .from("ItemInventory")
      .delete()
      .eq("item_id", itemId)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error deleting item inventory data:", error);
    return null;
  }
};
