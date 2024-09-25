import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";

const useSingleInProgressPurchase = (itemId: number) => {
  const [itemInProgress, setItemInProgress] = useState<any | null>(null);
  const [loadingItemInProgress, setLoadingItemInProgress] = useState(true);
  const [errorItemInProgress, setErrorItemInProgress] = useState<string | null>(
    null
  );

  // Function to fetch the complete in-progress purchase data from the view
  const fetchFullInProgressPurchaseById = useCallback(
    async (itemId: number) => {
      if (!itemId) return null;

      try {
        const { data, error } = await supabase
          .from("ViewFullInProgressPurchasesTransactions")
          .select("*")
          .eq("item_id", itemId)
          .neq("progress_status", "cancelled") // Exclude cancelled purchases
          .maybeSingle(); // Use maybeSingle() instead of single()

        if (error) {
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Error fetching full in-progress purchase:", error);
        return null;
      }
    },
    []
  );

  // Main function to fetch the in-progress purchase based on its ID
  const fetchItemById = useCallback(async () => {
    setLoadingItemInProgress(true);
    setErrorItemInProgress(null);

    try {
      const fullItem = await fetchFullInProgressPurchaseById(itemId);

      if (fullItem) {
        setItemInProgress(fullItem);
      } else {
        setItemInProgress(null); // Handle case where no data is returned
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorItemInProgress(
          error.message || "Error fetching in-progress purchase"
        );
      } else {
        setErrorItemInProgress("An unknown error occurred");
      }
    } finally {
      setLoadingItemInProgress(false);
    }
  }, [itemId, fetchFullInProgressPurchaseById]);

  // Subscribes to changes in the InProgressPurchases table
  const subscribeToItemChanges = useCallback(() => {
    const channel = supabase
      .channel("in_progress_purchases_session")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "InProgressPurchases",
          //   filter: `item_id=eq.${itemId}`, // Subscribes to changes only for this specific item
        },
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          switch (eventType) {
            case "INSERT":
            case "UPDATE":
              // Re-fetch the complete item from the view if updated or inserted
              if (newRecord.item_id === itemId) {
                const fullItem = await fetchFullInProgressPurchaseById(
                  newRecord.item_id
                );
                if (fullItem) {
                  setItemInProgress(fullItem); // Update the state with the complete item
                } else {
                  setItemInProgress(null); // Handle case where no data is returned
                }
              }
              break;

            case "DELETE":
              if (!newRecord || oldRecord.in_progress_id !== newRecord) {
                setItemInProgress(null); // Clear the state
              }
              break;

            default:
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setErrorItemInProgress(
            "Error subscribing to in-progress purchase changes"
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, fetchFullInProgressPurchaseById]);

  useEffect(() => {
    fetchItemById();

    const unsubscribe = subscribeToItemChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchItemById, subscribeToItemChanges]);

  return { itemInProgress, loadingItemInProgress, errorItemInProgress };
};

export default useSingleInProgressPurchase;