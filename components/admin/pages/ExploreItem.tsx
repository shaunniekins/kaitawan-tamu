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
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IoChevronBack, IoChevronDown, IoChevronUp } from "react-icons/io5";
import ExploreItemHeader from "../headers/ExploreItemHeader";
import { fetchItemInventoryDataByItem } from "@/app/api/itemInventoryData";
import {
  fetchBiddingTransactionDataPerItem,
  insertBiddingTransactionData,
} from "@/app/api/biddingTransactionData";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  CalendarDate,
  CalendarDateTime,
  getLocalTimeZone,
  today,
} from "@internationalized/date";

interface ExploreItemProps {
  item_id: number;
}

const ExploreItem = ({ item_id }: ExploreItemProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [exploreItem, setExploreItem] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [openBidModal, setOpenBidModal] = useState(false);
  const [newBidPrice, setNewBidPrice] = useState<number>(0);
  const [newBidDue, setNewBidDue] = useState(
    today(getLocalTimeZone()).add({ days: 1 }).toString()
  );

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
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [item_id, setExploreItem]);

  useEffect(() => {
    memoizedFetchItemInventoryDataByItem();
  }, [item_id, memoizedFetchItemInventoryDataByItem]);

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
        setOffers(response?.data ?? []);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [item_id, setOffers]);

  useEffect(() => {
    memoizedFetchBiddingTransactionDataPerItem();
  }, [item_id, memoizedFetchBiddingTransactionDataPerItem]);

  const handleInsertBiddingTransactionData = async () => {
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

    const result = await insertBiddingTransactionData(data);
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

  const userHasBid = offers.some((offer) => offer.bidder_id === user?.id);

  return (
    <>
      <ExploreItemHeader />
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
                  onChange={(e) => setNewBidPrice(Number(e.target.value))}
                  startContent={
                    <p className="text-xs font-semibold text-gray-500">PHP</p>
                  }
                />
                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                  <DateInput
                    label={"Bid Until"}
                    granularity="day"
                    minValue={today(getLocalTimeZone())}
                    defaultValue={today(getLocalTimeZone()).add({ days: 1 })}
                    placeholderValue={new CalendarDate(1995, 11, 6)}
                    onChange={(value) => setNewBidDue(value.toString())}
                    className="max-w-sm"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={handleInsertBiddingTransactionData}
                >
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="main-container justify-start">
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
                PHP {exploreItem[0]?.item_price}
              </h2>
              <Chip color="primary">{exploreItem[0]?.item_category}</Chip>
            </div>
            <h3 className="font-semibold text-xl">
              {exploreItem[0]?.item_name}
            </h3>
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
                color="danger"
                onClick={() => {}}
              >
                Visit User
              </Button>
            </div>
          </div>
          {/* modify bidding to arrange with highest amount, then time */}
          <div className="w-full bg-gray-50 flex flex-col justify-between py-3 px-2">
            <h3 className="font-semibold font-lg">
              Bidding Offers{" "}
              <span className="font-normal">({offers.length})</span>
            </h3>
            {offers.length === 0 ? (
              <div className="w-full col-span-full flex justify-center items-center gap-2 h-full">
                <p className="text-sm">No offers yet...</p>
                <Button
                  color="secondary"
                  variant="shadow"
                  size="sm"
                  onClick={() => {
                    setOpenBidModal(true);
                  }}
                >
                  Offer a bid now!
                </Button>
              </div>
            ) : (
              offers
                .slice(0, showAll ? offers.length : 3)
                .map((offer, index) => (
                  <Badge
                    key={`badge-${index}`}
                    content="Highest Bidder"
                    color="secondary"
                    variant="flat"
                    size="sm"
                    className={`${index !== 0 && "hidden"} mr-7 md:mr-0 mb-10`}
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
                            : `${offer.bidder_first_name} ${offer.bidder_last_name}`}
                        </h6>
                        <h6
                          className={`text-xs ${
                            offer.status === "active"
                              ? "text-green-500"
                              : offer.status === "expired"
                              ? "text-orange-500"
                              : "text-red-500"
                          }`}
                        >
                          {offer.status.charAt(0).toUpperCase() +
                            offer.status.slice(1)}
                        </h6>
                      </div>
                      <hr />
                    </div>
                  </Badge>
                ))
            )}
            <div
              className={`flex justify-center ${
                offers.length <= 3 && "hidden"
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
      </div>
      {/* footer */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-around items-center gap-5 px-2 border-t-3 py-1">
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
              color="primary"
              fullWidth
              onClick={() => {
                setOpenBidModal(true);
              }}
            >
              {userHasBid ? "Update Bid" : "Offer Bid"}
            </Button>
            <Button
              variant="solid"
              radius="sm"
              color="danger"
              fullWidth
              onClick={() => {}}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExploreItem;
