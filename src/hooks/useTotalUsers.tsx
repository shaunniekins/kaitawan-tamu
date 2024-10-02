import { useEffect, useCallback, useState } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

const useTotalUsers = (filter?: string) => {
  const [totalMembers, setTotalMembers] = useState<number>(0);

  const fetchAndSubscribeUsers = useCallback(async () => {
    try {
      // Fetch total members
      let query = supabase
        .from("ViewMemberUsers")
        .select("*", { count: "exact" })
        .eq("role", "member");

      if (filter) {
        query = query.eq("account_status", filter);
      }

      const response: PostgrestResponse<any> = await query;

      if (response.error) {
        throw response.error;
      }

      setTotalMembers(response.count || 0);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error fetching users:", err.message);
      } else {
        console.error("An unknown error occurred while fetching users");
      }
    }
  }, [filter]);

  const subscribeToChanges = useCallback(() => {
    const channel = supabase
      .channel("member_users_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "auth",
          table: "users",
        },
        (payload: any) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE" ||
            payload.eventType === "DELETE"
          ) {
            fetchAndSubscribeUsers();
          }
        }
      )
      .subscribe((status: any) => {
        if (status !== "SUBSCRIBED") {
          // console.error("Error subscribing to channel:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAndSubscribeUsers]);

  useEffect(() => {
    fetchAndSubscribeUsers();

    const unsubscribe = subscribeToChanges();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchAndSubscribeUsers, subscribeToChanges]);

  return {
    totalMembers,
  };
};

export default useTotalUsers;
