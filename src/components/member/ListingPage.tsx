"use client";

import { RootState } from "@/app/reduxUtils/store";
import useItemInventory from "@/hooks/useItemInventory";
import {
  Card,
  CardBody,
  CardFooter,
  Chip,
  Image,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdDeleteOutline, MdOutlineSell } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import { deleteItemInventoryData } from "@/app/api/itemInventoryIUD";
import { checkerPurchaseItemStatusByUser } from "@/app/api/checkers";
import { deleteInProgressPurchaseData } from "@/app/api/inProgressPurchasesIUD";

const ListingPage = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("offer");
  const [isLoading, setIsLoading] = useState(false);

  const rowsPerPage = 200;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { items, loadingItems, errorItems } = useItemInventory(
    rowsPerPage,
    currentPage,
    "sold",
    activeTab === "sold" ? true : false,
    user?.id,
    true,
    undefined
  );

  useEffect(() => {
    setIsLoading(loadingItems);
  }, [loadingItems]);

  const tabs = [
    { id: "offer", label: "Offer" },
    { id: "sold", label: "Sold" },
  ];

  const [currentItemId, setCurrentItemId] = useState<number | null>(null);

  const handleItemDelete = async () => {
    if (currentItemId) {
      const statusResponse = await checkerPurchaseItemStatusByUser(
        currentItemId
      );

      if (
        statusResponse &&
        statusResponse.data &&
        statusResponse.data.length > 0
      ) {
        let inProgressId = statusResponse.data[0]?.in_progress_id;
        const statusData = statusResponse.data;
        const progressStatus = statusData[0]?.progress_status;

        if (progressStatus === "pending") {
          alert("The item is in a pending transaction.");
        } else {
          const response = await deleteItemInventoryData(currentItemId);
          if (response) {
            await deleteInProgressPurchaseData(inProgressId);
            setCurrentItemId(null);
          }
        }
      } else {
        console.log("No status data found or statusResponse is null");
      }
    }
  };
  return (
    <div className="w-full h-full flex flex-col items-center">
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner color="success" />
        </div>
      )}
      {!isLoading && (
        <div className="w-full flex flex-col flex-grow mt-5">
          {/* <div className="w-full flex-col"> */}
          <div className="w-full flex flex-col">
            <Tabs
              aria-label="Dynamic tabs"
              items={tabs}
              color="success"
              variant="underlined"
              fullWidth
              selectedKey={activeTab}
              radius="none"
              onSelectionChange={(key) => setActiveTab(key.toString())}
            >
              {tabs.map((tab) => (
                <Tab key={tab.id} title={tab.label}>
                  {items.length === 0 ? (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <p className="text-gray-500">No items available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                      {items.map((item) => (
                        <Card
                          key={item.item_id}
                          className="rounded-none bg-none shadow-none"
                        >
                          <CardBody className="p-0 w-full">
                            <Popover
                              showArrow
                              placement="right"
                              isOpen={currentItemId === item.item_id}
                              onOpenChange={(open) => {
                                if (open) {
                                  setCurrentItemId(item.item_id);
                                } else {
                                  setCurrentItemId(null);
                                }
                              }}
                            >
                              <div className="relative group">
                                <Image
                                  alt="Product Image"
                                  className={`${
                                    isLoading && "h-56 w-56"
                                  } object-cover rounded-none w-full rounded-b-md aspect-square`}
                                  src={
                                    isLoading
                                      ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                                      : item.image_urls &&
                                        item.image_urls.length > 0
                                      ? item.image_urls[0].url.endsWith(".mp4")
                                        ? item.image_urls.length > 1
                                          ? item.image_urls[1].url
                                          : "https://fakeimg.pl/500x500?text=img&font=bebas"
                                        : item.image_urls[0].url
                                      : "https://fakeimg.pl/500x500?text=img&font=bebas"
                                  }
                                />
                                <PopoverTrigger>
                                  <div
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full p-2 hover:bg-green-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentItemId(item.item_id);
                                    }}
                                  >
                                    <BsThreeDotsVertical />
                                  </div>
                                </PopoverTrigger>
                              </div>

                              <PopoverContent className="p-3 flex flex-col items-start gap-3">
                                <button
                                  className="flex items-center gap-2 text-md cursor-pointer"
                                  onClick={handleItemDelete}
                                >
                                  <MdDeleteOutline className="text-lg" />
                                  <span>Delete</span>
                                </button>
                              </PopoverContent>
                            </Popover>
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
                            <h4 className="font-semibold text-medium">
                              <span className="text-small">₱</span>
                              {parseFloat(item.item_price).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </h4>
                            <h6
                              className={`text-xs uppercase ${
                                item.item_status === "approved"
                                  ? "text-green-500"
                                  : item.item_status === "pending"
                                  ? "text-gray-500"
                                  : item.item_status === "sold"
                                  ? "text-purple-500"
                                  : ""
                              }`}
                            >
                              {item.item_status}
                            </h6>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </Tab>
              ))}
            </Tabs>
            {/* </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingPage;
