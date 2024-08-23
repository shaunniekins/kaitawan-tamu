import { supabase } from "@/utils/supabase/supabaseDb";

// Admin
export const fetchPendingItemsInInventoryDataForAdmin = async (
  filter: string
) => {
  try {
    let query = supabase
      .from("ViewActiveItems")
      .select("*")
      // .eq("item_status", "pending")
      .order("item_created_at", { ascending: false });

    if (filter) {
      query = query.eq("item_status", filter);
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

export const updatePendingItemsInInventoryDataForAdmin = async (
  item_id: number,
  updatedStatus: string
) => {
  try {
    const response = await supabase
      .from("ItemInventory")
      .update({ item_status: updatedStatus })
      .eq("id", item_id);

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

export const fetchItemInventoryData = async (userId: string, tag?: string) => {
  try {
    let query = supabase
      .from("ViewActiveItems")
      .select("*")
      .neq("seller_id", userId)
      .eq("item_status", "approved")
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
