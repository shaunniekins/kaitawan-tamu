import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

// filter is used to fetch items based on their status
// userId is used to fetch items excluding those of a specific user
// tags can only be used when userId is present

const useItemInventory = (
  rowsPerPage: number,
  currentPage: number,
  filter: string, // filter is the status of the item
  isFilterEqual: boolean,
  userId?: string,
  isUserIdEqual?: boolean,
  tags?: string[]
) => {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [errorItems, setErrorItems] = useState<string | null>(null);

  const fetchActiveItems = useCallback(async () => {
    setLoadingItems(true);
    setErrorItems(null);

    const offset = (currentPage - 1) * rowsPerPage;

    try {
      let query = supabase
        .from("ViewFullItemInventory")
        .select("*")
        .order("item_created_at", { ascending: false });

      if (filter) {
        // Apply filter based on item status
        query = isFilterEqual
          ? query.eq("item_status", filter)
          : query.neq("item_status", filter);
      }

      if (userId) {
        // Apply userId filter based on isUserIdEqual
        query = isUserIdEqual
          ? query.eq("seller_id", userId)
          : query.neq("seller_id", userId);
      }
      if (tags && tags.length > 0) {
        query = query.in("item_category", tags);
      }

      const response: PostgrestResponse<any> = await query.range(
        offset,
        offset + rowsPerPage - 1
      );

      if (response.error) {
        throw response.error;
      }
      setItems(response.data || []);
      setTotalItems(response.count || 0);
    } catch (error) {
      if (error instanceof Error) {
        setErrorItems(error.message || "Error fetching items");
      } else {
        setErrorItems("An unknown error occurred");
      }
    } finally {
      setLoadingItems(false);
    }
  }, [
    filter,
    isFilterEqual,
    userId,
    isUserIdEqual,
    tags,
    currentPage,
    rowsPerPage,
  ]);

  const fetchFullActiveItems = async (itemId: number) => {
    if (!itemId) return;

    try {
      const { data, error } = await supabase
        .from("ViewFullItemInventory")
        .select("*")
        .eq("item_id", itemId)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching items:", error);
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
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Function to check if an item passes all filters
          const passesFilters = (item: any) => {
            const statusFilter = isFilterEqual
              ? item.item_status === filter
              : item.item_status !== filter;

            const userFilter = userId
              ? isUserIdEqual
                ? item.seller_id === userId
                : item.seller_id !== userId
              : true;

            const tagsFilter =
              tags && tags.length > 0
                ? tags.includes(item.item_category)
                : true;

            return statusFilter && userFilter && tagsFilter;
          };

          setItems((prev: any[]) => {
            switch (eventType) {
              case "INSERT":
                if (passesFilters(newRecord)) {
                  const offset = (currentPage - 1) * rowsPerPage;
                  const limit = offset + rowsPerPage;

                  // Check if the new record falls within the current page's range
                  if (prev.length < limit) {
                    fetchFullActiveItems(newRecord.item_id).then(
                      (fullActiveItem) => {
                        if (fullActiveItem) {
                          setItems((prevItems) =>
                            [...prevItems, fullActiveItem].slice(0, rowsPerPage)
                          );
                        }
                      }
                    );
                  }
                }
                return prev;

              case "UPDATE":
                fetchFullActiveItems(newRecord.item_id).then(
                  (fullActiveItem) => {
                    if (fullActiveItem) {
                      const updatedItems = prev
                        .map((item) =>
                          item.item_id === newRecord.item_id
                            ? passesFilters(newRecord)
                              ? fullActiveItem
                              : null // Remove if it doesn't match the filters
                            : item
                        )
                        .filter((item) => item !== null);

                      if (
                        passesFilters(newRecord) &&
                        !updatedItems.some(
                          (item) => item.item_id === newRecord.item_id
                        )
                      ) {
                        updatedItems.push(fullActiveItem);
                      }

                      setItems(updatedItems);
                    }
                  }
                );
                return prev;

              case "DELETE":
                return prev.filter(
                  (item) => item.item_id !== oldRecord.item_id
                );

              default:
                return prev;
            }
          });
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setErrorItems("Error subscribing to item changes");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    filter,
    isFilterEqual,
    userId,
    isUserIdEqual,
    tags,
    currentPage,
    rowsPerPage,
  ]);

  useEffect(() => {
    fetchActiveItems();

    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchActiveItems, subscribeToChanges]);

  return { items, loadingItems, totalItems, errorItems };
};

export default useItemInventory;
