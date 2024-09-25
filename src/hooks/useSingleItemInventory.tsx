import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";

const useSingleItemInventory = (itemId: number) => {
  const [item, setItem] = useState<any | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [errorItem, setErrorItem] = useState<string | null>(null);

  // Function to fetch the complete item data from the view
  const fetchFullActiveItemById = useCallback(async (itemId: number) => {
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
      console.error("Error fetching full item:", error);
      return null;
    }
  }, []);

  // Main function to fetch the item based on its ID
  const fetchItemById = useCallback(async () => {
    setLoadingItem(true);
    setErrorItem(null);

    try {
      const fullItem = await fetchFullActiveItemById(itemId);

      if (fullItem) {
        setItem(fullItem);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorItem(error.message || "Error fetching item");
      } else {
        setErrorItem("An unknown error occurred");
      }
    } finally {
      setLoadingItem(false);
    }
  }, [itemId, fetchFullActiveItemById]);

  // Subscribes to changes in the ItemInventory table
  const subscribeToItemChanges = useCallback(() => {
    const channel = supabase
      .channel("item_inventory_session")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ItemInventory",
          // filter: `item_id=eq.${itemId}`, // Subscribes to changes only for this specific item
        },
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          switch (eventType) {
            case "INSERT":
            case "UPDATE":
              // Re-fetch the complete item from the view if updated or inserted
              if (newRecord.item_id === itemId) {
                const fullItem = await fetchFullActiveItemById(
                  newRecord.item_id
                );
                if (fullItem) {
                  setItem(fullItem); // Update the state with the complete item
                }
              }
              break;

            case "DELETE":
              if (oldRecord.item_id === itemId) {
                setItem(null); // Clear the item if it's deleted
              }
              break;

            default:
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setErrorItem("Error subscribing to item changes");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, fetchFullActiveItemById]);

  useEffect(() => {
    fetchItemById();

    const unsubscribe = subscribeToItemChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchItemById, subscribeToItemChanges]);

  return { item, loadingItem, errorItem };
};

export default useSingleItemInventory;
