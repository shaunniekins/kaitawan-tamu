import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import debounce from "lodash.debounce";

const useInProgressPurchases = (userId: string) => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [errorPurchases, setErrorPurchases] = useState<string | null>(null);

  // Fetch the in-progress purchases for the current user
  const fetchInProgressPurchasesByUser = useCallback(
    debounce(async () => {
      if (!userId) {
        setErrorPurchases("User ID is undefined");
        setLoadingPurchases(false);
        return;
      }

      setLoadingPurchases(true);
      setErrorPurchases(null);

      try {
        const response = await supabase
          .from("ViewFullInProgressPurchasesTransactions")
          .select("*")
          .neq("progress_status", "cancelled") // Exclude cancelled purchases
          //   .neq("progress_status", "sold") // Exclude completed purchases
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

        if (response.error) {
          throw response.error;
        }

        const dataWithLabels = response.data.map((item) => {
          const label = item.buyer_id === userId ? "buyer" : "seller";
          return { ...item, label };
        });

        // Sort data so "seller" labels come first
        dataWithLabels.sort((a, b) => (a.label === "seller" ? -1 : 1));

        setPurchases(dataWithLabels);
      } catch (error) {
        setErrorPurchases("Error fetching in-progress purchases");
        setPurchases([]);
      } finally {
        setLoadingPurchases(false);
      }
    }, 300), // Debounce for 300ms
    [userId]
  );

  const fetchFullInProgressPurchaseDetails = async (itemId: number) => {
    if (!itemId) return null;

    try {
      const { data, error } = await supabase
        .from("InProgressPurchases")
        .select("*")
        .eq("item_id", itemId)
        .single();

      if (error) {
        throw error;
      }

      //   console.log("Full in-progress purchase details:", data);
      return data;
    } catch (error) {
      console.error("Error fetching full in-progress purchase details:", error);
      return null;
    }
  };

  // Real-time subscription to the `InProgressPurchases` table
  const subscribeToChanges = useCallback(() => {
    const channel = supabase
      .channel("chat_sessions_in_progress_purchases")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "InProgressPurchases",
        },
        async (payload) => {
          const { eventType, new: newPurchase, old: oldPurchase } = payload;

          setPurchases((prev) => {
            switch (eventType) {
              case "INSERT":
                fetchFullInProgressPurchaseDetails(newPurchase.item_id).then(
                  (fullPurchase) => {
                    if (fullPurchase) {
                      setPurchases((prev) => [...prev, fullPurchase]);
                    }
                  }
                );
                return prev;
              case "UPDATE":
                return prev.map((purchase) =>
                  purchase.item_id === newPurchase.item_id
                    ? newPurchase
                    : purchase
                );
              case "DELETE":
                return prev.filter(
                  (purchase) => purchase.item_id !== oldPurchase.item_id
                );
              default:
                return prev;
            }
          });
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setErrorPurchases("Error subscribing to purchases");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFullInProgressPurchaseDetails]);

  useEffect(() => {
    fetchInProgressPurchasesByUser();

    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchInProgressPurchasesByUser, subscribeToChanges]);

  return { purchases, loadingPurchases, errorPurchases };
};

export default useInProgressPurchases;
