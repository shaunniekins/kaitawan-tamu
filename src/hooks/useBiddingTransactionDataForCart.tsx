import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";
import { fetchItemsBasedOnId } from "@/app/api/itemInventoryIUD";
import { checkerInProgressPurchaseItemByUser } from "@/app/api/checkers";

const useBiddingTransactionData = (userId: string) => {
  const [auctionOffers, setAuctionOffers] = useState<any[]>([]);
  const [highestBidOffer, setHighestBidOffer] = useState<any | null>(null);
  const [itemListIds, setItemListIds] = useState<number[]>([]);
  const [itemCounts, setItemCounts] = useState<Map<number, number>>(new Map());
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBiddingTransactionDataPerUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response: PostgrestResponse<any> = await supabase
        .from("ViewFullBiddingTransactions")
        .select("*")
        .eq("seller_id", userId)
        .order("item_created_at", { ascending: false });

      if (response.error) {
        throw response.error;
      }

      const auctionOffers = response.data ?? [];
      setAuctionOffers(auctionOffers);

      // Process auction offers
      const itemCountMap = new Map<number, number>();
      let highestBidOfferLocal: any | null = null;

      auctionOffers.forEach((offer: any) => {
        const itemId = offer.item_id;

        // Use the highest_bid_price field directly
        const highestBidPrice = offer.highest_bid_price;

        if (
          !highestBidOfferLocal ||
          highestBidPrice > highestBidOfferLocal.highest_bid_price
        ) {
          highestBidOfferLocal = offer;
        }

        itemCountMap.set(itemId, (itemCountMap.get(itemId) || 0) + 1);
      });

      const uniqueItemListIds = Array.from(itemCountMap.keys());

      setItemListIds(uniqueItemListIds);
      setItemCounts(itemCountMap);
      setHighestBidOffer(highestBidOfferLocal);

      // Fetch items based on unique item_list_id
      const itemsResponse = await fetchItemsBasedOnId(uniqueItemListIds);
      if (itemsResponse && itemsResponse.data.length > 0) {
        const firstItem = itemsResponse.data[0];
        const inProgressResponse = await checkerInProgressPurchaseItemByUser(
          firstItem.item_id
        );

        if (inProgressResponse && inProgressResponse.data.length > 0) {
          // Handle if item is already in progress purchase
          // console.log("Item is already in progress purchase");
        } else {
          setItems(itemsResponse.data);
        }
      }

      setLoading(false);
    } catch (error: any) {
      setError(error.message || "Error fetching bidding transaction data");
      setLoading(false);
    }
  }, [userId]);

  const subscribeToBiddingTransactions = useCallback(() => {
    const biddingChannel = supabase
      .channel("chat_sessions_bidding_transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "BiddingTransactions" },
        (payload) => {
          // console.log("Received bidding transaction update:", payload);
          fetchBiddingTransactionDataPerUser();
        }
      )
      .subscribe();

    const itemChannel = supabase
      .channel("item_inventory_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ItemInventory" },
        (payload) => {
          // console.log("Received item inventory update:", payload);
          fetchBiddingTransactionDataPerUser();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(biddingChannel);
      supabase.removeChannel(itemChannel);
    };
  }, [fetchBiddingTransactionDataPerUser]);

  useEffect(() => {
    fetchBiddingTransactionDataPerUser();
    const unsubscribe = subscribeToBiddingTransactions();

    return () => {
      unsubscribe();
    };
  }, [
    userId,
    fetchBiddingTransactionDataPerUser,
    subscribeToBiddingTransactions,
  ]);

  return {
    auctionOffers,
    highestBidOffer,
    itemListIds,
    itemCounts,
    items,
    loading,
    error,
  };
};

export default useBiddingTransactionData;
