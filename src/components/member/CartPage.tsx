"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Image, Spinner } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { Rating } from "@mui/material";
import { supabase } from "@/utils/supabase";
import useBiddingTransactionData from "@/hooks/useBiddingTransactionDataForCart";
import useInProgressPurchases from "@/hooks/useInProgressPurchasesForCart";
import {
  insertInProgressPurchaseData,
  updateInProgressPurchaseData,
} from "@/app/api/inProgressPurchasesIUD";
import { updateItemInventoryData } from "@/app/api/itemInventoryIUD";
import { RootState } from "@/app/reduxUtils/store";
import { MdModeEditOutline, MdOutlineCancel } from "react-icons/md";

const CartPage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [isLoading, setIsLoading] = useState(false);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [editingRatingId, setEditingRatingId] = useState<number | null>(null);

  const {
    auctionOffers,
    highestBidOffer,
    itemListIds,
    itemCounts,
    items,
    loading,
    error,
  } = useBiddingTransactionData(user?.id);

  const { purchases } = useInProgressPurchases(user?.id);

  const filteredNonSoldPurchases = purchases.filter(
    (item) => item.progress_status !== "sold"
  );
  const filteredSoldPurchases = purchases.filter(
    (item) => item.progress_status === "sold"
  );

  const handleRatingSubmit = async (
    itemId: number,
    sellerId: string,
    rating: number
  ) => {
    try {
      const { error } = await supabase.from("RatingTransactions").insert({
        item_id: itemId,
        buyer_id: user?.id,
        seller_id: sellerId,
        rating: rating,
      });

      if (error) throw error;

      setRatings((prev) => ({ ...prev, [itemId]: rating }));
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleUpdateRating = async (
    itemId: number,
    sellerId: string,
    rating: number
  ) => {
    try {
      const { error } = await supabase
        .from("RatingTransactions")
        .update({ rating })
        .match({ item_id: itemId, buyer_id: user?.id });

      if (error) throw error;

      setRatings((prev) => ({ ...prev, [itemId]: rating }));
      setEditingRatingId(null);
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  useEffect(() => {
    const fetchRatings = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("RatingTransactions")
        .select("item_id, rating")
        .eq("buyer_id", user.id);

      if (error) {
        console.error("Error fetching ratings:", error);
        return;
      }

      const ratingsMap = data.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.item_id]: curr.rating,
        }),
        {}
      );

      setRatings(ratingsMap);
    };

    fetchRatings();
  }, [user?.id]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner color="success" />
        </div>
      )}
      {!isLoading && (
        <div className="w-full flex flex-col flex-grow">
          <div className="w-full flex flex-col mt-5">
            {items.length !== 0 && (
              <>
                <div className="flex flex-col px-2 mb-2">
                  <p className="font-semibold">Bidding Confirmation</p>
                  <h6 className="text-[0.6rem] truncate">
                    *Note: If you sell now, it will select the highest
                    non-expired bidder and will stop receiving bids
                  </h6>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {items.map((item) => (
                    <div key={item.item_id} onClick={() => {}}>
                      <Card className="rounded-none shadow-none">
                        <CardBody className="w-full bg-gray-100 flex flex-row gap-2 border-y">
                          <Image
                            alt="Product Image"
                            className={`${
                              isLoading && "h-32 w-32"
                            } object-cover rounded-none h-32 w-32 rounded-b-md`}
                            src={
                              isLoading
                                ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                                : item.image_urls && item.image_urls.length > 0
                                ? item.image_urls[0].url.endsWith(".mp4")
                                  ? item.image_urls.length > 1
                                    ? item.image_urls[1].url
                                    : "https://fakeimg.pl/500x500?text=img&font=bebas"
                                  : item.image_urls[0].url
                                : "https://fakeimg.pl/500x500?text=img&font=bebas"
                            }
                          />
                          <div className="w-full h-32 flex flex-col justify-around items-stretch">
                            <p className="font-semibold truncate">
                              {item.item_name}
                            </p>
                            <h4 className="text-sm truncate">
                              {item.item_category} | {item.item_condition}
                            </h4>
                            <h4 className="font-semibold text-medium">
                              ₱
                              {parseFloat(item?.item_price).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </h4>
                            <div className="flex flex-col">
                              <h4 className="text-sm truncate">
                                Number of Bids: {itemCounts.get(item.item_id)} |
                                <span className="font-semibold">
                                  ₱
                                  {parseFloat(
                                    highestBidOffer?.bid_price
                                  ).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </h4>
                              <Button
                                fullWidth
                                color="secondary"
                                className="text-white"
                                onClick={() => {
                                  if (!highestBidOffer) return;

                                  insertInProgressPurchaseData({
                                    item_id: highestBidOffer.item_id,
                                    buyer_id: highestBidOffer.bidder_id,
                                    final_price: highestBidOffer.bid_price,
                                    progress_status: "pending",
                                    item_selling_type: "auction",
                                  });
                                }}
                              >
                                Sell Now!
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
              </>
            )}

            {filteredNonSoldPurchases.length !== 0 && (
              <>
                <div className="flex flex-col px-2 mb-2">
                  <p className="font-semibold">Pending Transactions</p>
                  <h6 className="text-[0.6rem] truncate">
                    *Note: This is your current pending transactions
                  </h6>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-200">
                  {filteredNonSoldPurchases.map((item) => (
                    <div key={item.item_id} onClick={() => {}}>
                      <Card className="rounded-none shadow-none">
                        <CardBody className="w-full bg-gray-100 flex flex-row gap-2 border-y">
                          <Image
                            alt="Product Image"
                            className={`${
                              isLoading && "h-32 w-32"
                            } object-cover rounded h-32 w-32 rounded-b-md`}
                            src={
                              isLoading
                                ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                                : item.image_urls && item.image_urls.length > 0
                                ? item.image_urls[0].url.endsWith(".mp4")
                                  ? item.image_urls.length > 1
                                    ? item.image_urls[1].url
                                    : "https://fakeimg.pl/500x500?text=img&font=bebas"
                                  : item.image_urls[0].url
                                : "https://fakeimg.pl/500x500?text=img&font=bebas"
                            }
                          />
                          <div className="w-full h-32 flex flex-col justify-around items-stretch">
                            <p className="font-semibold truncate">
                              {item.item_name}
                            </p>
                            <h4 className="text-sm truncate">
                              {item.item_category} | {item.item_condition}
                            </h4>
                            <h4 className="font-semibold text-medium">
                              ₱
                              {parseFloat(item?.final_price).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </h4>
                            <div className="flex flex-col">
                              <h4 className="text-xs truncate uppercase">
                                {item.label !== "buyer"
                                  ? "You sold this item"
                                  : "You purchase this"}
                              </h4>
                              <div
                                className={`${
                                  item.progress_status !== "pending" && "hidden"
                                } w-full flex gap-3`}
                              >
                                <Button
                                  fullWidth
                                  color="warning"
                                  className="text-white"
                                  onPress={() => {
                                    updateInProgressPurchaseData(
                                      {
                                        progress_status: "cancelled",
                                      },
                                      item.in_progress_id
                                    );
                                  }}
                                >
                                  Cancel
                                </Button>
                                {item.label === "buyer" && (
                                  <Button
                                    fullWidth
                                    color="success"
                                    className="text-white"
                                    onPress={() => {
                                      updateItemInventoryData(
                                        {
                                          item_status: "sold",
                                        },
                                        item.item_id
                                      );
                                      updateInProgressPurchaseData(
                                        {
                                          progress_status: "sold",
                                        },
                                        item.in_progress_id
                                      );
                                    }}
                                  >
                                    Received
                                  </Button>
                                )}
                              </div>

                              <div
                                className={`${
                                  item.progress_status !== "sold" && "hidden"
                                } w-full flex gap-3`}
                              >
                                <Button
                                  fullWidth
                                  color="secondary"
                                  className="text-white"
                                  isDisabled
                                >
                                  Sold
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
              </>
            )}

            {filteredSoldPurchases.length !== 0 && (
              <>
                <div className="flex flex-col px-2 mb-2">
                  <p className="font-semibold">Past Transactions</p>
                  <h6 className="text-[0.6rem] truncate">
                    *Note: This is your past transactions
                  </h6>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-200">
                  {filteredSoldPurchases.map((item) => (
                    <div key={item.item_id} onClick={() => {}}>
                      <Card className="rounded-none shadow-none">
                        <CardBody className="w-full bg-gray-100 flex flex-row gap-2 border-y">
                          <Image
                            alt="Product Image"
                            className={`${
                              isLoading && "h-36 w-36"
                            } object-cover rounded h-36 w-36 rounded-b-md`}
                            src={
                              isLoading
                                ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                                : item.image_urls && item.image_urls.length > 0
                                ? item.image_urls[0].url.endsWith(".mp4")
                                  ? item.image_urls.length > 1
                                    ? item.image_urls[1].url
                                    : "https://fakeimg.pl/500x500?text=img&font=bebas"
                                  : item.image_urls[0].url
                                : "https://fakeimg.pl/500x500?text=img&font=bebas"
                            }
                          />
                          <div className="w-full h-36 flex flex-col justify-around items-stretch">
                            <div className="h-full flex flex-col just">
                              <p className="font-semibold truncate">
                                {item.item_name}
                              </p>
                              <h4 className="text-sm truncate">
                                {item.item_category} | {item.item_condition}
                              </h4>
                              <h4 className="font-semibold text-medium">
                                ₱
                                {parseFloat(item?.final_price).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </h4>
                              <div className="flex flex-col">
                                <h4 className="text-xs truncate uppercase">
                                  {item.label !== "buyer"
                                    ? "You sold this item"
                                    : "You purchase this"}
                                </h4>
                                <div
                                  className={`${
                                    item.progress_status !== "pending" &&
                                    "hidden"
                                  } w-full flex gap-3`}
                                >
                                  <Button
                                    fullWidth
                                    color="warning"
                                    className="text-white"
                                    onPress={() => {
                                      updateInProgressPurchaseData(
                                        {
                                          progress_status: "cancelled",
                                        },
                                        item.in_progress_id
                                      );
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  {item.label === "buyer" && (
                                    <Button
                                      fullWidth
                                      color="success"
                                      className="text-white"
                                      onPress={() => {
                                        updateItemInventoryData(
                                          {
                                            item_status: "sold",
                                          },
                                          item.item_id
                                        );
                                        updateInProgressPurchaseData(
                                          {
                                            progress_status: "sold",
                                          },
                                          item.in_progress_id
                                        );
                                      }}
                                    >
                                      Received
                                    </Button>
                                  )}
                                </div>

                                {item.label === "buyer" && (
                                  <div className="flex items-center gap-2">
                                    <Rating
                                      value={ratings[item.item_id] || 0}
                                      onChange={(_, newValue) => {
                                        if (newValue) {
                                          if (
                                            editingRatingId === item.item_id
                                          ) {
                                            handleUpdateRating(
                                              item.item_id,
                                              item.seller_id,
                                              newValue
                                            );
                                          } else {
                                            handleRatingSubmit(
                                              item.item_id,
                                              item.seller_id,
                                              newValue
                                            );
                                          }
                                        }
                                      }}
                                      disabled={
                                        !!ratings[item.item_id] &&
                                        editingRatingId !== item.item_id
                                      }
                                    />
                                    {ratings[item.item_id] && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                          Rated {ratings[item.item_id]} stars
                                        </span>
                                        <Button
                                          size="sm"
                                          isIconOnly
                                          variant="light"
                                          startContent={
                                            editingRatingId === item.item_id ? (
                                              <MdOutlineCancel />
                                            ) : (
                                              <MdModeEditOutline />
                                            )
                                          }
                                          onPress={() => {
                                            if (
                                              editingRatingId === item.item_id
                                            ) {
                                              setEditingRatingId(null);
                                            } else {
                                              setEditingRatingId(item.item_id);
                                            }
                                          }}
                                        ></Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div
                              className={`${
                                item.progress_status !== "sold" && "hidden"
                              } w-full flex flex-col gap-3`}
                            >
                              <Button
                                fullWidth
                                color="secondary"
                                className="text-white"
                                isDisabled
                              >
                                Sold
                              </Button>
                            </div>
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
  );
};

export default CartPage;
