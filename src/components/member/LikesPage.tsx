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
import { MdOutlineSell } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import useLikedItems from "@/hooks/useLikedItems";

const LikesPage = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const { likedItems, loadingLikedItems, totalLikedItems, errorLikedItems } =
    useLikedItems(user?.id);

  useEffect(() => {
    setIsLoading(loadingLikedItems);
  }, [loadingLikedItems]);

  //   useEffect(() => {
  //     console.log("items", items);
  //   }, [items]);

  return (
    <>
      <div className="w-full h-full flex flex-col items-center">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Spinner color="success" />
          </div>
        )}
        {!isLoading && likedItems && (
          <>
            <div className="w-full flex flex-col flex-grow overflow-y-auto mt-5">
              <div className="h-full px-2 overflow-y-auto relative">
                {likedItems.length === 0 ? (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <p className="text-gray-500 text-center">
                      You haven&apos;t liked anything yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                    {likedItems.map((item: any) => (
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

export default LikesPage;
