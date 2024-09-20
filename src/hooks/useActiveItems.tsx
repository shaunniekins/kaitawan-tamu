import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

// filter and userId cannot be used together because they represent mutually exclusive ways to fetch active items.
// filter is used to fetch items based on their status, while userId is used to fetch items excluding those of a specific user.
// Allowing both would create conflicting query parameters and lead to ambiguous results.
// tags can only be used when userId is present.

// the filtering used by the admin, where the filter is the status of the item
// the filtering used by the user, where the filter is the user ID (exploring items [explore page])

const useActiveItems = (filter?: string, userId?: string, tags?: string[]) => {
  const [activeItems, setActiveItems] = useState<any[]>([]);
  const [loadingActiveItems, setLoadingItems] = useState(true);
  const [errorActiveItems, setErrorItems] = useState<string | null>(null);

  const fetchActiveItems = useCallback(async () => {
    setLoadingItems(true);
    setErrorItems(null);

    try {
      if (!filter && !userId) {
        throw new Error("At least one of filter or userId must be provided");
      }

      if (filter && userId) {
        throw new Error("Filter and userId cannot be present at the same time");
      }

      let query = supabase
        .from("ViewActiveItems")
        .select("*")
        .order("item_created_at", { ascending: false });

      if (filter) {
        // Admin-based filtering
        query = query.eq("item_status", filter);
      } else if (userId) {
        // User-based filtering (excluding their items, including tags if applicable)
        query = query.neq("seller_id", userId).eq("item_status", "approved");

        if (tags && tags.length > 0) {
          query = query.in("item_category", tags);
        }
      }

      const response = await query;

      if (response.error) {
        throw response.error;
      }
      setActiveItems(response.data || []);
    } catch (error) {
      if (error instanceof Error) {
        setErrorItems(error.message || "Error fetching activeItems");
      } else {
        setErrorItems("An unknown error occurred");
      }
    } finally {
      setLoadingItems(false);
    }
  }, [filter, userId, tags]);

  const fetchFullActiveItems = async (itemId: number) => {
    if (!itemId) return;

    try {
      const { data, error } = await supabase
        .from("ViewActiveItems")
        .select("*")
        .eq("item_id", itemId)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching activeItems:", error);
      return null;
    }
  };

  const subscribeToChanges = useCallback(() => {
    const channel = supabase
      .channel("active_items_session")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ItemInventory",
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setActiveItems((prev: any[]) => {
            switch (eventType) {
              case "INSERT":
                if (
                  (filter && newRecord.item_status === filter) ||
                  (userId &&
                    newRecord.item_status === "approved" &&
                    newRecord.seller_id !== userId)
                ) {
                  fetchFullActiveItems(newRecord.item_id).then(
                    (fullActiveItem) => {
                      if (fullActiveItem) {
                        setActiveItems([...prev, fullActiveItem]);
                      }
                    }
                  );
                }
                return prev;

              case "UPDATE":
                fetchFullActiveItems(newRecord.item_id).then(
                  (fullActiveItem) => {
                    if (fullActiveItem) {
                      const updatedItems = prev
                        .map((item) => {
                          if (item.item_id === newRecord.item_id) {
                            if (
                              (filter && newRecord.item_status === filter) ||
                              (userId &&
                                newRecord.item_status === "approved" &&
                                newRecord.seller_id !== userId)
                            ) {
                              return fullActiveItem;
                            }
                            return null;
                          }
                          return item;
                        })
                        .filter((item) => item !== null);

                      if (
                        ((filter && newRecord.item_status === filter) ||
                          (userId &&
                            newRecord.item_status === "approved" &&
                            newRecord.seller_id !== userId)) &&
                        !updatedItems.some(
                          (item) => item.item_id === newRecord.item_id
                        )
                      ) {
                        updatedItems.push(fullActiveItem);
                      }

                      setActiveItems(updatedItems);
                    }
                  }
                );
                return prev;

              case "DELETE":
                return prev.filter((p) => p.item_id !== oldRecord.item_id);

              default:
                return prev;
            }
          });
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setErrorItems("Error subscribing to item changes");
          console.error("Error subscribing to channel: ", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, userId]);

  useEffect(() => {
    fetchActiveItems();

    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchActiveItems, subscribeToChanges]);

  return { activeItems, loadingActiveItems, errorActiveItems };
};

export default useActiveItems;
