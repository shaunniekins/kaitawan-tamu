import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

const useUserYearLevel = () => {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      let query = supabase
        .from("ViewMemberUsers")
        .select("*", { count: "exact" });

      const response: PostgrestResponse<any> = await query;

      if (response.error) {
        throw response.error;
      }
      setUsersData(response.data || []);
      setTotalUsers(response.count || 0);
    } catch (error) {
      if (error instanceof Error) {
        setErrorUsers(error.message || "Error fetching users");
      } else {
        setErrorUsers("An unknown error occurred");
      }
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const subscribeToChanges = useCallback(() => {
    const channel = supabase
      .channel("users_session")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "auth",
          table: "users",
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setUsersData((prev) => {
            switch (eventType) {
              case "INSERT":
                return [...prev, newRecord];
              case "UPDATE":
                return prev.map((user) =>
                  user.id === newRecord.id ? newRecord : user
                );
              case "DELETE":
                return prev.filter((p) => p.id !== oldRecord.id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setErrorUsers("Error subscribing to user changes");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchUsers();

    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchUsers, subscribeToChanges]);

  return { usersData, loadingUsers, totalUsers, errorUsers, fetchUsers };
};

export default useUserYearLevel;
