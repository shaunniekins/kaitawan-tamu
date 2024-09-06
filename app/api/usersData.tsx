import { supabase } from "@/utils/supabase/supabaseDb";

// Admin
export const fetchUsersDataForAdmin = async (filter: string) => {
  try {
    let query = supabase.from("Users").select("*").order("created_at");

    if (filter) {
      query = query.eq("status", filter);
    }

    const response = await query;

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const insertNewUser = async (data: any) => {
  try {
    const response = await supabase.from("Users").insert(data).select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error adding new user data:", error);
    return null;
  }
};

export const updateNewUser = async (
  userId: number,
  updatedStatus: string,
  authId?: string
) => {
  try {
    const updates: { status: string; user_id?: string } = {
      status: updatedStatus,
    };
    if (authId) {
      updates.user_id = authId;
    }

    const response = await supabase
      .from("Users")
      .update(updates)
      .eq("id", userId);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error updating user data:", error);
    return null;
  }
};
