import { supabaseAdmin } from "@/utils/supabase";

export const updateMemberUser = async (userId: string, status: string) => {
  try {
    let updateData: any = {};

    switch (status) {
      case "rejected":
        updateData = {
          raw_user_meta_data: {
            status: "rejected",
          },
        };
        break;
      case "suspended":
        updateData = {
          raw_user_meta_data: {
            status: "rejected",
          },
          email_confirmed_at: null,
        };
        break;
      case "approved":
      case "reapproved":
        updateData = {
          raw_user_meta_data: {
            status: "approved",
          },
          email_confirmed_at: new Date().toISOString(),
        };
        break;
      default:
        throw new Error("Invalid status");
    }

    const response = await supabaseAdmin
      .from("auth.users")
      .update(updateData)
      .eq("id", userId)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error updating user data:", error);
    return null;
  }
};
