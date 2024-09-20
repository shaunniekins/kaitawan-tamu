import { supabase } from "@/utils/supabase";

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
    const updates: { status: string; auth_user_id?: string } = {
      status: updatedStatus,
    };
    if (authId) {
      updates.auth_user_id = authId;
    }

    const response = await supabase
      .from("Users")
      .update(updates)
      .eq("user_id", userId);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error updating user data:", error);
    return null;
  }
};
