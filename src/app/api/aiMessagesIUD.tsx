import { supabase } from "@/utils/supabase";

// Insert a new chat message
export const insertAIMessage = async (newMessage: any) => {
  try {
    const response = await supabase
      .from("AIMessages")
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

// Delete a chat message
export const deleteAIMessage = async (userId: string) => {
  try {
    const response = await supabase
      .from("AIMessages")
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (response.error) {
      throw response.error;
    }
    return response.data;
  } catch (error: any) {
    console.error("Error deleting chat message:", error);
    return null;
  }
};
