import { supabase } from "@/utils/supabase/supabaseDb";

// Insert a new chat message
export const insertChatMessage = async (newMessage: any) => {
  try {
    const response = await supabase
      .from("ChatMessages")
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

// Update an existing chat message
export const updateChatMessage = async (
  chatMessageId: number,
  updatedMessage: any
) => {
  try {
    const response = await supabase
      .from("ChatMessages")
      .update(updatedMessage)
      .eq("chat_message_id", chatMessageId)
      .select();

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error: any) {
    console.error("Error updating chat message:", error);
    return null;
  }
};

// Delete a chat message
export const deleteChatMessage = async (chatMessageId: any) => {
  try {
    const response = await supabase
      .from("ChatMessages")
      .delete()
      .eq("chat_message_id", chatMessageId);

    if (response.error) {
      throw response.error;
    }
    return response.data;
  } catch (error: any) {
    console.error("Error deleting chat message:", error);
    return null;
  }
};
