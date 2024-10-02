"use client";

import { RootState } from "@/app/reduxUtils/store";
import useSellerUsers from "@/hooks/useSellerUsers";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Avatar,
  Card,
  CardBody,
  CardFooter,
  Image,
  Spinner,
} from "@nextui-org/react";
import SellerProfileItemHeader from "./headers/SellerProfileItemHeader";
import useItemInventory from "@/hooks/useItemInventory";
import useSellerItemInventory from "@/hooks/useSellerItemInventory";
import { MdOutlineSell } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";

interface SellerProfileProps {
  user_id: string;
}

const SellerProfile = ({ user_id }: SellerProfileProps) => {
  const user = useSelector((state: RootState) => state.user.user);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);

  const rowsPerPage = 200;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { items, loadingItems, totalItems, errorItems } =
    useSellerItemInventory(user_id);

  const { sellerData, loadingSeller, errorSeller, fetchSeller } =
    useSellerUsers(user_id);

  useEffect(() => {
    setIsLoading(loadingSeller);
    setSeller(sellerData);
    console.log("items", items);
  }, [loadingSeller]);

  //   useEffect(() => {
  //     console.log("items", items);
  //   }, [items]);

  return (
    <>
      <div className="w-full h-full flex flex-col items-center">
        <SellerProfileItemHeader />
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Spinner color="success" />
          </div>
        )}
        {!isLoading && sellerData && (
          <>
            <div className="w-full flex flex-col flex-grow overflow-y-auto">
              <header className="bg-[#008B47] py-2 px-2 w-full flex items-center justify-center shadow-md">
                <div className="w-full max-w-6xl flex justify-start items-center gap-3 h-24 py-2">
                  <Avatar
                    src={seller.profile_picture}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover cursor-pointer"
                  />
                  <div className="flex flex-col text-white truncate">
                    <h1 className="text-3xl font-semibold font-sans truncate">
                      {`${seller.first_name || ""} ${
                        seller.last_name || ""
                      }`.trim() || "Loading..."}
                    </h1>
                    <h2 className="text-xs truncate">
                      {seller.email || "Loading..."}
                    </h2>
                  </div>
                </div>
              </header>
              <div className="h-full px-2 overflow-y-auto relative">
                <h3 className="font-semibold text-lg pt-5 pb-4">Seller List Items</h3>
                {items.length === 0 ? (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <p className="text-gray-500">No items available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                    {items.map((item: any) => (
                      <div
                        key={item.item_id}
                        onClick={() => {
                          setIsLoading(true);
                          return router.push(`/member/explore/${item.item_id}`);
                        }}
                      >
                        <Card className="rounded-none bg-none shadow-none">
                          <CardBody className="p-0 w-full">
                            <Image
                              alt="Item Image"
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
                                item.item_status === "approved"
                                  ? "text-green-500"
                                  : item.item_status === "pending"
                                  ? "text-gray-500"
                                  : item.item_status === "sold"
                                  ? "text-purple-500"
                                  : ""
                              }`}
                            >
                              {item.item_status === "approved"
                                ? "Available"
                                : item.item_status}
                            </h6>
                          </CardFooter>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SellerProfile;
