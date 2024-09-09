// components/admin/pages/ExploreItem.tsx

"use client";

import {
  Avatar,
  Badge,
  Button,
  Chip,
  DateInput,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IoChevronBack, IoChevronDown, IoChevronUp } from "react-icons/io5";
import ExploreItemHeader from "../headers/ExploreItemHeader";
import { fetchItemInventoryDataByItem } from "@/app/api/itemInventoryData";
import {
  checkerBiddingItemByUser,
  fetchBiddingTransactionDataPerItem,
  insertBiddingTransactionData,
  updateBiddingTransactionData,
} from "@/app/api/biddingTransactionData";
import { IoIosHeartEmpty } from "react-icons/io";
import { IoIosHeart } from "react-icons/io";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  CalendarDate,
  CalendarDateTime,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  checkerInProgressPurchaseItemByUser,
  insertInProgressPurchaseData,
} from "@/app/api/inProgressPurchasesData";

interface ExploreItemProps {
  item_id: number;
}

const ExploreItem = ({ item_id }: ExploreItemProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [exploreItem, setExploreItem] = useState<any[]>([]);
  const [auctionOffers, setAuctionOffers] = useState<any[]>([]);
  const [openBidModal, setOpenBidModal] = useState(false);
  const [newBidPrice, setNewBidPrice] = useState<number>(0);
  const [newBidDue, setNewBidDue] = useState(
    today(getLocalTimeZone()).add({ days: 1 }).toString()
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isLikeClicked, setIsLikeClicked] = useState(false);

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

  useEffect(() => {
    if (user) {
      const checkBid = async () => {
        const response = await checkerBiddingItemByUser(item_id, user.id);
        if (response && response.data.length > 0) {
          const bidData = response.data[0];
          setNewBidPrice(bidData.bid_price);
          setNewBidDue(bidData.bid_due);
        }
      };

      checkBid();
    }
  }, [user, item_id]);

  const memoizedFetchItemInventoryDataByItem = useCallback(async () => {
    if (!item_id) {
      console.error("Item ID is undefined");
      return;
    }

    try {
      const response = await fetchItemInventoryDataByItem(item_id);
      if (response?.error) {
        console.error(response.error);
      } else {
        setExploreItem(response?.data ?? []);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [item_id, setExploreItem]);

  useEffect(() => {
    memoizedFetchItemInventoryDataByItem();
  }, [item_id, memoizedFetchItemInventoryDataByItem]);

  useEffect(() => {
    const channel = supabase
      .channel("chat_sessions_item_inventory")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ItemInventory",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setExploreItem((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            // console.log(payload.new);
            setExploreItem((prev) =>
              prev.map((item) =>
                // item.item_id === payload.new.id ? payload.new : item
                item.item_id === payload.new.item_id ? payload.new : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setExploreItem((prev) =>
              // prev.filter((item) => item.item_id !== payload.old.id)
              prev.filter((item) => item.item_id !== payload.old.item_id)
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
  }, [supabase, setExploreItem]);

  // bidding data fetch
  const memoizedFetchBiddingTransactionDataPerItem = useCallback(async () => {
    if (!item_id) {
      console.error("Item ID is undefined");
      return;
    }

    try {
      const response = await fetchBiddingTransactionDataPerItem(item_id);
      if (response?.error) {
        console.error(response.error);
      } else {
        setAuctionOffers(response?.data ?? []);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [item_id, setAuctionOffers]);

  useEffect(() => {
    memoizedFetchBiddingTransactionDataPerItem();
  }, [item_id, memoizedFetchBiddingTransactionDataPerItem]);

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
  const [itemInProgress, setItemInProgress] = useState<string>("");

  useEffect(() => {
    const checkItemInProgress = async () => {
      if (user?.id) {
        const response = await checkerInProgressPurchaseItemByUser(item_id);
        if (response && response.data.length > 0) {
          setItemInProgress(JSON.stringify(response.data));
        } else {
          setItemInProgress("");
        }
      }
    };

    checkItemInProgress();
  }, [item_id, user?.id, setItemInProgress]);

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
        (payload) => {
          if (payload.eventType === "INSERT") {
            if (payload.new.item_id === item_id) {
              setItemInProgress(JSON.stringify([payload.new]));
            }
          } else if (payload.eventType === "DELETE") {
            // need fixing
            if (payload.old.item_id === item_id) {
              setItemInProgress("");
            }
          } else if (payload.eventType === "UPDATE") {
            if (payload.new.item_id === item_id) {
              setItemInProgress(JSON.stringify([payload.new]));
            }
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
  }, [supabase, item_id]);

  const parsedItemInProgress = itemInProgress ? JSON.parse(itemInProgress) : [];

  const itemBuyerInProgress = () => {
    if (parsedItemInProgress.length > 0) {
      const { progress_status, buyer_id } = parsedItemInProgress[0];
      if (progress_status === "pending") {
        return buyer_id === user?.id ? "Buyer" : "Other";
      } else if (progress_status === "completed") {
        return "Sold";
      }
    }
    return "None";
  };

  // exclusive for sell only
  const getStatusMessageSell = () => {
    if (parsedItemInProgress.length > 0) {
      const { progress_status, buyer_id } = parsedItemInProgress[0];
      if (progress_status === "pending") {
        return buyer_id === user?.id
          ? "Your purchase is in progress"
          : "Purchase in progress";
      } else if (progress_status === "completed") {
        return "Sold";
      }
    }
    return "Buy Now";
  };

  // exclusive for auction only
  const getStatusMessageAuction = () => {
    if (parsedItemInProgress.length > 0) {
      const { progress_status, buyer_id } = parsedItemInProgress[0];
      if (progress_status === "pending") {
        return buyer_id === user?.id
          ? "Your bid is in progress"
          : "Purchase in progress";
      } else if (progress_status === "completed") {
        return "Sold";
      }
    }
    return userHasBid ? "Update Bid" : "Offer Bid";
  };

  const isDisabledTransaction = () => {
    const buyer = itemBuyerInProgress();
    if (buyer === "Other") {
      return true;
    } else if (buyer === "Buyer" || buyer === "None") {
      return false;
    } else {
      return false;
    }
  };

  // bidding
  const userHasBid = auctionOffers.some(
    (offer) => offer.bidder_id === user?.id
  );

  const handleBiddingTransactionData = async () => {
    if (!user?.id) {
      console.error("User ID is undefined");
      return;
    }

    const data = {
      item_list_id: item_id,
      bidder_id: user?.id,
      bid_price: newBidPrice,
      bid_due: newBidDue,
    };

    const userBid = auctionOffers.find((offer) => offer.bidder_id === user?.id);

    if (userBid) {
      // Update the existing bid
      await updateBiddingTransactionData(data, userBid.bid_id);
    } else {
      // Insert a new bid
      await insertBiddingTransactionData(data);
    }

    setOpenBidModal(false);
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", options);
  };

  return (
    <>
      <ExploreItemHeader setIsLoading={setIsLoading} />
      <Modal
        backdrop="blur"
        isOpen={openBidModal}
        onOpenChange={setOpenBidModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Add Bid</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Bid Price"
                  placeholder="Enter bid price"
                  variant="bordered"
                  type="number"
                  value={newBidPrice.toString()} // Convert number to string
                  onChange={(e) => setNewBidPrice(Number(e.target.value))} // Still store the number
                  startContent={
                    <p className="text-xs font-semibold text-gray-500">₱</p>
                  }
                />

                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                  <DateInput
                    label={"Bid Until"}
                    granularity="day"
                    minValue={today(getLocalTimeZone())}
                    value={
                      new CalendarDate(
                        new Date(newBidDue).getFullYear(),
                        new Date(newBidDue).getMonth() + 1,
                        new Date(newBidDue).getDate()
                      )
                    }
                    placeholderValue={new CalendarDate(1995, 11, 6)}
                    onChange={(value) => setNewBidDue(value.toString())}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleBiddingTransactionData}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="main-container justify-start">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Spinner color="success" />
          </div>
        )}
        {!isLoading && (
          <div className="product-details-container overflow-x-hidden">
            <div className="w-full">
              <img
                src="https://nextui.org/images/hero-card-complete.jpeg"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="w-full flex-col px-2">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-3xl">
                  ₱{parseFloat(exploreItem[0]?.item_price).toFixed(2)}
                </h2>
                <Chip className="bg-[#008B47] text-white">
                  {exploreItem[0]?.item_category}
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl">
                  {exploreItem[0]?.item_name}
                </h3>
                <Button
                  isIconOnly
                  variant="light"
                  disableAnimation
                  radius="sm"
                  className="p-0 m-0"
                  onClick={() => {
                    setIsLikeClicked(!isLikeClicked);
                  }}
                >
                  {isLikeClicked ? (
                    <IoIosHeart color="red" size={30} />
                  ) : (
                    <IoIosHeartEmpty size={30} />
                  )}
                </Button>
              </div>
              <h3 className="text-sm">{exploreItem[0]?.item_condition}</h3>
              <h3 className="mt-3">{exploreItem[0]?.item_description}</h3>
              <div className="w-full bg-gray-50 flex justify-between py-3 mt-3">
                <div className="flex gap-1">
                  <Avatar
                    src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                    radius="sm"
                  />
                  <div className="flex flex-col text-sm truncate">
                    <h6 className="font-semibold">
                      {exploreItem[0]?.seller_first_name}{" "}
                      {exploreItem[0]?.seller_last_name}
                    </h6>
                    <h6 className="text-xs">{exploreItem[0]?.seller_email}</h6>
                  </div>
                </div>
                <Button
                  variant="solid"
                  radius="sm"
                  color="primary"
                  onClick={() => {}}
                >
                  Visit User
                </Button>
              </div>
            </div>
            {/* modify bidding to arrange with highest amount, then time */}
            <div
              className={`${
                exploreItem[0]?.item_selling_type !== "auction" && "hidden"
              } w-full bg-gray-50 flex flex-col justify-between py-3 px-2`}
            >
              <h3 className="font-semibold font-lg">
                Bidding Offers{" "}
                <span className="font-normal">({auctionOffers.length})</span>
              </h3>
              {auctionOffers.length === 0 ? (
                <div className="w-full col-span-full flex justify-center items-center gap-2 h-full">
                  <p className="text-sm">No Offers yet...</p>
                </div>
              ) : (
                auctionOffers
                  .slice(0, showAll ? auctionOffers.length : 3)
                  .map((offer, index) => (
                    <Badge
                      key={`badge-${index}`}
                      content="Highest Bidder"
                      color="secondary"
                      variant="flat"
                      size="sm"
                      className={`${
                        index !== 0 && "hidden"
                      } mr-7 md:mr-0 mb-10`}
                    >
                      <div key={index} className="w-full flex flex-col my-3">
                        <div className="flex justify-between">
                          <h6 className="text-sm">
                            Offer: PHP {offer.bid_price}
                          </h6>
                          <h6 className="text-xs italic">
                            {formatDate(offer.bid_due)}
                          </h6>
                        </div>
                        <div className="flex justify-between">
                          <h6 className="text-sm font-semibold">
                            {offer.bidder_id === user?.id
                              ? "Bid by You"
                              : offer.bidder_first_name &&
                                offer.bidder_last_name
                              ? `${offer.bidder_first_name} ${offer.bidder_last_name}`
                              : "Bid by Someone"}
                          </h6>
                          <h6
                            className={`text-xs ${
                              offer.bid_status === "active"
                                ? "text-green-500"
                                : offer.bid_status === "expired"
                                ? "text-orange-500"
                                : "text-red-500"
                            }`}
                          >
                            {offer.bid_status.charAt(0).toUpperCase() +
                              offer.bid_status.slice(1)}
                          </h6>
                        </div>
                        <hr />
                      </div>
                    </Badge>
                  ))
              )}
              <div
                className={`flex justify-center ${
                  auctionOffers.length <= 3 && "hidden"
                }`}
              >
                <Button
                  size="sm"
                  endContent={showAll ? <IoChevronUp /> : <IoChevronDown />}
                  variant={showAll ? "bordered" : "solid"}
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : "Show All"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* footer */}
      {!isLoading && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-around items-center gap-5 px-2 border-t-3 py-1">
            <div className="flex flex-col items-center">
              <Avatar
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                className="w-7 h-7 text-sm"
              />
              <h6 className="text-xs">Seller</h6>
            </div>
            <div className="w-full flex gap-2">
              <Button
                variant="bordered"
                radius="sm"
                // color="primary"
                className={`${
                  exploreItem[0]?.item_selling_type !== "auction" && "hidden"
                } bg-[#008B47] text-white`}
                // border-[#008B47] text-[#008B47]
                fullWidth
                isDisabled={isDisabledTransaction()}
                onClick={() => {
                  const buyer = itemBuyerInProgress();

                  if (buyer === "Buyer") {
                    setIsLoading(true);
                    router.push("/ident/member/transaction");
                    return;
                  } else if (buyer === "Other") {
                    return;
                  } else if (buyer === "None") {
                    setOpenBidModal(true);
                  }
                }}
              >
                {/* {userHasBid ? "Update Bid" : "Offer Bid"} */}
                <p>{getStatusMessageAuction()}</p>
              </Button>
              <Button
                variant="solid"
                radius="sm"
                // color="danger"
                className={`${
                  exploreItem[0]?.item_selling_type !== "sell" && "hidden"
                } bg-[#008B47] text-white`}
                fullWidth
                isDisabled={isDisabledTransaction()}
                onClick={() => {
                  const buyer = itemBuyerInProgress();

                  if (buyer === "Buyer") {
                    setIsLoading(true);
                    router.push("/ident/member/transaction");
                    return;
                  } else if (buyer === "Other") {
                    return;
                  } else if (buyer === "None") {
                    insertInProgressPurchaseData({
                      item_id: item_id,
                      buyer_id: user?.id,
                      final_price: parseFloat(exploreItem[0]?.item_price),
                      progress_status: "pending",
                      item_selling_type: "sell",
                    });
                  }
                }}
              >
                <p>{getStatusMessageSell()}</p>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExploreItem;
