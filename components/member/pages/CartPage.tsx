// components/admin/pages/CartPage.tsx

"use client";

import CartHeader from "../headers/CartHeader";
import { sellMockupData } from "@/app/api/sell";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardBody,
  CardFooter,
  Avatar,
  Checkbox,
  Button,
  Spinner,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { fetchBiddingTransactionDataPerUser } from "@/app/api/biddingTransactionData";
import { fetchItemsBasedOnId } from "@/app/api/itemInventoryData";
import {
  checkerInProgressPurchaseItemByUser,
  fetchInProgressPurchasesByUser,
  insertInProgressPurchaseData,
} from "@/app/api/inProgressPurchasesData";
import ExploreHeader from "../headers/ExploreHeader";

const CartPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [auctionOffers, setAuctionOffers] = useState<any[]>([]);
  const [itemListIds, setItemListIds] = useState<number[]>([]);
  const [itemCounts, setItemCounts] = useState<Map<number, number>>(new Map());
  const [highestBidOffer, setHighestBidOffer] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }, [supabase]);

  // bidding data fetch
  const memoizedFetchBiddingTransactionDataPerItem = useCallback(async () => {
    if (!user?.id) {
      console.error("User ID is undefined");
      return;
    }

    try {
      const response = await fetchBiddingTransactionDataPerUser(user.id);
      if (response?.error) {
        console.error(response.error);
      } else {
        const auctionOffers = response?.data ?? [];
        setAuctionOffers(auctionOffers);

        // Extract unique item_list_id and count duplicates
        const itemCountMap = new Map();
        let highestBidOfferLocal: any | null = null;

        auctionOffers.forEach((offer) => {
          const itemId = offer.item_list_id;
          const bidPrice = offer.bid_price;

          // Update highest bid offer
          if (
            !highestBidOfferLocal ||
            bidPrice > highestBidOfferLocal.bid_price
          ) {
            highestBidOfferLocal = offer;
          }

          if (itemCountMap.has(itemId)) {
            itemCountMap.set(itemId, itemCountMap.get(itemId) + 1);
          } else {
            itemCountMap.set(itemId, 1);
          }
        });

        const uniqueItemListIds = Array.from(itemCountMap.keys());

        // Set state with unique item_list_id and item counts
        setItemListIds(uniqueItemListIds);
        setItemCounts(itemCountMap);

        // Fetch items based on unique item_list_id
        const itemsResponse = await fetchItemsBasedOnId(uniqueItemListIds);
        if (itemsResponse) {
          const response = await checkerInProgressPurchaseItemByUser(
            itemsResponse.data[0].item_id
          );

          if (response && response.data.length > 0) {
            return;
          } else {
            setItems(itemsResponse.data);
          }
        }

        // Log or use the highest bid offer
        // console.log("Highest Bid Offer:", highestBidOffer);

        // const isExists = checkerInProgressPurchaseItemByUser(
        //   highestBidOfferLocal.in_progress_id
        // );
        // !isExists &&
        setHighestBidOffer(highestBidOfferLocal);

        // return;

        // setIsLoading(false);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [user?.id, setAuctionOffers, setItemListIds, setItemCounts, setItems]);

  useEffect(() => {
    memoizedFetchBiddingTransactionDataPerItem();
  }, [user?.id, memoizedFetchBiddingTransactionDataPerItem]);

  useEffect(() => {
    const channel = supabase
      .channel("chat_sessions_bidding_transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "BiddingTransactions",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // setAuctionOffers((prev) => [...prev, payload.new]);
            setAuctionOffers((prev) => {
              const newAuctionOffers = [...prev, payload.new];
              return newAuctionOffers.sort((a, b) => {
                if (b.bid_price === a.bid_price) {
                  return (
                    new Date(b.bid_created_at).getTime() -
                    new Date(a.bid_created_at).getTime()
                  );
                }
                return b.bid_price - a.bid_price;
              });
            });
          } else if (payload.eventType === "UPDATE") {
            // setAuctionOffers((prev) =>
            //   prev.map((offer) =>
            //     // offer.bid_id === payload.new.id ? payload.new : offer
            //     offer.bid_id === payload.new.bid_id ? payload.new : offer
            //   )
            // );
            setAuctionOffers((prev) => {
              const updatedAuctionOffers = prev.map((offer) =>
                offer.bid_id === payload.new.bid_id ? payload.new : offer
              );
              return updatedAuctionOffers.sort((a, b) => {
                if (b.bid_price === a.bid_price) {
                  return (
                    new Date(b.bid_created_at).getTime() -
                    new Date(a.bid_created_at).getTime()
                  );
                }
                return b.bid_price - a.bid_price;
              });
            });
          } else if (payload.eventType === "DELETE") {
            setAuctionOffers((prev) =>
              // prev.filter((offer) => offer.bid_id !== payload.old.id)
              prev.filter((offer) => offer.bid_id !== payload.old.bid_id)
            );
          }
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.error("Error subscribing to channel:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setAuctionOffers]);

  // checks if the item is already in progress
  // const [itemInProgress, setItemInProgress] = useState<string>("");

  // useEffect(() => {
  //   const checkItemInProgress = async () => {
  //     if (user?.id) {
  //       const response = await checkerInProgressPurchaseItemByUser(
  //         highestBidOffer.in_progress_id
  //       );
  //       if (response && response.data.length > 0) {
  //         setItemInProgress(JSON.stringify(response.data));
  //       } else {
  //         setItemInProgress("");
  //       }
  //     }
  //   };

  //   checkItemInProgress();
  // }, [highestBidOffer, user?.id, setItemInProgress]);

  const memoizedFetchData = useCallback(async () => {
    if (!user?.id) {
      console.error("User ID is undefined");
      return;
    }

    const data = await fetchInProgressPurchasesByUser(user.id);
    if (data) {
      setPurchases(data);
    } else {
      setPurchases([]); // Set an empty array if data is null
    }
    setIsLoading(false);
  }, [user?.id, setPurchases, setIsLoading]);

  useEffect(() => {
    memoizedFetchData();
  }, [user?.id, memoizedFetchData]);

  useEffect(() => {
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
          if (payload.eventType === "INSERT") {
            memoizedFetchData();
          } else if (payload.eventType === "UPDATE") {
            setPurchases((prev) =>
              prev.map((purchase) =>
                purchase.item_id === payload.new.item_id
                  ? payload.new
                  : purchase
              )
            );
          } else if (payload.eventType === "DELETE") {
            console.log("payload.old", payload.old);
            console.log("payload", payload);
            setPurchases((prev) =>
              prev.filter(
                (purchase) => purchase.item_id !== payload.old.item_id
              )
            );
          }
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.error("Error subscribing to channel:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setPurchases, memoizedFetchData]);

  return (
    <>
      <div className="lg:hidden">
        <CartHeader />
      </div>
      <div className="hidden lg:block">
        <ExploreHeader />
      </div>
      <div className="main-container justify-start">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Spinner color="success" />
          </div>
        )}
        {!isLoading && (
          <div className="product-details-container overflow-x-hidden mt-6 md:mt-16">
            <div className="w-full col-span-full flex flex-col justify-center items-start gap-2 h-full">
              {items.length !== 0 && (
                <>
                  <div className="flex flex-col px-2 mb-2">
                    <p className="font-semibold">Bidding Confirmation</p>
                    <h6 className="text-[0.6rem] truncate">
                      *Note: If you sell now, it will select the highest bidder
                      and will stop receiving bids
                    </h6>
                  </div>
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {items.map((item) => (
                      <div
                        key={item.bid_id}
                        onClick={() => {
                          // return router.push(`explore/${item.item_list_id}`);
                        }}
                      >
                        <Card className="rounded-none shadow-none">
                          <CardBody className="w-full bg-gray-100 flex flex-row gap-2 border-y">
                            {/* <Checkbox /> */}
                            <img
                              alt="Card background"
                              className="object-cover rounded w-32 h-32"
                              src="https://nextui.org/images/album-cover.png"
                            />
                            <div className="w-full h-32 flex flex-col justify-around items-stretch">
                              <p className="font-semibold truncate">
                                {item.item_name}
                              </p>
                              <h4 className="text-sm truncate">
                                {item.item_category} | {item.item_condition}
                              </h4>
                              <h4 className="font-semibold text-medium">
                                ₱{parseFloat(item.item_price).toFixed(2)}
                              </h4>
                              <div className="flex flex-col">
                                <h4 className="text-sm truncate">
                                  Number of Bids: {itemCounts.get(item.item_id)}{" "}
                                  |
                                  <span className="font-semibold">
                                    ₱{highestBidOffer?.bid_price.toFixed(2)}
                                  </span>
                                </h4>
                                <Button
                                  fullWidth
                                  color="secondary"
                                  className="text-white"
                                  onClick={() => {
                                    // setIsLikeClicked(!isLikeClicked);
                                    // console.log(
                                    //   "highestBidOffer",
                                    //   highestBidOffer
                                    // );
                                    if (!highestBidOffer) return;

                                    insertInProgressPurchaseData({
                                      item_id: highestBidOffer.item_list_id,
                                      buyer_id: highestBidOffer.bidder_id,
                                      final_price: highestBidOffer.bid_price,
                                      progress_status: "pending",
                                      item_selling_type: "auction",
                                    });

                                    setItems((prev) =>
                                      prev.filter(
                                        (item) =>
                                          item.item_id !==
                                          highestBidOffer.item_list_id
                                      )
                                    );
                                  }}
                                >
                                  Sell Now!
                                </Button>
                              </div>

                              {/* <div className="flex gap-1">
                              <Avatar
                                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                                className="w-4 h-4 text-xs"
                              />
                              <div className="flex flex-col text-sm truncate">
                                <h6 className="font-semibold">
                                  {item.seller_first_name}{" "}
                                  {item.seller_last_name}
                                </h6>
                              </div>
                            </div> */}
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {purchases.length !== 0 && (
                <>
                  <div className="flex flex-col px-2 mb-2">
                    <p className="font-semibold">Pending Transactions</p>
                    <h6 className="text-[0.6rem] truncate">
                      *Note: This is your current pending transactions
                    </h6>
                  </div>
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {purchases.map((item) => (
                      <div
                        key={item.bid_id}
                        onClick={() => {
                          // return router.push(`explore/${item.item_list_id}`);
                        }}
                      >
                        <Card className="rounded-none shadow-none">
                          <CardBody className="w-full bg-gray-100 flex flex-row gap-2 border-y">
                            {/* <Checkbox /> */}
                            <img
                              alt="Card background"
                              className="object-cover rounded w-32 h-32"
                              src="https://nextui.org/images/album-cover.png"
                            />
                            <div className="w-full h-32 flex flex-col justify-around items-stretch">
                              <p className="font-semibold truncate">
                                {item.item_name}
                              </p>
                              <h4 className="text-sm truncate">
                                {item.item_category} | {item.item_condition}
                              </h4>
                              <h4 className="font-semibold text-medium">
                                ₱{parseFloat(item.final_price).toFixed(2)}
                              </h4>
                              <div className="flex flex-col">
                                <h4 className="text-sm truncate">
                                  {item.label !== "buyer"
                                    ? "You sold this item"
                                    : "You purchase this"}
                                </h4>
                                <div className="w-full flex gap-3">
                                  <Button
                                    fullWidth
                                    color="warning"
                                    className="text-white"
                                  >
                                    Cancel
                                  </Button>
                                  {item.label === "buyer" && (
                                    <Button
                                      fullWidth
                                      color="success"
                                      className="text-white"
                                    >
                                      Received
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* <div className="flex gap-1">
                              <Avatar
                                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                                className="w-4 h-4 text-xs"
                              />
                              <div className="flex flex-col text-sm truncate">
                                <h6 className="font-semibold">
                                  {item.seller_first_name}{" "}
                                  {item.seller_last_name}
                                </h6>
                              </div>
                            </div> */}
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {items.length === 0 && purchases.length === 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <p className="text-lg">No current transaction</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* footer */}
      {/* <div className="fixed inset-x-0 bottom-16 z-50 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-around items-center gap-5 px-2 border-t py-3">
          <div className="w-full flex gap-2">
            <div className="w-full flex justify-between items-center">
              <p className="text-small">Total</p>
              <h1 className="text-red-600">₱0.00</h1>
            </div>
            <Button
              variant="solid"
              radius="sm"
              color="danger"
              onClick={() => {}}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default CartPage;
