"use client";

import React from "react";
import { Button, Card, CardBody, Image, Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
import CartHeader from "./headers/CartHeader";
import useBiddingTransactionData from "@/hooks/useBiddingTransactionDataForCart";
import { useSelector } from "react-redux";
import { RootState } from "@/app/reduxUtils/store";
import useInProgressPurchases from "@/hooks/useInProgressPurchasesForCart";
import {
  insertInProgressPurchaseData,
  updateInProgressPurchaseData,
} from "@/app/api/inProgressPurchasesIUD";
import { updateItemInventoryData } from "@/app/api/itemInventoryIUD";

const CartPage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [isLoading, setIsLoading] = useState(false);

  const {
    auctionOffers,
    highestBidOffer,
    itemListIds,
    itemCounts,
    items,
    loading,
    error,
  } = useBiddingTransactionData(user?.id);

  // useEffect(() => {
  //   console.log("items:", items);
  //   console.log("items len:", items.length);
  // }, [items]);

  const { purchases, loadingPurchases, errorPurchases } =
    useInProgressPurchases(user?.id);

  // Filter out items with status "sold"
  const filteredNonSoldPurchases = purchases.filter(
    (item) => item.progress_status !== "sold"
  );
  const filteredSoldPurchases = purchases.filter(
    (item) => item.progress_status === "sold"
  );

  return (
    <div className="w-full h-full flex flex-col items-center">
      <CartHeader />
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner color="success" />
        </div>
      )}
      {!isLoading && (
        <div className="w-full flex flex-col flex-grow">
          {/* <div className="w-full flex flex-col overflow-x-hidden"> */}
          <div className="w-full flex flex-col">
            {/* Auction */}
            {items.length !== 0 && (
              <>
                <div className="flex flex-col px-2 mb-2">
                  <p className="font-semibold">Bidding Confirmation</p>
                  <h6 className="text-[0.6rem] truncate">
                    *Note: If you sell now, it will select the highest
                    non-expired bidder and will stop receiving bids
                  </h6>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-red-200">
                  {items.map((item) => (
                    <div
                      key={item.item_id} // Ensure each item has a unique key
                      onClick={() => {
                        // return router.push(`explore/${item.item_list_id}`);
                      }}
                    >
                      <Card className="rounded-none shadow-none">
                        <CardBody className="w-full bg-gray-100 flex flex-row gap-2 border-y">
                          {/* <Checkbox /> */}
                          <Image
                            alt="Product Image"
                            className={`${
                              isLoading && "h-32 w-32"
                            } object-cover rounded h-32 w-32 rounded-b-md`}
                            src={
                              isLoading
                                ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                                : item.image_urls && item.image_urls.length > 0
                                ? item.image_urls[0]
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
                                  // setIsLikeClicked(!isLikeClicked);
                                  // console.log(
                                  //   "highestBidOffer",
                                  //   highestBidOffer
                                  // );
                                  if (!highestBidOffer) return;

                                  insertInProgressPurchaseData({
                                    item_id: highestBidOffer.item_id, // Check if this is null
                                    buyer_id: highestBidOffer.bidder_id,
                                    final_price: highestBidOffer.bid_price,
                                    progress_status: "pending",
                                    item_selling_type: "auction",
                                  });

                                  // setItems((prev) =>
                                  //   prev.filter(
                                  //     (item) =>
                                  //       item.item_id !==
                                  //       highestBidOffer.item_list_id
                                  //   )
                                  // );
                                }}
                              >
                                Sell Now!
                              </Button>
                            </div>

                            {/* <div className="flex gap-1">
                              <Avatar
                                src="https://fakeimg.pl/500x500?text=user&font=bebas"
                                className="w-4 h-4 text-xs"
                                disableAnimation 
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

            {/* Not-Sold Sell */}
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
                    <div
                      key={item.item_id} // Ensure each purchase has a unique key
                      onClick={() => {
                        // return router.push(`explore/${item.item_list_id}`);
                      }}
                    >
                      <Card className="rounded-none shadow-none">
                        <CardBody className="w-full bg-gray-100 flex flex-row gap-2 border-y">
                          {/* <Checkbox /> */}
                          {/* <img
                            alt="Card background"
                            className="object-cover rounded w-32 h-32"
                            src="https://nextui.org/images/album-cover.png"
                          /> */}
                          <Image
                            alt="Product Image"
                            className={`${
                              isLoading && "h-32 w-32"
                            } object-cover rounded h-32 w-32 rounded-b-md`}
                            src={
                              isLoading
                                ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                                : item.image_urls && item.image_urls.length > 0
                                ? item.image_urls[0]
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
                                    // updateItemInventoryData(
                                    //   {
                                    //     item_status: "active",
                                    //   },
                                    //   item.item_id
                                    // );
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

            {/* Sold Sell */}
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
                    <div
                      key={item.item_id} // Ensure each purchase has a unique key
                      onClick={() => {
                        // return router.push(`explore/${item.item_list_id}`);
                      }}
                    >
                      <Card className="rounded-none shadow-none">
                        <CardBody className="w-full bg-gray-100 flex flex-row gap-2 border-y">
                          {/* <Checkbox /> */}
                          {/* <img
                            alt="Card background"
                            className="object-cover rounded w-32 h-32"
                            src="https://nextui.org/images/album-cover.png"
                          /> */}
                          <Image
                            alt="Product Image"
                            className={`${
                              isLoading && "h-32 w-32"
                            } object-cover rounded h-32 w-32 rounded-b-md`}
                            src={
                              isLoading
                                ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                                : item.image_urls && item.image_urls.length > 0
                                ? item.image_urls[0]
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
                                    // updateItemInventoryData(
                                    //   {
                                    //     item_status: "active",
                                    //   },
                                    //   item.item_id
                                    // );
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

            {items.length === 0 && purchases.length === 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <p className="text-lg">No current transaction</p>
              </div>
            )}
          </div>
          {/* </div> */}
        </div>
      )}
    </div>
  );
};

export default CartPage;
