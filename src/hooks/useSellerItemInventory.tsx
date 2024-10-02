import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

const useSellerItemInventory = (sellerId: string) => {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [errorItems, setErrorItems] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!sellerId) return;

    try {
      let query = supabase
        .from("ViewFullItemInventory")
        .select("*")
        .eq("seller_id", sellerId)
        .order("item_created_at", { ascending: false });

      const response: PostgrestResponse<any> = await query;

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
  }, [sellerId]);

  const fetchFullActiveItem = async (itemId: number) => {
    if (!itemId) return null;

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
      console.error("Error fetching item:", error);
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

          setItems((prev: any[]) => {
            switch (eventType) {
              case "INSERT":
                fetchFullActiveItem(newRecord.item_id).then(
                  (fullActiveItem) => {
                    if (fullActiveItem) {
                      setItems((prevItems) => [...prevItems, fullActiveItem]);
                    }
                  }
                );
                return prev;

              case "UPDATE":
                fetchFullActiveItem(newRecord.item_id).then(
                  (fullActiveItem) => {
                    if (fullActiveItem) {
                      const updatedItems = prev.map((item) =>
                        item.item_id === newRecord.item_id
                          ? fullActiveItem
                          : item
                      );
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
  }, [sellerId]);

  useEffect(() => {
    fetchItems();

    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchItems, subscribeToChanges]);

  return { items, loadingItems, totalItems, errorItems };
};

export default useSellerItemInventory;
