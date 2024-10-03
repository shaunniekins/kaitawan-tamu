"use client";

import useSingleItemInventory from "@/hooks/useSingleItemInventory";
import { useSelector } from "react-redux";
import { RootState } from "@/app/reduxUtils/store";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  DateInput,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import useBiddingTransactions from "@/hooks/useBiddingTransactions";
import {
  checkerBiddingItemByUser,
  // checkerInProgressPurchaseItemByUser,
} from "@/app/api/checkers";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import useItemInventory from "@/hooks/useItemInventory";
import { MdOutlineSell } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import {
  insertBiddingTransactionData,
  updateBiddingTransactionData,
} from "@/app/api/biddingTransactionIUD";
import { insertInProgressPurchaseData } from "@/app/api/inProgressPurchasesIUD";
import useSingleInProgressPurchase from "@/hooks/useSingleInProgressPurchase";
import useLikedItems from "@/hooks/useLikedItems";
import { deleteLikedItem, insertLikedItem } from "@/app/api/likedItemsIUD";

interface ExploreItemProps {
  item_id: number;
}

const ExploreItem = ({ item_id }: ExploreItemProps) => {
  const user = useSelector((state: RootState) => state.user.user);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLikeClicked, setIsLikeClicked] = useState(false);

  // const { items, loadingItems, errorItems } = useItemInventory(
  //   10,
  //   1,
  //   "active",
  //   true,
  //   user?.id,
  //   false,
  //   []
  // );

  const { item, loadingItem, errorItem } = useSingleItemInventory(item_id);
  const { bids, loadingBids, errorBids } = useBiddingTransactions(
    item_id,
    item?.item_selling_type
  );
  const { itemInProgress, loadingItemInProgress, errorItemInProgress } =
    useSingleInProgressPurchase(item_id);

  const { likedItems, loadingLikedItems, totalLikedItems, errorLikedItems } =
    useLikedItems(user?.id, item_id);

  // const [itemInProgress, setItemInProgress] = useState<any>(null);

  useEffect(() => {
    setIsLoading(loadingItem);
  }, [loadingItem]);

  // checks if item is in the in-progress purchase list
  // useEffect(() => {
  //   const fetchItemInProgress = async () => {
  //     try {
  //       const item = await checkerInProgressPurchaseItemByUser(item_id);
  //       setItemInProgress(item?.data);
  //       // console.log("item in progress", item);
  //       // console.log("item in progress", item?.data);
  //     } catch (error) {
  //       console.error("Error fetching item in progress:", error);
  //     }
  //   };

  //   fetchItemInProgress();
  // }, [item_id]);

  // useEffect(() => {
  //   console.log("item: ", item.item_selling_type);
  // }, [item]);

  useEffect(() => {
    if (likedItems.length > 0) {
      setIsLikeClicked(true);
    } else {
      setIsLikeClicked(false);
    }
  }, [likedItems]);

  const handleLikeClick = async () => {
    setIsLikeClicked(!isLikeClicked);

    if (!isLikeClicked) {
      await insertLikedItem({ liker_id: user?.id, item_id });
    } else {
      const likedItem = likedItems.find((item) => item.item_id === item_id);
      if (likedItem) {
        await deleteLikedItem(likedItem.liked_id);
      }
    }
  };

  // auction
  const [openBidModal, setOpenBidModal] = useState(false);
  const [newBidPrice, setNewBidPrice] = useState<number>(0);
  const [newBidDue, setNewBidDue] = useState(
    today(getLocalTimeZone()).add({ days: 1 }).toString()
  );
  const [showAll, setShowAll] = useState(false);

  const userHasBid = bids.some((offer) => offer.bidder_id === user?.id);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", options);
  };

  const handleBiddingTransactionData = async () => {
    if (!user?.id) {
      console.error("User ID is undefined");
      return;
    }

    const data = {
      item_id: item_id,
      bidder_id: user?.id,
      bid_price: newBidPrice,
      bid_due: newBidDue,
    };

    const userBid = bids.find((offer) => offer.bidder_id === user?.id);

    if (userBid) {
      // Update the existing bid
      await updateBiddingTransactionData(data, userBid.bid_id);
    } else {
      // Insert a new bid
      await insertBiddingTransactionData(data);
    }

    setOpenBidModal(false);
  };

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

  const buttonText = useMemo(() => {
    // Check the progress status
    if (itemInProgress?.progress_status === "sold") {
      // console.log("sold");
      // return "Sold";
      return itemInProgress?.buyer_id === user?.id
        ? "You have purchased this item"
        : "This item has been sold";
    } else if (itemInProgress?.progress_status === "pending") {
      // console.log("pending");
      if (item?.item_selling_type === "auction") {
        return itemInProgress?.buyer_id === user?.id
          ? "Your bid is in progress"
          : "Purchase in progress";
      } else if (item?.item_selling_type === "sell") {
        return itemInProgress?.buyer_id === user?.id
          ? "Your purchase is in progress"
          : "Purchase in progress";
      }
    } else if (!itemInProgress || itemInProgress?.length === 0) {
      // console.log("no data");
      if (item?.item_selling_type === "auction") {
        return userHasBid ? "Update Bid" : "Offer Bid";
      } else if (item?.item_selling_type === "sell") {
        return "Buy Now";
      }
    }
    return null; // Return null if none of the conditions are met
  }, [itemInProgress, item, userHasBid, user]);

  const handleButtonClick = () => {
    if (!user) return;

    if (itemInProgress?.progress_status === "pending") {
      // console.log("item pending");
      if (
        item?.item_selling_type === "auction" ||
        item?.item_selling_type === "sell"
      ) {
        // console.log("auction or sell inside");
        if (itemInProgress?.buyer_id === user?.id) {
          // console.log("buyer id", itemInProgress?.buyer_id);
          setIsLoading(true);
          router.push("/member/transaction");
          return;
        }
      }
    } else if (!itemInProgress || itemInProgress?.length === 0) {
      // console.log("not pending");
      if (item?.item_selling_type === "auction") {
        setOpenBidModal(true);
      } else if (item?.item_selling_type === "sell") {
        const userConfirmed = window.confirm(
          "Are you sure you want to buy this item?"
        );
        if (userConfirmed) {
          insertInProgressPurchaseData({
            item_id: item_id,
            buyer_id: user?.id,
            final_price: parseFloat(item?.item_price),
            progress_status: "pending",
            item_selling_type: "sell",
          });
        }
      }
    }
  };

  const currentDate = new Date();

  return (
    <>
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
      <div className="w-full h-full flex flex-col items-center">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Spinner color="success" />
          </div>
        )}
        {!isLoading && (
          <>
            <div className="w-full flex flex-col flex-grow overflow-y-auto mb-32">
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 ">
                <div className="flex flex-col mb-0">
                  {/* product image */}
                  <div className="w-full bg-gray-200 flex justify-center">
                    <Zoom>
                      <Image
                        alt="Product Image"
                        className="object-cover rounded-none rounded-b-md h-80 w-80 lg:h-96 lg:w-96"
                        src={
                          isLoading
                            ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                            : item?.image_urls?.length > 0
                            ? item.image_urls[currentImage]
                            : "https://fakeimg.pl/500x500?text=img&font=bebas"
                        }
                      />
                    </Zoom>
                  </div>
                  {/* Thumbnail images below the zoom image */}
                  <div className="flex justify-center items-center gap-4 mt-2">
                    {item?.image_urls &&
                      item?.image_urls.map((imgUrl: any, index: any) => (
                        <div
                          key={index}
                          onClick={() => setCurrentImage(index)}
                          className={`cursor-pointer ${
                            currentImage === index
                              ? "border-2 border-blue-500"
                              : ""
                          }`}
                        >
                          <Image
                            alt={`Thumbnail ${index + 1}`}
                            src={imgUrl}
                            width={100}
                            height={100}
                            className="object-cover rounded-md aspect-square"
                          />
                        </div>
                      ))}
                  </div>
                </div>
                {/* card with product details */}
                <div className="w-full flex-col justify-between px-2">
                  <div className="lg:hidden flex justify-between items-center">
                    <h2 className="font-semibold text-3xl">
                      ₱
                      {parseFloat(item?.item_price).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h2>
                    <Chip className="bg-[#008B47] text-white">
                      {item?.item_category}
                    </Chip>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-xl">{item?.item_name}</h3>
                    <Button
                      isIconOnly
                      variant="light"
                      disableAnimation
                      radius="sm"
                      className="p-0 m-0"
                      onClick={handleLikeClick}
                    >
                      {isLikeClicked ? (
                        <IoIosHeart color="red" size={30} />
                      ) : (
                        <IoIosHeartEmpty size={30} />
                      )}
                    </Button>
                  </div>
                  <div className="hidden lg:flex justify-between items-center">
                    <h2 className="font-semibold text-3xl">
                      ₱{parseFloat(item?.item_price).toFixed(2)}
                    </h2>
                    <Chip className="bg-[#008B47] text-white">
                      {item?.item_category}
                    </Chip>
                  </div>
                  <h3 className="text-sm">{item?.item_condition}</h3>
                  <h3 className="mt-3">{item?.item_description}</h3>
                  <div className="w-full bg-gray-50 flex justify-between py-3 mt-3">
                    <div className="flex gap-1">
                      <Avatar
                        src={item?.seller_profile_picture}
                        radius="sm"
                        disableAnimation
                      />
                      <div className="flex flex-col text-sm truncate">
                        <h6 className="font-semibold">
                          {item?.seller_first_name} {item?.seller_last_name}
                        </h6>
                        <h6 className="text-xs">{item?.seller_email}</h6>
                      </div>
                    </div>
                    <Button
                      variant="solid"
                      radius="sm"
                      color="primary"
                      onClick={() => {
                        router.push(`/member/profile/${item?.seller_id}`);
                      }}
                    >
                      Visit User
                    </Button>
                  </div>

                  {/* button option */}
                  <div className="hidden lg:flex gap-2 mt-5 justify-center">
                    <Button
                      variant="bordered"
                      radius="sm"
                      className="bg-[#008B47] text-white w-1/2 py-6"
                      isDisabled={itemInProgress?.progress_status === "sold"}
                      onClick={handleButtonClick}
                    >
                      <p>{buttonText}</p>
                    </Button>
                  </div>
                </div>

                <div
                  className={`${
                    item?.item_selling_type !== "auction" && "hidden"
                  } lg:col-span-2 w-full flex flex-col justify-between py-3 px-2`}
                >
                  <h3 className="font-semibold font-lg">
                    Bidding Offers{" "}
                    <span className="font-normal">({bids.length})</span>
                  </h3>
                  {bids.length === 0 ? (
                    <div className="w-full col-span-full flex justify-center items-center gap-2 h-full">
                      <p className="text-sm">No Offers yet...</p>
                    </div>
                  ) : (
                    bids
                      .slice(0, showAll ? bids.length : 3)
                      .map((offer, index) => {
                        const bidDueDate = new Date(offer.bid_due);
                        const isExpired = bidDueDate < currentDate;
                        const bidStatus = isExpired ? "Expired" : "Active";

                        return (
                          <Badge
                            key={`badge-${index}`}
                            content="Highest Bidder"
                            color="secondary"
                            variant="flat"
                            size="sm"
                            className={`${
                              index !== 0 && "hidden"
                            } mr-7 md:mr-0 mb-1`}
                          >
                            <div
                              key={index}
                              className="w-full flex flex-col my-3"
                            >
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
                                    bidStatus === "Active"
                                      ? "text-green-500"
                                      : "text-orange-500"
                                  }`}
                                >
                                  {bidStatus}
                                </h6>
                              </div>
                              <hr />
                            </div>
                          </Badge>
                        );
                      })
                  )}
                  <div
                    className={`flex justify-center ${
                      bids.length <= 3 && "hidden"
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
                {/* Other products suggestion */}
                {/* <div className="w-full col-span-2 hidden lg:flex flex-col justify-center gap-3">
                  <h3 className="text-center text-lg">You may also like</h3>
                  <div className="w-full grid grid-cols-7 gap-3 justify-center">
                    {items.length !== 0 &&
                      items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setIsLoading(true);
                            router.push(`/member/explore/${item.item_id}`);
                            setIsLoading(false);
                          }}
                        >
                          <Card className="rounded-md shadow-none">
                            <CardBody className="p-0 w-full">
                              <Image
                                alt="Card background"
                                className="object-cover rounded-none w-full rounded-b-md aspect-square"
                                src={
                                  item.image_urls && item.image_urls.length > 0
                                    ? item.image_urls[0]
                                    : "https://fakeimg.pl/500x500?text=img&font=bebas"
                                }
                              />
                            </CardBody>
                            <CardFooter className="py-1 px-0 flex-col items-start rounded-none">
                              <div className="w-full flex justify-between">
                                <p className="font-semibold text-sm truncate">
                                  {item.item_name}
                                </p>
                                <div className="flex gap-1">
                                  {item.item_selling_type === "sell" ? (
                                    <MdOutlineSell size={20} />
                                  ) : (
                                    <RiAuctionLine size={20} />
                                  )}
                                </div>
                              </div>
                              <h4 className="font-semibold text-medium text-[#008B47]">
                                <span className="text-small">₱</span>
                                {parseFloat(item.item_price).toFixed(2)}
                              </h4>
                            </CardFooter>
                          </Card>
                        </div>
                      ))}
                  </div>
                </div> */}
              </div>
            </div>

            {/* footer: sticky */}
            <div className="absolute lg:hidden bottom-0 w-full z-50 shadow-lg bg-white">
              <div className="max-w-6xl mx-auto flex justify-around items-center gap-5 px-2 border-t-3 py-1">
                <button
                  className="flex flex-col items-center"
                  onClick={() => {
                    router.push(`/member/profile/${item?.seller_id}`);
                  }}
                >
                  <Avatar
                    src={item.seller_profile_picture}
                    className="w-7 h-7 text-sm"
                    disableAnimation
                  />
                  <h6 className="text-xs">Seller</h6>
                </button>
                <Button
                  variant="bordered"
                  radius="sm"
                  fullWidth
                  className="bg-[#008B47] text-white py-6"
                  isDisabled={itemInProgress?.progress_status === "sold"}
                  onClick={handleButtonClick}
                >
                  <p>{buttonText}</p>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ExploreItem;
