import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase/supabaseDb";
import { PostgrestResponse } from "@supabase/supabase-js";

// not used, the basis are complicated

const userInProgressPurchases = (itemId?: string, userId?: string) => {
  const [inProgressPurchases, setInProgressPurchases] = useState<any[]>([]);
  const [loadingInProgressPurchases, setLoadingInProgressPurchases] =
    useState(true);
  const [errorInProgressPurchases, setErrorInProgressPurchases] = useState<
    string | null
  >(null);

  const fetchActiveItems = useCallback(async () => {
    setLoadingInProgressPurchases(true);
    setErrorInProgressPurchases(null);

    try {
      if (!itemId && !userId) {
        throw new Error("At least one of itemId or userId must be provided");
      }

      let query = supabase
        .from("ViewFullInProgressPurchasesTransactions")
        .select("*");

      if (itemId) {
        query = query.eq("item_id", itemId);
      } else if (userId) {
        query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
      }

      const response = await query;

      if (response.error) {
        throw response.error;
      }

      if (userId) {
        const dataWithLabels = response.data.map((item) => {
          const label = item.buyer_id === userId ? "buyer" : "seller";
          return { ...item, label };
        });

        // Sort the data to have "seller" labels first
        dataWithLabels.sort((a, b) => (a.label === "seller" ? -1 : 1));

        setInProgressPurchases(dataWithLabels);
      } else {
        setInProgressPurchases(response.data || []);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorInProgressPurchases(
          error.message || "Error fetching inProgressPurchases"
        );
      } else {
        setErrorInProgressPurchases("An unknown error occurred");
      }
    } finally {
      setLoadingInProgressPurchases(false);
    }
  }, [itemId, userId]);

  const fetchFullActiveItems = async (inProgressId: number) => {
    if (!inProgressId) return;

    try {
      const { data, error } = await supabase
        .from("ViewFullInProgressPurchasesTransactions")
        .select("*")
        .eq("in_progress_id", inProgressId)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching inProgressPurchases:", error);
      return null;
    }
  };

  const subscribeToChanges = useCallback(() => {
    const channel = supabase
      .channel("in_progress_purchases_session")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "InProgressPurchases",
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setInProgressPurchases((prev: any[]) => {
            switch (eventType) {
              case "INSERT":
                if (
                  (itemId && newRecord.item_id === itemId) ||
                  (userId &&
                    (newRecord.buyer_id === userId ||
                      newRecord.seller_id === userId))
                ) {
                  fetchFullActiveItems(newRecord.in_progress_id).then(
                    (fullActiveItem) => {
                      if (fullActiveItem) {
                        setInProgressPurchases([...prev, fullActiveItem]);
                      }
                    }
                  );
                }
                return prev;

              case "UPDATE":
                fetchFullActiveItems(newRecord.in_progress_id).then(
                  (fullActiveItem) => {
                    if (fullActiveItem) {
                      const updatedItems = prev
                        .map((item) => {
                          if (
                            item.in_progress_id === newRecord.in_progress_id
                          ) {
                            if (
                              (itemId && newRecord.item_id === itemId) ||
                              (userId &&
                                (newRecord.buyer_id === userId ||
                                  newRecord.seller_id === userId))
                            ) {
                              return fullActiveItem;
                            }
                            return null;
                          }
                          return item;
                        })
                        .filter((item) => item !== null);

                      setInProgressPurchases(updatedItems);
                    }
                  }
                );
                return prev;

              case "DELETE":
                return prev.filter(
                  (p) => p.in_progress_id !== oldRecord.in_progress_id
                );

              default:
                return prev;
            }
          });
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setErrorInProgressPurchases("Error subscribing to item changes");
          console.error("Error subscribing to channel: ", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, userId]);

  useEffect(() => {
    fetchActiveItems();

    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchActiveItems, subscribeToChanges]);

  return {
    inProgressPurchases,
    loadingInProgressPurchases,
    errorInProgressPurchases,
  };
};

export default userInProgressPurchases;
