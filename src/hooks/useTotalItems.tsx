import { useEffect, useCallback, useState } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

const useTotalItems = () => {
  const [totalBidItems, setTotalBidItems] = useState<number>(0);
  const [totalSellItems, setTotalSellItems] = useState<number>(0);
  const [totalSoldItems, setTotalSoldItems] = useState<number>(0);

  const fetchAndSubscribeItems = useCallback(async () => {
    try {
      let bidQuery = supabase
        .from("ItemInventory")
        .select("*", { count: "exact" })
        .eq("item_selling_type", "auction");

      const bidResponse: PostgrestResponse<any> = await bidQuery;

      if (bidResponse.error) {
        throw bidResponse.error;
      }

      setTotalBidItems(bidResponse.count || 0);

      let sellQuery = supabase
        .from("ItemInventory")
        .select("*", { count: "exact" })
        .eq("item_selling_type", "sell");

      const sellResponse: PostgrestResponse<any> = await sellQuery;

      if (sellResponse.error) {
        throw sellResponse.error;
      }

      setTotalSellItems(sellResponse.count || 0);

      let soldQuery = supabase
        .from("ItemInventory")
        .select("*", { count: "exact" })
        .eq("item_status", "sold");

      const soldResponse: PostgrestResponse<any> = await soldQuery;

      if (soldResponse.error) {
        throw soldResponse.error;
      }

      setTotalSoldItems(soldResponse.count || 0);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error fetching items:", err.message);
      } else {
        console.error("An unknown error occurred while fetching items");
      }
    }
  }, []);

  const subscribeToChanges = useCallback(() => {
    const channel = supabase
      .channel("items_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ItemInventory",
        },
        (payload: any) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE" ||
            payload.eventType === "DELETE"
          ) {
            fetchAndSubscribeItems();
          }
        }
      )
      .subscribe((status: any) => {
        if (status !== "SUBSCRIBED") {
          // console.error("Error subscribing to channel:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAndSubscribeItems]);

  useEffect(() => {
    fetchAndSubscribeItems();

    const unsubscribe = subscribeToChanges();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchAndSubscribeItems, subscribeToChanges]);

  return {
    totalBidItems,
    totalSellItems,
    totalSoldItems,
  };
};

export default useTotalItems;
