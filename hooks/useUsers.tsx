import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase/supabaseDb";
import { PostgrestResponse } from "@supabase/supabase-js";

const useUsers = (filter: string) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);

    try {
      let query = supabase.from("Users").select("*").order("created_at");

      if (filter) {
        query = query.eq("status", filter);
      }

      const response = await query;

      if (response.error) {
        throw response.error;
      }
      setUsers(response.data || []);
    } catch (error) {
      if (error instanceof Error) {
        setErrorUsers(error.message || "Error fetching users");
      } else {
        setErrorUsers("An unknown error occurred");
      }
    } finally {
      setLoadingUsers(false);
    }
  }, [filter]);

  const subscribeToChanges = useCallback(() => {
    const channel = supabase
      .channel("users_session")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Users",
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setUsers((prev) => {
            switch (eventType) {
              case "INSERT":
                return [...prev, newRecord];
              case "UPDATE":
                const updatedUsers = prev
                  .map((user) => {
                    if (user.user_id === newRecord.user_id) {
                      // If the status matches the filter, update the user
                      if (newRecord.status === filter) {
                        return newRecord;
                      }
                      // If the status does not match, remove the user from the list
                      return null;
                    }
                    return user;
                  })
                  .filter((user) => user !== null); // Remove null values from the array

                // If the status matches the filter and the user is not in the list, add it
                if (
                  newRecord.status === filter &&
                  !updatedUsers.some(
                    (user) => user.user_id === newRecord.user_id
                  )
                ) {
                  updatedUsers.push(newRecord);
                }

                return updatedUsers;
              case "DELETE":
                return prev.filter((p) => p.user_id !== oldRecord.user_id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setErrorUsers("Error subscribing to user changes");
          console.error("Error subscribing to channel: ", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  useEffect(() => {
    fetchUsers();

    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchUsers, subscribeToChanges]);

  return { users, loadingUsers, errorUsers };
};

export default useUsers;
