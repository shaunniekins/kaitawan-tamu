import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

const useUsers = (rowsPerPage: number, currentPage: number, filter: string) => {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!filter) return;

    const action =
      filter === "approved" || filter === "reapproved" ? "active" : filter;

    const offset = (currentPage - 1) * rowsPerPage;

    try {
      let query = supabase
        .from("ViewMemberUsers")
        .select("*", { count: "exact" })
        .range(offset, offset + rowsPerPage - 1);

      if (action) {
        query = query.eq("account_status", action);
      }

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
  }, [filter, currentPage, rowsPerPage]);

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

          const action =
            filter === "approved" || filter === "reapproved"
              ? "active"
              : filter;

          setUsersData((prev) => {
            switch (eventType) {
              case "INSERT":
                if (newRecord.account_status === action) {
                  const offset = (currentPage - 1) * rowsPerPage;
                  const limit = offset + rowsPerPage;

                  // Check if the new record falls within the current page's range
                  if (prev.length < limit) {
                    return [...prev, newRecord].slice(0, rowsPerPage);
                  }
                }
                return prev;
              case "UPDATE":
                const updatedUsers = prev
                  .map((user) => {
                    if (user.id === newRecord.id) {
                      // If the account_status matches the filter, update the user
                      if (newRecord.account_status === action) {
                        return newRecord;
                      }
                      // If the status does not match, remove the user from the list
                      return null;
                    }
                    return user;
                  })
                  .filter((user) => user !== null); // Remove null values from the array

                // If the account_status matches the filter and the user is not in the list, add it
                if (
                  newRecord.account_status === action &&
                  !updatedUsers.some((user) => user.id === newRecord.id)
                ) {
                  updatedUsers.push(newRecord);
                }

                return updatedUsers;
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
          // console.error("Error subscribing to channel: ", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, currentPage, rowsPerPage]);

  useEffect(() => {
    fetchUsers();

    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchUsers, subscribeToChanges]);

  return { usersData, loadingUsers, totalUsers, errorUsers, fetchUsers };
};

export default useUsers;
