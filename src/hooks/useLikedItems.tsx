import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

const useLikedItems = (likerId: string, itemId?: number) => {
  const [likedItems, setLikedItems] = useState<any[]>([]);
  const [loadingLikedItems, setLoadingLikedItems] = useState(true);
  const [totalLikedItems, setTotalLikedItems] = useState<number>(0);
  const [errorLikedItems, setErrorLikedItems] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!likerId) return;

    try {
      let query = supabase
        .from("ViewFullLikedItems")
        .select("*")
        .eq("liker_id", likerId)
        .order("created_at", { ascending: false });

      if (itemId) {
        query = query.eq("item_id", itemId);
      }

      const response: PostgrestResponse<any> = await query;

      if (response.error) {
        throw response.error;
      }
      setLikedItems(response.data || []);
      setTotalLikedItems(response.count || 0);
    } catch (error) {
      if (error instanceof Error) {
        setErrorLikedItems(error.message || "Error fetching likedItems");
      } else {
        setErrorLikedItems("An unknown error occurred");
      }
    } finally {
      setLoadingLikedItems(false);
    }
  }, [likerId, itemId]);

  const fetchFullActiveItem = async (likedId: number) => {
    if (!likedId) return null;

    try {
      const { data, error } = await supabase
        .from("ViewFullLikedItems")
        .select("*")
        .eq("liked_id", likedId)
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
      .channel("liked_items_session")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "LikedItems",
        },
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setLikedItems((prev: any[]) => {
            switch (eventType) {
              case "INSERT":
                fetchFullActiveItem(newRecord.liked_id).then(
                  (fullActiveItem) => {
                    if (fullActiveItem) {
                      setLikedItems((prevItems) => [
                        ...prevItems,
                        fullActiveItem,
                      ]);
                    }
                  }
                );
                return prev;

              case "UPDATE":
                fetchFullActiveItem(newRecord.liked_id).then(
                  (fullActiveItem) => {
                    if (fullActiveItem) {
                      const updatedItems = prev.map((item) =>
                        item.liked_id === newRecord.liked_id
                          ? fullActiveItem
                          : item
                      );
                      setLikedItems(updatedItems);
                    }
                  }
                );
                return prev;

              case "DELETE":
                return prev.filter(
                  (item) => item.liked_id !== oldRecord.liked_id
                );

              default:
                return prev;
            }
          });
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setErrorLikedItems("Error subscribing to item changes");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [likerId, itemId]);

  useEffect(() => {
    fetchItems();

    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe();
    };
  }, [fetchItems, subscribeToChanges]);

  return { likedItems, loadingLikedItems, totalLikedItems, errorLikedItems };
};

export default useLikedItems;
