import { supabase } from "@/utils/supabase";

export const insertLikedItem = async (newMessage: any) => {
  try {
    const response = await supabase
      .from("LikedItems")
      .insert(newMessage)
      .select();

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error: any) {
    console.error("Error inserting chat message:", error);
    return null;
  }
};

export const deleteLikedItem = async (likedId: any) => {
  try {
    const response = await supabase
      .from("LikedItems")
      .delete()
      .eq("liked_id", likedId);

    if (response.error) {
      throw response.error;
    }
    return response.data;
  } catch (error: any) {
    console.error("Error deleting chat message:", error);
    return null;
  }
};
