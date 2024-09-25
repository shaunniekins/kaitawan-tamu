"use client";

import { RootState } from "@/app/reduxUtils/store";
import useItemInventory from "@/hooks/useItemInventory";
import {
  Card,
  CardBody,
  CardFooter,
  Chip,
  Image,
  Spinner,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ListingHeader from "./headers/ListingHeader";
import { MdOutlineSell } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";

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

  return (
    <div className="w-full h-full flex flex-col items-center">
      <ListingHeader />
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner color="success" />
        </div>
      )}
      {!isLoading && (
        <div className="w-full flex flex-col flex-grow">
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
                                item.item_status === "active"
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
