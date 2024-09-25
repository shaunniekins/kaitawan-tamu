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

      // Extract unique item_list_id and count duplicates
      const itemCountMap = new Map<number, number>();
      let highestBidOfferLocal: any | null = null;
      const currentDate = new Date();

      auctionOffers.forEach((offer: any) => {
        const itemId = offer.item_id;
        const bidPrice = offer.bid_price;
        const bidDueDate = new Date(offer.bid_due);

        // Update highest bid offer if the bid is not past due
        if (
          bidDueDate >= currentDate &&
          (!highestBidOfferLocal || bidPrice > highestBidOfferLocal.bid_price)
        ) {
          highestBidOfferLocal = offer;
        }

        if (itemCountMap.has(itemId)) {
          itemCountMap.set(itemId, itemCountMap.get(itemId)! + 1);
        } else {
          itemCountMap.set(itemId, 1);
        }
      });

      const uniqueItemListIds = Array.from(itemCountMap.keys());

      // Set state with unique item_list_id and item counts
      setItemListIds(uniqueItemListIds);
      setItemCounts(itemCountMap);
      setHighestBidOffer(highestBidOfferLocal);

      // Fetch items based on unique item_list_id
      const itemsResponse = await fetchItemsBasedOnId(uniqueItemListIds);
      if (itemsResponse) {
        // Optionally, check if items are already in progress purchases
        const firstItem = itemsResponse.data[0]; // Assuming at least one item exists
        const response = await checkerInProgressPurchaseItemByUser(
          firstItem.item_id
        );

        if (response && response.data.length > 0) {
          // Handle if item is already in progress purchase
          return;
        } else {
          setItems(itemsResponse.data); // Set items in state
        }
      }

      setLoading(false);
    } catch (error: any) {
      setError(error.message || "Error fetching bidding transaction data");
      setLoading(false);
    }
  }, [userId]);

  const subscribeToBiddingTransactions = useCallback(() => {
    // Subscription to BiddingTransactions table
    const biddingChannel = supabase
      .channel("chat_sessions_bidding_transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "BiddingTransactions" },
        (payload) => {
          setAuctionOffers((prev) => {
            let updatedOffers = prev;

            if (payload.eventType === "INSERT") {
              updatedOffers = [...prev, payload.new];
            } else if (payload.eventType === "UPDATE") {
              updatedOffers = prev.map((offer) =>
                offer.bid_id === payload.new.bid_id ? payload.new : offer
              );
            } else if (payload.eventType === "DELETE") {
              updatedOffers = prev.filter(
                (offer) => offer.bid_id !== payload.old.bid_id
              );
            }

            // Sort updated offers by bid price and bid creation date
            return updatedOffers.sort((a, b) => {
              if (b.bid_price === a.bid_price) {
                return (
                  new Date(b.bid_created_at).getTime() -
                  new Date(a.bid_created_at).getTime()
                );
              }
              return b.bid_price - a.bid_price;
            });
          });
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setError("Error subscribing to bidding transactions");
        }
      });

    // Subscription to ItemInventory table for item updates
    const itemChannel = supabase
      .channel("item_inventory_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ItemInventory" },
        (payload) => {
          // Re-fetch items from ViewFullItemInventory when there's a change
          fetchItemsBasedOnId(itemListIds);
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setError("Error subscribing to item inventory");
        }
      });

    return () => {
      supabase.removeChannel(biddingChannel);
      supabase.removeChannel(itemChannel);
    };
  }, [itemListIds]);

  useEffect(() => {
    fetchBiddingTransactionDataPerUser();

    const unsubscribe = subscribeToBiddingTransactions();
    return () => {
      unsubscribe();
    };
  }, [userId]); // Only depend on userId to avoid infinite loop

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
