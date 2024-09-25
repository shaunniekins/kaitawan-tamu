import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

const useBiddingTransactions = (itemId: number, itemSellingType: string) => {
  const [bids, setBids] = useState<any[]>([]);
  const [loadingBids, setLoadingBids] = useState(true);
  const [errorBids, setErrorBids] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    if (!itemId) return;
    if (itemSellingType !== "auction") return;

    setLoadingBids(true);
    setErrorBids(null);

    try {
      const response: PostgrestResponse<any> = await supabase
        .from("ViewFullBiddingTransactions")
        .select("*")
        .eq("item_id", itemId)
        .order("bid_due", { ascending: false }) // Sort by due date first
        .order("bid_price", { ascending: false }) // Highest bid price first
        .order("bid_created_at", { ascending: true }); // Oldest bid within the same price

      if (response.error) {
        throw response.error;
      }

      setBids(response.data || []);
    } catch (error) {
      if (error instanceof Error) {
        setErrorBids(error.message || "Error fetching bids");
      } else {
        setErrorBids("An unknown error occurred");
      }
    } finally {
      setLoadingBids(false);
    }
  }, [itemId, itemSellingType]);

  const fetchFullBidDetails = async (bidId: number) => {
    if (!bidId) return null;

    try {
      const { data, error } = await supabase
        .from("ViewFullBiddingTransactions")
        .select("*")
        .eq("bid_id", bidId)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching full bid details:", error);
      return null;
    }
  };

  const subscribeToBiddingChanges = useCallback(() => {
    if (itemSellingType !== "auction") return;

    const channel = supabase
      .channel("bidding_transactions_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "BiddingTransactions",
        },
        async (payload) => {
          const { eventType, new: newBid, old: oldBid } = payload;

          setBids((prevBids: any[]) => {
            switch (eventType) {
              case "INSERT":
                fetchFullBidDetails(newBid.bid_id).then((fullBid) => {
                  if (fullBid) {
                    setBids([fullBid, ...prevBids]);
                  }
                });
                return prevBids;

              case "UPDATE":
                fetchFullBidDetails(newBid.bid_id).then((updatedBid) => {
                  if (updatedBid) {
                    const updatedBids = prevBids.map((bid) =>
                      bid.bid_id === newBid.bid_id ? updatedBid : bid
                    );
                    setBids(updatedBids);
                  }
                });
                return prevBids;

              case "DELETE":
                return prevBids.filter((bid) => bid.bid_id !== oldBid.bid_id);

              default:
                return prevBids;
            }
          });
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          setErrorBids("Error subscribing to bid changes");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, itemSellingType]);

  useEffect(() => {
    fetchBids();

    const unsubscribe = subscribeToBiddingChanges();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchBids, subscribeToBiddingChanges]);

  return { bids, loadingBids, errorBids };
};

export default useBiddingTransactions;
